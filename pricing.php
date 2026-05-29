<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/public.php';
require_once __DIR__ . '/includes/billing.php';

$pdo = finready_db();
$pricingRows = $pdo->query(
    "SELECT item_type, item_slug, item_name, monthly_price_usd, quarterly_price_usd, annual_price_usd, is_active
     FROM catalog_pricing
     WHERE is_active = 1
     ORDER BY item_type ASC, item_name ASC"
)->fetchAll();

$pricingByType = [
    'course' => [],
    'tool' => [],
    'learning_tool' => [],
];
$pricingMap = [];

foreach ($pricingRows as $row) {
    $type = strtolower((string) ($row['item_type'] ?? ''));
    if (!isset($pricingByType[$type])) {
        continue;
    }

    $slug = trim((string) ($row['item_slug'] ?? ''));
    if ($slug === '') {
        continue;
    }

    $normalized = [
        'item_type' => $type,
        'item_slug' => $slug,
        'item_name' => (string) ($row['item_name'] ?? ''),
        'monthly_price_usd' => max(0, (int) ($row['monthly_price_usd'] ?? 0)),
        'quarterly_price_usd' => max(0, (int) ($row['quarterly_price_usd'] ?? 0)),
        'annual_price_usd' => max(0, (int) ($row['annual_price_usd'] ?? 0)),
    ];

    $pricingByType[$type][] = $normalized;
    $pricingMap[$type . ':' . $slug] = $normalized;
}

$activeCoupons = finready_active_coupons($pdo);
$activeTaxRules = finready_active_tax_rules($pdo);

