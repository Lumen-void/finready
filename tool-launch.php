<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/public.php';

$slug = isset($_GET['slug']) ? trim((string) $_GET['slug']) : '';
if ($slug === '') {
    http_response_code(400);
    echo 'Missing tool slug.';
    exit;
}

$pdo = finready_db();
$stmt = $pdo->prepare('SELECT * FROM tool_catalog WHERE slug = :slug LIMIT 1');
$stmt->execute([':slug' => $slug]);
$tool = $stmt->fetch();

if (!$tool) {
    http_response_code(404);
    echo 'Tool not found.';
    exit;
}

$target = '';
$toolType = strtolower((string) ($tool['tool_type'] ?? 'web-app'));
$ctaHref = trim((string) ($tool['cta_href'] ?? ''));
$webPath = trim((string) ($tool['web_path'] ?? ''));
$codeFolder = trim((string) ($tool['code_folder'] ?? ''));

if ($toolType === 'external-link' && $ctaHref !== '') {
    if (str_starts_with($ctaHref, 'http://') || str_starts_with($ctaHref, 'https://')) {
        $target = $ctaHref;
    } elseif (str_starts_with($ctaHref, '/')) {
        $target = fr_url(ltrim($ctaHref, '/'));
    } else {
        $target = $ctaHref;
    }
}

if ($target === '' && $webPath !== '') {
    if (str_starts_with($webPath, 'http://') || str_starts_with($webPath, 'https://')) {
        $target = $webPath;
    } elseif (str_starts_with($webPath, '/')) {
        $target = fr_url(ltrim($webPath, '/'));
    } else {
        $target = fr_url($webPath);
    }
}

if ($target === '' && $codeFolder !== '') {
    $projectRoot = realpath(__DIR__);
    $folderPath = $codeFolder;
    if (!str_starts_with($folderPath, '/')) {
        $folderPath = (string) $projectRoot . '/' . ltrim($folderPath, '/');
    }

    $phpIndex = rtrim($folderPath, '/\\') . '/index.php';
    $htmlIndex = rtrim($folderPath, '/\\') . '/index.html';

    if (is_file($phpIndex)) {
        $resolved = realpath($phpIndex);
        if (is_string($resolved) && is_string($projectRoot) && str_starts_with($resolved, $projectRoot)) {
            $target = fr_url(ltrim(substr($resolved, strlen($projectRoot)), '/'));
        }
    } elseif (is_file($htmlIndex)) {
        $resolved = realpath($htmlIndex);
        if (is_string($resolved) && is_string($projectRoot) && str_starts_with($resolved, $projectRoot)) {
            $target = fr_url(ltrim(substr($resolved, strlen($projectRoot)), '/'));
        }
    }
}

if ($target === '' && $ctaHref !== '') {
    if (str_starts_with($ctaHref, '/')) {
        $target = fr_url(ltrim($ctaHref, '/'));
    } else {
        $target = $ctaHref;
    }
}

if ($target !== '') {
    header('Location: ' . $target);
    exit;
}

http_response_code(404);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tool Not Routed</title>
  <link rel="stylesheet" href="<?php echo fr_h(fr_url('assets/css/styles.css?v=20260333')); ?>" />
</head>
<body>
  <main class="container" style="padding: 32px 0;">
    <h1>Tool route is not configured</h1>
    <p>Set <code>web_path</code> or <code>cta_href</code> for <strong><?php echo fr_h((string) $tool['name']); ?></strong> in the admin panel.</p>
    <p><a class="btn btn-primary" href="<?php echo fr_h(fr_url('admin-panel/tools.php')); ?>">Open Tool Admin</a></p>
  </main>
</body>
</html>
