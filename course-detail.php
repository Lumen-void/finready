<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/public.php';

$pdo = finready_db();
$slug = isset($_GET['slug']) ? trim((string) $_GET['slug']) : '';

if ($slug !== '') {
    $stmt = $pdo->prepare('SELECT * FROM course_catalog WHERE slug = :slug LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    $course = $stmt->fetch();
} else {
    $course = $pdo->query('SELECT * FROM course_catalog WHERE is_published = 1 ORDER BY display_order ASC, id DESC LIMIT 1')->fetch();
}

if (!$course) {
    http_response_code(404);
    echo 'Course not found.';
    exit;
}

$courseLevel = ucfirst((string) $course['level']);
$courseSlug = (string) ($course['slug'] ?? '');
$pricingOptions = fr_pricing_options_for_item(
    $pdo,
    'course',
    $courseSlug,
    (int) ($course['price_usd'] ?? 0),
    (string) ($course['title'] ?? '')
);
$addToPlanHref = fr_url('pricing.php?add=course:' . rawurlencode($courseSlug) . '#customPlanBuilder');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?php echo fr_h((string) $course['title']); ?> | FinReady</title>
  <link rel="stylesheet" href="<?php echo fr_h(fr_url('assets/css/styles.css?v=20260333')); ?>" />
</head>
<body data-page="course-detail">
  <a class="skip-link" href="#mainContent">Skip to content</a>
  <div data-site-header></div>

  <main id="mainContent" class="section detail-page">
    <div class="container detail-two-col">
      <article class="card detail-card-main">
        <span class="eyebrow"><?php echo fr_h(fr_humanize((string) $course['topic'])); ?></span>
        <h1><?php echo fr_h((string) $course['title']); ?></h1>
        <p><?php echo fr_h((string) $course['summary']); ?></p>

        <div class="meta-row detail-meta-row">
          <span class="<?php echo fr_h(fr_course_level_badge((string) $course['level'])); ?>"><?php echo fr_h($courseLevel); ?></span>
          <span class="tag"><?php echo (int) $course['duration_hours']; ?> hrs</span>
          <span class="tag"><?php echo fr_h(fr_humanize((string) $course['format'])); ?></span>
          <span class="tag"><?php echo fr_h((string) $course['cert_type']); ?></span>
        </div>

        <h2>Syllabus</h2>
        <p>Instructor: <strong><?php echo fr_h((string) $course['instructor']); ?></strong></p>
        <ul>
          <li>Module 1: Foundations and setup</li>
          <li>Module 2: Workflow implementation</li>
          <li>Module 3: Controls and review</li>
          <li>Module 4: Reporting and optimization</li>
        </ul>
      </article>

      <aside class="card detail-card-side">
        <h3>Enrollment</h3>
        <p class="muted">Rating: <?php echo fr_h((string) $course['rating']); ?> / 5 (<?php echo fr_h((string) $course['enroll_count']); ?> learners)</p>
        <p class="detail-price"><?php echo fr_h(fr_format_price((int) ($pricingOptions['monthly'] ?? 0))); ?>/mo</p>
        <div class="price-matrix detail-price-matrix">
          <span class="price-chip"><small>Monthly</small><strong><?php echo fr_h(fr_format_price((int) ($pricingOptions['monthly'] ?? 0))); ?></strong></span>
          <span class="price-chip"><small>Quarterly</small><strong><?php echo fr_h(fr_format_price((int) ($pricingOptions['quarterly'] ?? 0))); ?></strong></span>
          <span class="price-chip"><small>Annual</small><strong><?php echo fr_h(fr_format_price((int) ($pricingOptions['annual'] ?? 0))); ?></strong></span>
        </div>
        <div class="detail-action-stack">
          <a class="btn btn-primary" href="<?php echo fr_h(fr_url('register')); ?>">Enroll Now</a>
          <a class="btn btn-outline" href="<?php echo fr_h($addToPlanHref); ?>">Add to Custom Plan</a>
          <a class="btn btn-outline" href="<?php echo fr_h(fr_url('courses')); ?>">Back to Courses</a>
        </div>
      </aside>
    </div>
  </main>

  <div data-site-footer></div>
  <script src="<?php echo fr_h(fr_url('assets/js/main.js?v=20260324')); ?>"></script>
</body>
</html>