$feedbackType = '';
$feedbackMessage = '';
$createdOrderId = 0;
$createdOrderTotal = 0;
$createdOrderEmail = '';
$createdInvoiceToken = '';
$createdInvoiceNumber = '';
$createdInvoiceEmailStatus = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'create_custom_plan') {
    $customerEmail = trim((string) ($_POST['customer_email'] ?? ''));
    $billingName = trim((string) ($_POST['billing_name'] ?? ''));
    $billingCompany = trim((string) ($_POST['billing_company'] ?? ''));
    $billingCountry = finready_normalize_country_code((string) ($_POST['billing_country'] ?? ''));
    $billingState = finready_normalize_state_code((string) ($_POST['billing_state'] ?? ''));
    $gstNumber = trim((string) ($_POST['gst_number'] ?? ''));
    $taxId = trim((string) ($_POST['tax_id'] ?? ''));
    $phone = trim((string) ($_POST['phone'] ?? ''));
    $couponCodeInput = finready_normalize_coupon_code((string) ($_POST['coupon_code'] ?? ''));
    $isBusinessPurchase = isset($_POST['is_business_purchase']) ? 1 : 0;
    $sendInvoiceNow = isset($_POST['send_invoice_email_now']) ? 1 : 0;
    $notes = trim((string) ($_POST['notes'] ?? ''));
    $selectedRaw = trim((string) ($_POST['selected_items_json'] ?? ''));

    if ($customerEmail === '' || !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        $feedbackType = 'error';
        $feedbackMessage = 'Enter a valid email for this order.';
    } else {
        $decoded = json_decode($selectedRaw, true);
        if (!is_array($decoded)) {
            $feedbackType = 'error';
            $feedbackMessage = 'Could not read selected items. Please try again.';
        } else {
            $validCycles = ['monthly', 'quarterly', 'annual'];
            $selectedItems = [];
            $seenKeys = [];
            $subtotalUsd = 0;

            foreach ($decoded as $entry) {
                if (!is_array($entry)) {
                    continue;
                }

                $type = strtolower(trim((string) ($entry['item_type'] ?? '')));
                $slug = trim((string) ($entry['item_slug'] ?? ''));
                $cycle = strtolower(trim((string) ($entry['billing_cycle'] ?? 'monthly')));

                if (!in_array($cycle, $validCycles, true)) {
                    $cycle = 'monthly';
                }

                $itemKey = $type . ':' . $slug;
                if (!isset($pricingMap[$itemKey])) {
                    continue;
                }
                if (isset($seenKeys[$itemKey])) {
                    continue;
                }

                $priceRow = $pricingMap[$itemKey];
                $priceByCycle = [
                    'monthly' => (int) $priceRow['monthly_price_usd'],
                    'quarterly' => (int) $priceRow['quarterly_price_usd'],
                    'annual' => (int) $priceRow['annual_price_usd'],
                ];
                $cyclePrice = (int) ($priceByCycle[$cycle] ?? 0);

                $selectedItems[] = [
                    'item_type' => $type,
                    'item_slug' => $slug,
                    'item_name' => (string) $priceRow['item_name'],
                    'billing_cycle' => $cycle,
                    'price_usd' => $cyclePrice,
                ];
                $seenKeys[$itemKey] = true;
                $subtotalUsd += $cyclePrice;
            }

            if (count($selectedItems) === 0) {
                $feedbackType = 'error';
                $feedbackMessage = 'Select at least one course or tool to create a custom plan.';
            } else {
                $coupon = finready_find_coupon($pdo, $couponCodeInput, $subtotalUsd, $customerEmail);
                $couponCodeApplied = '';
                $discountUsd = 0;
                if (is_array($coupon)) {
                    $couponCodeApplied = finready_normalize_coupon_code((string) ($coupon['code'] ?? ''));
                    $discountUsd = finready_calculate_coupon_discount($coupon, $subtotalUsd);
                }

                $taxableUsd = max(0, $subtotalUsd - $discountUsd);
                $taxRule = finready_find_tax_rule($pdo, $billingCountry, $billingState);
                $taxRuleCode = '';
                $taxPercent = 0.0;
                if (is_array($taxRule)) {
                    $taxRuleCode = (string) ($taxRule['code'] ?? '');
                    $taxPercent = max(0.0, (float) ($taxRule['rate_percent'] ?? 0));

                    $isReverseCharge = (int) ($taxRule['reverse_charge_on_gst'] ?? 0) === 1;
                    $isGstRule = strtolower((string) ($taxRule['tax_type'] ?? '')) === 'gst';
                    if ($isBusinessPurchase === 1 && $gstNumber !== '' && $isReverseCharge && $isGstRule) {
                        $taxPercent = 0.0;
                    }
                }

                $taxUsd = finready_calculate_tax_amount($taxableUsd, $taxPercent);
                $grandTotalUsd = max(0, $taxableUsd + $taxUsd);

                $cycles = array_values(array_unique(array_map(static fn (array $item): string => (string) $item['billing_cycle'], $selectedItems)));
                $billingMode = count($cycles) === 1 ? $cycles[0] : 'mixed';

                $paymentReference = 'FR-' . gmdate('ymdHis') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));

                $stmt = $pdo->prepare(
                    'INSERT INTO checkout_orders (
                        customer_email, billing_name, billing_company, billing_country, billing_state, gst_number, is_business_purchase,
                        billing_cycle_mode, subtotal_usd, discount_usd, coupon_code, tax_rule_code, tax_percent, tax_usd,
                        grand_total_usd, total_usd, status, payment_reference, items_json, notes, created_at, updated_at
                     ) VALUES (
                        :customer_email, :billing_name, :billing_company, :billing_country, :billing_state, :gst_number, :is_business_purchase,
                        :billing_cycle_mode, :subtotal_usd, :discount_usd, :coupon_code, :tax_rule_code, :tax_percent, :tax_usd,
                        :grand_total_usd, :total_usd, :status, :payment_reference, :items_json, :notes, :created_at, :updated_at
                     )'
                );
                $now = finready_now();
                $stmt->execute([
                    ':customer_email' => $customerEmail,
                    ':billing_name' => $billingName,
                    ':billing_company' => $billingCompany,
                    ':billing_country' => $billingCountry,
                    ':billing_state' => $billingState,
                    ':gst_number' => $gstNumber,
                    ':is_business_purchase' => $isBusinessPurchase,
                    ':billing_cycle_mode' => $billingMode,
                    ':subtotal_usd' => $subtotalUsd,
                    ':discount_usd' => $discountUsd,
                    ':coupon_code' => $couponCodeApplied,
                    ':tax_rule_code' => $taxRuleCode,
                    ':tax_percent' => $taxPercent,
                    ':tax_usd' => $taxUsd,
                    ':grand_total_usd' => $grandTotalUsd,
                    ':total_usd' => $grandTotalUsd,
                    ':status' => 'pending',
                    ':payment_reference' => $paymentReference,
                    ':items_json' => json_encode($selectedItems, JSON_UNESCAPED_SLASHES),
                    ':notes' => $notes,
                    ':created_at' => $now,
                    ':updated_at' => $now,
                ]);

                $createdOrderId = (int) $pdo->lastInsertId();
                $createdOrderTotal = $grandTotalUsd;
                $createdOrderEmail = strtolower($customerEmail);

                if ($couponCodeApplied !== '') {
                    $couponUpdateStmt = $pdo->prepare(
                        'UPDATE coupon_codes
                         SET used_count = used_count + 1, updated_at = :updated_at
                         WHERE code = :code'
                    );
                    $couponUpdateStmt->execute([
                        ':updated_at' => finready_now(),
                        ':code' => $couponCodeApplied,
                    ]);
                }

                finready_upsert_customer_profile($pdo, [
                    'customer_email' => $customerEmail,
                    'full_name' => $billingName,
                    'phone' => $phone,
                    'company' => $billingCompany,
                    'gst_number' => $gstNumber,
                    'tax_id' => $taxId,
                    'billing_state' => $billingState,
                    'billing_country' => $billingCountry,
                    'invoice_email_opt_in' => 1,
                    'marketing_email_opt_in' => 0,
                ]);

                $invoice = finready_create_or_update_invoice($pdo, $createdOrderId);
                if (is_array($invoice)) {
                    $createdInvoiceToken = (string) ($invoice['access_token'] ?? '');
                    $createdInvoiceNumber = (string) ($invoice['invoice_number'] ?? '');
                }

                if ($sendInvoiceNow === 1) {
                    $sendEmailResult = finready_send_invoice_email($pdo, $createdOrderId, $customerEmail);
                    $createdInvoiceEmailStatus = (string) ($sendEmailResult['message'] ?? '');
                }

                $feedbackType = 'success';
                $feedbackMessage = 'Custom plan order created. Order #' . $createdOrderId . ' | Reference: ' . $paymentReference;
                if ($createdInvoiceNumber !== '') {
                    $feedbackMessage .= ' | Invoice: ' . $createdInvoiceNumber;
                }
                if ($createdInvoiceEmailStatus !== '') {
                    $feedbackMessage .= ' | ' . $createdInvoiceEmailStatus;
                }
            }
        }
    }
}

