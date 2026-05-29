<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/public.php';

$pdo = finready_db();
$courses = $pdo->query('SELECT * FROM course_catalog WHERE is_published = 1 ORDER BY display_order ASC, id DESC')->fetchAll();

$coursePricing = [];
$courseSlugs = [];
foreach ($courses as $courseRow) {
    $slug = trim((string) ($courseRow['slug'] ?? ''));
    if ($slug !== '') {
        $courseSlugs[$slug] = true;
    }
}
if (count($courseSlugs) > 0) {
    $slugList = array_keys($courseSlugs);
    $placeholderSql = implode(', ', array_fill(0, count($slugList), '?'));
    $stmt = $pdo->prepare(
        'SELECT item_slug, monthly_price_usd, quarterly_price_usd, annual_price_usd
         FROM catalog_pricing
         WHERE item_type = \'course\' AND item_slug IN (' . $placeholderSql . ')'
    );
    $stmt->execute($slugList);
    foreach ($stmt->fetchAll() as $priceRow) {
        $rowSlug = trim((string) ($priceRow['item_slug'] ?? ''));
        if ($rowSlug === '') {
            continue;
        }
        $coursePricing[$rowSlug] = [
            'monthly' => max(0, (int) ($priceRow['monthly_price_usd'] ?? 0)),
            'quarterly' => max(0, (int) ($priceRow['quarterly_price_usd'] ?? 0)),
            'annual' => max(0, (int) ($priceRow['annual_price_usd'] ?? 0)),
        ];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinReady | AI Finance Courses and Certifications</title>
    <meta name="description" content="Browse FinReady financial literacy and AI upskilling courses for students, professionals, and enterprise teams." />
    <link rel="icon" type="image/svg+xml" href="<?php echo fr_h(fr_url('assets/images/favicon.svg')); ?>" />
    <link rel="stylesheet" href="<?php echo fr_h(fr_url('assets/css/styles.css?v=20260333')); ?>" />
  </head>
  <body data-page="courses">
    <a class="skip-link" href="#mainContent">Skip to content</a>
    <div data-site-header></div>

    <main id="mainContent">
      <section class="page-hero">
        <div class="container split-hero">
          <div>
            <span class="eyebrow">AI Training & Certifications</span>
            <h1>Role-Based Learning Paths for Finance Teams</h1>
            <p>Discover practical tracks for students, analysts, managers, and enterprise leaders, with verifiable credentials and guided progression.</p>
            <div class="hero-cta" style="margin-top: 14px">
              <a class="btn btn-primary" href="<?php echo fr_h(fr_url('register')); ?>">Create Free Account</a>
              <a class="btn btn-outline" href="<?php echo fr_h(fr_url('certifications')); ?>">View Certification Hub</a>
            </div>
          </div>
          <div class="card" style="padding: 18px">
            <img src="<?php echo fr_h(fr_url('assets/images/course-hub.svg')); ?>" width="1000" height="640" alt="Course hub preview" style="border-radius: 14px; margin-bottom: 12px" />
            <label for="courseSearch" class="muted">Search courses</label>
            <input id="courseSearch" type="search" placeholder="Search courses..." />
            <div style="margin-top: 12px">
              <label for="courseSort" class="muted">Sort by</label>
              <select id="courseSort">
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="highest">Highest Rated</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top: 24px">
        <div class="container two-col">
          <aside class="filter-sidebar" aria-label="Course filters">
            <div class="filter-group">
              <h4>Topic</h4>
              <label class="check-row"><input type="checkbox" data-filter-group="topic" value="fundamentals" />AI Fundamentals</label>
              <label class="check-row"><input type="checkbox" data-filter-group="topic" value="accounting" />AI for Accounting</label>
              <label class="check-row"><input type="checkbox" data-filter-group="topic" value="risk" />ML for Risk</label>
              <label class="check-row"><input type="checkbox" data-filter-group="topic" value="prompt" />Prompt Engineering</label>
              <label class="check-row"><input type="checkbox" data-filter-group="topic" value="analytics" />Data Analytics</label>
            </div>

            <div class="filter-group">
              <h4>Level</h4>
              <label class="check-row"><input type="checkbox" data-filter-group="level" value="beginner" />Beginner</label>
              <label class="check-row"><input type="checkbox" data-filter-group="level" value="intermediate" />Intermediate</label>
              <label class="check-row"><input type="checkbox" data-filter-group="level" value="advanced" />Advanced</label>
            </div>

            <div class="filter-group">
              <h4>Duration</h4>
              <label class="check-row"><input type="checkbox" data-filter-group="duration" value="short" />Under 2 hrs</label>
              <label class="check-row"><input type="checkbox" data-filter-group="duration" value="mid" />2-10 hrs</label>
              <label class="check-row"><input type="checkbox" data-filter-group="duration" value="long" />10+ hrs</label>
            </div>

            <div class="filter-group">
              <h4>Format</h4>
              <label class="check-row"><input type="checkbox" data-filter-group="format" value="selfpaced" />Self-paced</label>
              <label class="check-row"><input type="checkbox" data-filter-group="format" value="cohort" />Cohort</label>
              <label class="check-row"><input type="checkbox" data-filter-group="format" value="live" />Live</label>
            </div>

            <div class="filter-group">
              <h4>Certification</h4>
              <label class="check-row"><input type="checkbox" data-filter-group="cert" value="finready" />FinReady Cert</label>
              <label class="check-row"><input type="checkbox" data-filter-group="cert" value="university" />University</label>
              <label class="check-row"><input type="checkbox" data-filter-group="cert" value="cpe" />CPE Credits</label>
            </div>

            <button id="clearFilters" class="btn btn-outline" type="button" style="width: 100%">Clear Filters</button>
          </aside>

          <div>
            <div class="courses-grid" id="coursesGrid">
              <?php foreach ($courses as $index => $course): ?>
                <?php
                  $durationBucket = (string) ($course['duration_bucket'] ?: fr_duration_bucket_from_hours((int) $course['duration_hours']));
                  $level = strtolower((string) $course['level']);
                  $slug = (string) $course['slug'];
                  $pricing = $coursePricing[$slug] ?? fr_pricing_options_for_item(
                      $pdo,
                      'course',
                      $slug,
                      (int) ($course['price_usd'] ?? 0),
                      (string) ($course['title'] ?? '')
                  );
                  $addToPlanHref = fr_url('pricing.php?add=course:' . rawurlencode($slug) . '#customPlanBuilder');
                ?>
                <article
                  class="course-filter-card card course-card <?php echo $index >= 5 ? 'extra-course hidden' : ''; ?>"
                  data-topic="<?php echo fr_h((string) $course['topic']); ?>"
                  data-level="<?php echo fr_h($level); ?>"
                  data-duration="<?php echo fr_h($durationBucket); ?>"
                  data-format="<?php echo fr_h((string) $course['format']); ?>"
                  data-cert="<?php echo fr_h((string) $course['cert_type']); ?>"
                  data-rating="<?php echo fr_h((string) $course['rating']); ?>"
                  data-enroll="<?php echo fr_h((string) $course['enroll_count']); ?>"
                  data-year="<?php echo fr_h((string) $course['release_year']); ?>"
                  data-price="<?php echo fr_h((string) $course['price_usd']); ?>"
                >
                  <div class="course-thumb"></div>
                  <div class="course-content">
                    <div class="meta-row">
                      <span class="<?php echo fr_h(fr_course_level_badge($level)); ?>"><?php echo fr_h(ucfirst($level)); ?></span>
                      <span class="muted"><?php echo (int) $course['duration_hours']; ?> hrs</span>
                    </div>
                    <h3><?php echo fr_h((string) $course['title']); ?></h3>
                    <p><?php echo fr_h((string) $course['instructor']); ?></p>
                    <div class="meta-row">
                      <span class="rating"><?php echo fr_h(fr_stars((float) $course['rating'])); ?> <?php echo fr_h((string) $course['rating']); ?></span>
                      <span class="muted">(<?php echo fr_h((string) $course['enroll_count']); ?>)</span>
                    </div>
                    <div class="price-matrix">
                      <span class="price-chip"><small>Monthly</small><strong><?php echo fr_h(fr_format_price((int) ($pricing['monthly'] ?? 0))); ?></strong></span>
                      <span class="price-chip"><small>Quarterly</small><strong><?php echo fr_h(fr_format_price((int) ($pricing['quarterly'] ?? 0))); ?></strong></span>
                      <span class="price-chip"><small>Annual</small><strong><?php echo fr_h(fr_format_price((int) ($pricing['annual'] ?? 0))); ?></strong></span>
                    </div>
                    <div class="card-action-row">
                      <a class="btn btn-primary" href="<?php echo fr_h(fr_url('course-detail.php?slug=' . rawurlencode($slug))); ?>">Enroll</a>
                      <a class="btn btn-outline" href="<?php echo fr_h($addToPlanHref); ?>">Add to Custom Plan</a>
                    </div>
                  </div>
                </article>
              <?php endforeach; ?>
            </div>

            <div class="empty-state" id="courseEmptyState">No courses match your filters yet. Try clearing filters.</div>

            <div style="margin-top: 24px; text-align: center">
              <button id="loadMoreCourses" class="btn btn-outline" type="button">Load More</button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div data-site-footer></div>
    <script src="<?php echo fr_h(fr_url('assets/js/main.js?v=20260324')); ?>"></script>
  </body>
</html>
