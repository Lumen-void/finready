<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/public.php';

$pdo = finready_db();
$tools = $pdo->query('SELECT * FROM tool_catalog WHERE is_active = 1 ORDER BY display_order ASC, id DESC')->fetchAll();

$toolPricing = [];
$toolSlugs = [];
foreach ($tools as $toolRow) {
    $slug = trim((string) ($toolRow['slug'] ?? ''));
    if ($slug !== '') {
        $toolSlugs[$slug] = true;
    }
}
if (count($toolSlugs) > 0) {
    $slugList = array_keys($toolSlugs);
    $placeholderSql = implode(', ', array_fill(0, count($slugList), '?'));
    $stmt = $pdo->prepare(
        'SELECT item_slug, monthly_price_usd, quarterly_price_usd, annual_price_usd
         FROM catalog_pricing
         WHERE item_type = \'tool\' AND item_slug IN (' . $placeholderSql . ')'
    );
    $stmt->execute($slugList);
    foreach ($stmt->fetchAll() as $priceRow) {
        $rowSlug = trim((string) ($priceRow['item_slug'] ?? ''));
        if ($rowSlug === '') {
            continue;
        }
        $toolPricing[$rowSlug] = [
            'monthly' => max(0, (int) ($priceRow['monthly_price_usd'] ?? 0)),
            'quarterly' => max(0, (int) ($priceRow['quarterly_price_usd'] ?? 0)),
            'annual' => max(0, (int) ($priceRow['annual_price_usd'] ?? 0)),
        ];
    }
}

$availableCategories = [];
foreach ($tools as $tool) {
    $availableCategories[strtolower((string) $tool['category'])] = true;
}
$categoryOrder = ['forecasting', 'analysis', 'compliance', 'budgeting', 'tax', 'payroll', 'recruitment', 'operations'];
$categoryTabs = [];
foreach ($categoryOrder as $category) {
    if (isset($availableCategories[$category])) {
        $categoryTabs[] = $category;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinReady | AI Finance Tools</title>
    <meta name="description" content="Explore FinReady AI tools for forecasting, payroll, compliance, recruitment, budgeting, tax readiness, and financial literacy coaching." />
    <link rel="icon" type="image/svg+xml" href="<?php echo fr_h(fr_url('assets/images/favicon.svg')); ?>" />
    <link rel="stylesheet" href="<?php echo fr_h(fr_url('assets/css/styles.css?v=20260333')); ?>" />
  </head>
  <body data-page="ai-tools">
    <a class="skip-link" href="#mainContent">Skip to content</a>
    <div data-site-header></div>

    <main id="mainContent">
      <section class="page-hero">
        <div class="container split-hero">
          <div>
            <span class="eyebrow">AI Finance Tools</span>
            <h1>Operational AI for Finance, Payroll, and Hiring</h1>
            <p>Deploy modular AI copilots across forecasting, compliance, workforce planning, and financial literacy enablement.</p>
            <div class="hero-cta" style="margin-top: 16px">
              <a class="btn btn-primary" href="<?php echo fr_h(fr_url('book-demo')); ?>">Book Product Demo</a>
              <a class="btn btn-outline" href="<?php echo fr_h(fr_url('pricing')); ?>">View Pricing</a>
            </div>
          </div>
          <div>
            <img src="<?php echo fr_h(fr_url('assets/images/ai-suite.svg')); ?>" width="1000" height="640" alt="AI tools suite overview" style="border-radius: 16px" />
            <div style="margin-top: 14px">
              <label for="toolSearch" class="muted">Search tools</label>
              <input id="toolSearch" class="search-input" type="search" placeholder="Search tools..." />
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top: 26px">
        <div class="container">
          <div class="tab-row" role="tablist" aria-label="Tool categories">
            <button class="tab-btn active" data-filter="all" type="button">All Tools</button>
            <?php foreach ($categoryTabs as $category): ?>
              <button class="tab-btn" data-filter="<?php echo fr_h($category); ?>" type="button"><?php echo fr_h(fr_humanize($category)); ?></button>
            <?php endforeach; ?>
          </div>

          <div class="tool-grid" id="literacy">
            <?php foreach ($tools as $tool): ?>
              <?php
                $slug = (string) $tool['slug'];
                $category = strtolower((string) $tool['category']);
                $iconCode = strtoupper((string) ($tool['icon_code'] ?: 'AI'));
                $launchHref = fr_url('tool-launch.php?slug=' . rawurlencode($slug));
                $pricing = $toolPricing[$slug] ?? fr_pricing_options_for_item(
                    $pdo,
                    'tool',
                    $slug,
                    finready_default_tool_monthly_price((string) ($tool['plan_tier'] ?? 'pro')),
                    (string) ($tool['name'] ?? '')
                );
                $addToPlanHref = fr_url('pricing.php?add=tool:' . rawurlencode($slug) . '#customPlanBuilder');
              ?>
              <article class="card tool-card" data-category="<?php echo fr_h($category); ?>">
                <div class="top">
                  <div>
                    <span class="icon-wrap"><?php echo fr_h(substr($iconCode, 0, 2)); ?></span>
                    <h3><?php echo fr_h((string) $tool['name']); ?></h3>
                  </div>
                  <span class="<?php echo fr_h(fr_badge_class((string) $tool['plan_tier'])); ?>"><?php echo fr_h(fr_humanize((string) $tool['plan_tier'])); ?></span>
                </div>
                <p><?php echo fr_h((string) $tool['summary']); ?></p>
                <div class="meta-row">
                  <span class="tag"><?php echo fr_h(fr_humanize($category)); ?></span>
                  <span class="tag"><?php echo fr_h(fr_format_price((int) ($pricing['monthly'] ?? 0))); ?>/mo</span>
                </div>
                <div class="price-matrix">
                  <span class="price-chip"><small>Monthly</small><strong><?php echo fr_h(fr_format_price((int) ($pricing['monthly'] ?? 0))); ?></strong></span>
                  <span class="price-chip"><small>Quarterly</small><strong><?php echo fr_h(fr_format_price((int) ($pricing['quarterly'] ?? 0))); ?></strong></span>
                  <span class="price-chip"><small>Annual</small><strong><?php echo fr_h(fr_format_price((int) ($pricing['annual'] ?? 0))); ?></strong></span>
                </div>
                <div class="card-action-row">
                  <a class="btn btn-secondary" href="<?php echo fr_h($launchHref); ?>"><?php echo fr_h((string) ($tool['cta_label'] ?: 'Open')); ?></a>
                  <a class="btn btn-outline" href="<?php echo fr_h($addToPlanHref); ?>">Add to Custom Plan</a>
                </div>
              </article>
            <?php endforeach; ?>
          </div>
        </div>
      </section>
    </main>

    <div data-site-footer></div>
    <script src="<?php echo fr_h(fr_url('assets/js/main.js?v=20260324')); ?>"></script>
  </body>
</html>