$addParam = $_GET['add'] ?? [];
$addValues = [];
if (is_string($addParam) && trim($addParam) !== '') {
    $addValues[] = $addParam;
} elseif (is_array($addParam)) {
    foreach ($addParam as $value) {
        if (is_string($value) && trim($value) !== '') {
            $addValues[] = $value;
        }
    }
}

$preselectedKeys = [];
foreach ($addValues as $addValue) {
    $parts = explode(':', $addValue, 2);
    if (count($parts) !== 2) {
        continue;
    }
    $type = strtolower(trim((string) $parts[0]));
    $slug = trim((string) $parts[1]);
    $key = $type . ':' . $slug;
    if (!isset($pricingMap[$key])) {
        continue;
    }
    $preselectedKeys[$key] = true;
}

$preselectedJson = json_encode(array_keys($preselectedKeys), JSON_UNESCAPED_SLASHES);
if (!is_string($preselectedJson)) {
    $preselectedJson = '[]';
}

$couponsForClient = [];
foreach ($activeCoupons as $coupon) {
    $couponsForClient[] = [
        'code' => (string) ($coupon['code'] ?? ''),
        'discount_type' => (string) ($coupon['discount_type'] ?? 'percent'),
        'discount_value' => (float) ($coupon['discount_value'] ?? 0),
        'max_discount_usd' => (int) ($coupon['max_discount_usd'] ?? 0),
        'min_order_usd' => (int) ($coupon['min_order_usd'] ?? 0),
        'is_active' => (int) ($coupon['is_active'] ?? 0),
    ];
}
$taxRulesForClient = [];
foreach ($activeTaxRules as $rule) {
    $taxRulesForClient[] = [
        'code' => (string) ($rule['code'] ?? ''),
        'country_code' => (string) ($rule['country_code'] ?? ''),
        'state_code' => (string) ($rule['state_code'] ?? ''),
        'tax_type' => (string) ($rule['tax_type'] ?? ''),
        'rate_percent' => (float) ($rule['rate_percent'] ?? 0),
        'reverse_charge_on_gst' => (int) ($rule['reverse_charge_on_gst'] ?? 0),
        'is_active' => (int) ($rule['is_active'] ?? 0),
    ];
}

