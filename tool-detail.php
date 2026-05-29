<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/public.php';

$pdo = finready_db();
$slug = isset($_GET['slug']) ? trim((string) $_GET['slug']) : '';

if ($slug !== '') {
    $stmt = $pdo->prepare('SELECT * FROM tool_catalog WHERE slug = :slug LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    $tool = $stmt->fetch();
} else {
    $tool = $pdo->query('SELECT * FROM tool_catalog WHERE is_active = 1 ORDER BY display_order ASC, id DESC LIMIT 1')->fetch();
}

if (!$tool) {
    http_response_code(404);
    echo 'Tool not found.';
    exit;
}

$toolSlug = (string) ($tool['slug'] ?? '');
$pricingOptions = fr_pricing_options_for_item(
    $pdo,
    'tool',
    $toolSlug,
    finready_default_tool_monthly_price((string) ($tool['plan_tier'] ?? 'pro')),
    (string) ($tool['name'] ?? '')
);
$addToPlanHref = fr_url('pricing.php?add=tool:' . rawurlencode($toolSlug) . '#customPlanBuilder');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?php echo fr_h((string) $tool['name']); ?> | FinReady</title>
  <link rel="stylesheet" href="<?php echo fr_h(fr_url('assets/css/styles.css?v=20260333')); ?>" />
</head>
<body data-page="tool-detail">
  <a class="skip-link" href="#mainContent">Skip to content</a>
  <div data-site-header></div>

  <main id="mainContent" class="section detail-page">
    <div class="container detail-two-col">
      <article class="card detail-card-main">
        <span class="eyebrow"><?php echo fr_h(fr_humanize((string) $tool['category'])); ?></span>
        <h1><?php echo fr_h((string) $tool['name']); ?></h1>
        <p><?php echo fr_h((string) $tool['summary']); ?></p>

        <div class="meta-row detail-meta-row">
          <span class="tag"><?php echo fr_h(fr_humanize((string) $tool['tool_type'])); ?></span>
          <span class="<?php echo fr_h(fr_badge_class((string) $tool['plan_tier'])); ?>"><?php echo fr_h(fr_humanize((string) $tool['plan_tier'])); ?></span>
        </div>

        <h2>Capabilities</h2>
        <ul>
          <li>Structured workflow inputs</li>
          <li>Auto-generated finance insights</li>
          <li>Export-ready operational outputs</li>
          <li>Admin-managed launch routing</li>
        </ul>
      </article>

      <aside class="card detail-card-side">
        <h3>Run Tool</h3>
        <p class="muted">Launch path is fully controlled from Admin Panel.</p>
        <p class="detail-price"><?php echo fr_h(fr_format_price((int) ($pricingOptions['monthly'] ?? 0))); ?>/mo</p>
        <div class="price-matrix detail-price-matrix">
          <span class="price-chip"><small>Monthly</small><strong><?php echo fr_h(fr_format_price((int) ($pricingOptions['monthly'] ?? 0))); ?></strong></span>
          <span class="price-chip"><small>Quarterly</small><strong><?php echo fr_h(fr_format_price((int) ($pricingOptions['quarterly'] ?? 0))); ?></strong></span>
          <span class="price-chip"><small>Annual</small><strong><?php echo fr_h(fr_format_price((int) ($pricingOptions['annual'] ?? 0))); ?></strong></span>
        </div>
        <div class="detail-action-stack">
          <a class="btn btn-primary" href="<?php echo fr_h(fr_url('tool-launch.php?slug=' . rawurlencode((string) $tool['slug']))); ?>"><?php echo fr_h((string) ($tool['cta_label'] ?: 'Open Tool')); ?></a>
          <a class="btn btn-outline" href="<?php echo fr_h($addToPlanHref); ?>">Add to Custom Plan</a>
          <a class="btn btn-outline" href="<?php echo fr_h(fr_url('ai-tools')); ?>">Back to Tools</a>
        </div>
      </aside>
    </div>
  </main>

  <div data-site-footer></div>
  <script src="<?php echo fr_h(fr_url('assets/js/main.js?v=20260324')); ?>"></script>
</body>
</html>