$couponsClientJson = json_encode($couponsForClient, JSON_UNESCAPED_SLASHES);
if (!is_string($couponsClientJson)) {
    $couponsClientJson = '[]';
}
$taxRulesClientJson = json_encode($taxRulesForClient, JSON_UNESCAPED_SLASHES);
if (!is_string($taxRulesClientJson)) {
    $taxRulesClientJson = '[]';
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinReady | Pricing</title>
    <meta
      name="description"
      content="Per-course and per-tool subscription pricing with monthly, quarterly, and annual billing, including custom bundled checkout."
    />
    <link rel="canonical" href="https://finready.ai/pricing" />
    <link rel="icon" type="image/svg+xml" href="<?php echo fr_h(fr_url('assets/images/favicon.svg')); ?>" />
    <link rel="stylesheet" href="<?php echo fr_h(fr_url('assets/css/styles.css?v=20260333')); ?>" />
  </head>
  <body data-page="pricing">
    <a class="skip-link" href="#mainContent">Skip to content</a>
    <div data-site-header></div>

    <main id="mainContent">
      <section class="page-hero">
        <div class="container text-center">
          <span class="eyebrow">Flexible Product Pricing</span>
          <h1>Choose Course and Tool Plans Your Way</h1>
          <p style="max-width: 780px; margin: 0 auto 16px">
            Every course and AI tool has separate pricing with monthly, quarterly, and annual options.
            Build a custom combination and checkout in one payment.
          </p>
          <div class="pricing-toggle" data-billing-toggle>
            <button class="active" type="button" data-billing="monthly">Monthly</button>
            <button type="button" data-billing="quarterly">Quarterly</button>
            <button type="button" data-billing="annual">Annual</button>
          </div>
          <p class="badge" data-annual-badge style="display: inline-flex">Annual pricing includes long-term discount.</p>
        </div>
      </section>

      <?php if ($feedbackType !== ''): ?>
        <section class="section" style="padding-top: 8px;">
          <div class="container">
            <div class="<?php echo $feedbackType === 'success' ? 'form-success' : 'form-error'; ?>" style="display: block;">
              <?php echo fr_h($feedbackMessage); ?>
              <?php if ($feedbackType === 'success' && $createdOrderId > 0): ?>
                <div style="margin-top: 6px;">Total: <strong><?php echo fr_h(fr_format_price($createdOrderTotal)); ?></strong></div>
                <div style="margin-top: 8px; display: flex; gap: 10px; flex-wrap: wrap;">
                  <a class="btn btn-outline" href="<?php echo fr_h(fr_url('account.php?email=' . rawurlencode($createdOrderEmail))); ?>">Open Customer Portal</a>
                  <?php if ($createdInvoiceToken !== ''): ?>
                    <a class="btn btn-secondary" target="_blank" rel="noopener" href="<?php echo fr_h(fr_url('invoice.php?order_id=' . $createdOrderId . '&token=' . rawurlencode($createdInvoiceToken))); ?>">View Invoice</a>
                  <?php endif; ?>
                </div>
              <?php endif; ?>
            </div>
          </div>
        </section>
      <?php endif; ?>

      <section class="section" style="padding-top: 10px;">
        <div class="container">
          <div class="plan-grid">
            <article class="plan-card">
              <h3>Starter</h3>
              <p class="price-value" data-price data-monthly="$0/mo" data-quarterly="$0/qtr" data-annual="$0/yr">$0/mo</p>
              <ul>
                <li>Try selected tools and starter courses</li>
                <li>No commitment billing</li>
                <li>Upgrade anytime</li>
              </ul>
              <a class="btn btn-outline" href="<?php echo fr_h(fr_url('register')); ?>">Create Account</a>
            </article>

            <article class="plan-card popular">
              <p class="badge plan-pro" style="margin-bottom: 8px">Popular</p>
              <h3>Pro Bundle</h3>
              <p class="price-value" data-price data-monthly="$79/mo" data-quarterly="$219/qtr" data-annual="$758/yr">$79/mo</p>
              <ul>
                <li>Best-value ready bundle</li>
                <li>Includes core AI tools + certifications</li>
                <li>Priority support</li>
              </ul>
              <a class="btn btn-primary" href="#customPlanBuilder">Build Custom Plan</a>
            </article>

            <article class="plan-card">
              <h3>Enterprise</h3>
              <p class="price-value" data-price data-monthly="Custom" data-quarterly="Custom" data-annual="Custom">Custom</p>
              <ul>
                <li>Team procurement and invoicing</li>
                <li>SSO and governance controls</li>
                <li>Dedicated onboarding</li>
              </ul>
              <a class="btn btn-secondary" href="<?php echo fr_h(fr_url('book-demo')); ?>">Book Demo</a>
            </article>
          </div>
        </div>
      </section>

      <section class="section" id="customPlanBuilder" style="padding-top: 10px;">
        <div class="container">
          <div class="card custom-plan-shell">
            <div class="split-hero" style="align-items: flex-start; gap: 18px;">
              <div>
                <h2>Custom Plan Builder</h2>
                <p>
                  Select any courses and tools, choose billing cycle per item,
                  and submit one combined payment order.
                </p>
                <p class="muted">
                  Courses: <?php echo count($pricingByType['course']); ?>
                  | AI Tools: <?php echo count($pricingByType['tool']); ?>
                  | Learning Tools: <?php echo count($pricingByType['learning_tool']); ?>
                </p>
              </div>
              <div class="badge-row">
                <span class="badge-chip">Per-item pricing</span>
                <span class="badge-chip">Monthly / Quarterly / Annual</span>
                <span class="badge-chip">One payment request</span>
              </div>
            </div>
            <?php if (count($activeCoupons) > 0): ?>
              <p class="muted" style="margin: 4px 0 0;">
                Available coupons:
                <?php
                  $codes = [];
                  foreach ($activeCoupons as $coupon) {
                      $codes[] = (string) ($coupon['code'] ?? '');
                  }
                  echo fr_h(implode(', ', array_filter($codes, static fn (string $code): bool => $code !== '')));
                ?>
              </p>
            <?php endif; ?>

            <form
              method="post"
              class="custom-plan-grid"
              data-custom-plan-builder
              data-preselected="<?php echo fr_h($preselectedJson); ?>"
              data-coupons="<?php echo fr_h($couponsClientJson); ?>"
              data-tax-rules="<?php echo fr_h($taxRulesClientJson); ?>"
            >
              <input type="hidden" name="action" value="create_custom_plan" />
              <input type="hidden" name="selected_items_json" value="[]" data-selected-items-json />

              <div class="custom-plan-picks">
                <?php foreach (['course' => 'Courses', 'tool' => 'AI Tools', 'learning_tool' => 'Learning Tools'] as $type => $label): ?>
                  <?php $items = $pricingByType[$type] ?? []; ?>
                  <?php if (count($items) === 0) { continue; } ?>
                  <div class="custom-plan-group">
                    <h3><?php echo fr_h($label); ?></h3>
                    <div class="custom-item-grid">
                      <?php foreach ($items as $item): ?>
                        <?php
                          $itemKey = (string) $item['item_type'] . ':' . (string) $item['item_slug'];
                          $monthly = (int) $item['monthly_price_usd'];
                          $quarterly = (int) $item['quarterly_price_usd'];
                          $annual = (int) $item['annual_price_usd'];
                        ?>
                        <article
                          class="custom-item-card"
                          data-bundle-card
                          data-item-type="<?php echo fr_h((string) $item['item_type']); ?>"
                          data-item-slug="<?php echo fr_h((string) $item['item_slug']); ?>"
                          data-item-name="<?php echo fr_h((string) $item['item_name']); ?>"
                          data-monthly="<?php echo $monthly; ?>"
                          data-quarterly="<?php echo $quarterly; ?>"
                          data-annual="<?php echo $annual; ?>"
                        >
                          <label class="custom-item-head">
                            <input type="checkbox" data-bundle-check value="<?php echo fr_h($itemKey); ?>" />
                            <span>
                              <strong><?php echo fr_h((string) $item['item_name']); ?></strong>
                              <small><?php echo fr_h(fr_humanize($type)); ?></small>
                            </span>
                          </label>

                          <div class="custom-item-prices">
                            <span>Monthly <?php echo fr_h(fr_format_price($monthly)); ?></span>
                            <span>Quarterly <?php echo fr_h(fr_format_price($quarterly)); ?></span>
                            <span>Annual <?php echo fr_h(fr_format_price($annual)); ?></span>
                          </div>

                          <label class="custom-cycle-field">
                            Billing Cycle
                            <select data-bundle-cycle>
                              <option value="monthly">Monthly - <?php echo fr_h(fr_format_price($monthly)); ?></option>
                              <option value="quarterly">Quarterly - <?php echo fr_h(fr_format_price($quarterly)); ?></option>
                              <option value="annual">Annual - <?php echo fr_h(fr_format_price($annual)); ?></option>
                            </select>
                          </label>
                        </article>
                      <?php endforeach; ?>
                    </div>
                  </div>
                <?php endforeach; ?>
              </div>

              <aside class="custom-plan-summary">
                <h3>One Payment Summary</h3>
                <p class="muted" data-bundle-empty>Pick items to build your custom bundle.</p>
                <ul data-bundle-summary-list></ul>
                <p class="custom-plan-line"><span>Subtotal</span><strong data-bundle-subtotal><?php echo fr_h(fr_format_price(0)); ?></strong></p>
                <p class="custom-plan-line"><span>Discount</span><strong data-bundle-discount><?php echo fr_h(fr_format_price(0)); ?></strong></p>
                <p class="custom-plan-line"><span data-bundle-tax-label>Tax</span><strong data-bundle-tax><?php echo fr_h(fr_format_price(0)); ?></strong></p>
                <p class="custom-plan-total">Grand Total <strong data-bundle-grand-total><?php echo fr_h(fr_format_price(0)); ?></strong></p>
                <p class="muted" data-bundle-selected-info>0 items selected</p>

                <label>
                  Billing Name
                  <input type="text" name="billing_name" required placeholder="Your full name" />
                </label>
                <label>
                  Company (optional)
                  <input type="text" name="billing_company" placeholder="Company or institute" />
                </label>
                <label>
                  Phone (optional)
                  <input type="text" name="phone" placeholder="+91 99999 99999" />
                </label>

                <label>
                  Billing Email
                  <input type="email" name="customer_email" required placeholder="billing@company.com" />
                </label>
                <label>
                  Country
                  <select name="billing_country" required data-tax-country>
                    <option value="IN">India (GST)</option>
                    <option value="US">United States (Sales Tax)</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AE">United Arab Emirates</option>
                    <option value="SG">Singapore</option>
                    <option value="*">Other</option>
                  </select>
                </label>
                <label>
                  State / Region
                  <input type="text" name="billing_state" data-tax-state placeholder="MH, CA, London, etc." />
                </label>
                <label>
                  Coupon Code (optional)
                  <input type="text" name="coupon_code" data-coupon-code placeholder="WELCOME10" />
                </label>
                <label>
                  GST Number / Tax Number (optional)
                  <input type="text" name="gst_number" data-gst-number placeholder="GSTIN / VAT ID" />
                </label>
                <label>
                  Tax ID (optional)
                  <input type="text" name="tax_id" placeholder="Internal billing tax id" />
                </label>
                <label class="custom-inline-check">
                  <input type="checkbox" name="is_business_purchase" data-is-business-purchase />
                  <span>Business purchase (apply GST reverse charge when eligible)</span>
                </label>
                <label class="custom-inline-check">
                  <input type="checkbox" name="send_invoice_email_now" checked />
                  <span>Email invoice now</span>
                </label>
                <label>
                  Notes (optional)
                  <textarea name="notes" placeholder="Tax ID, invoice notes, or special request"></textarea>
                </label>
                <button class="btn btn-primary" type="submit">Create Combined Payment Order</button>
                <p class="muted" style="margin-top: 8px;">Order appears in Admin > Checkout Orders and Customer Portal.</p>
              </aside>
            </form>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top: 0">
        <div class="container">
          <h2>Pricing FAQ</h2>
          <div class="accordion">
            <div class="accordion-item open">
              <button class="accordion-trigger" type="button">Can each item have a different billing cycle?</button>
              <div class="accordion-panel">Yes. You can mix monthly, quarterly, and annual billing cycles in one custom bundle order.</div>
            </div>
            <div class="accordion-item">
              <button class="accordion-trigger" type="button">Can I bundle courses and AI tools together?</button>
              <div class="accordion-panel">Yes. Custom plan builder supports combining multiple courses and tools into one payment request.</div>
            </div>
            <div class="accordion-item">
              <button class="accordion-trigger" type="button">How is quarterly and annual pricing calculated?</button>
              <div class="accordion-panel">Quarterly and annual plans include cycle-based discounts compared with monthly rolling billing.</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div data-site-footer></div>

    <script src="<?php echo fr_h(fr_url('assets/js/main.js?v=20260324')); ?>"></script>
  </body>
</html>
