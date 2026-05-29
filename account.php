<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/public.php';
require_once __DIR__ . '/includes/billing.php';

function account_order_status_class(string $status): string
{
    $normalized = strtolower(trim($status));
    if ($normalized === 'paid') {
        return 'paid';
    }
    if ($normalized === 'pending') {
        return 'pending';
    }
    if ($normalized === 'failed' || $normalized === 'cancelled') {
        return 'failed';
    }
    return 'pending';
}

$pdo = finready_db();
$feedbackType = '';
$feedbackMessage = '';

$requestedEmail = strtolower(trim((string) ($_GET['email'] ?? $_POST['customer_email'] ?? '')));
if ($requestedEmail !== '' && !filter_var($requestedEmail, FILTER_VALIDATE_EMAIL)) {
    $requestedEmail = '';
}

$orderStatusFilter = strtolower(trim((string) ($_GET['order_status'] ?? $_POST['order_status'] ?? '')));
if (!in_array($orderStatusFilter, ['pending', 'paid', 'failed', 'cancelled'], true)) {
    $orderStatusFilter = '';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = trim((string) ($_POST['action'] ?? ''));
    $postedEmail = strtolower(trim((string) ($_POST['customer_email'] ?? '')));
    if ($postedEmail !== '' && !filter_var($postedEmail, FILTER_VALIDATE_EMAIL)) {
        $postedEmail = '';
    }
    if ($postedEmail !== '') {
        $requestedEmail = $postedEmail;
    }

    if ($action === 'save_profile') {
        if ($postedEmail === '') {
            $feedbackType = 'error';
            $feedbackMessage = 'Enter a valid email before saving profile settings.';
        } else {
            $dashboardWidgets = $_POST['dashboard_widgets'] ?? [];
            if (!is_array($dashboardWidgets)) {
                $dashboardWidgets = [];
            }

            $invoiceDeliveryEmail = strtolower(trim((string) ($_POST['invoice_delivery_email'] ?? '')));
            if ($invoiceDeliveryEmail !== '' && !filter_var($invoiceDeliveryEmail, FILTER_VALIDATE_EMAIL)) {
                $invoiceDeliveryEmail = '';
            }

            finready_upsert_customer_profile($pdo, [
                'customer_email' => $postedEmail,
                'full_name' => trim((string) ($_POST['full_name'] ?? '')),
                'phone' => trim((string) ($_POST['phone'] ?? '')),
                'company' => trim((string) ($_POST['company'] ?? '')),
                'gst_number' => trim((string) ($_POST['gst_number'] ?? '')),
                'tax_id' => trim((string) ($_POST['tax_id'] ?? '')),
                'billing_line1' => trim((string) ($_POST['billing_line1'] ?? '')),
                'billing_line2' => trim((string) ($_POST['billing_line2'] ?? '')),
                'billing_city' => trim((string) ($_POST['billing_city'] ?? '')),
                'billing_state' => trim((string) ($_POST['billing_state'] ?? '')),
                'billing_postal_code' => trim((string) ($_POST['billing_postal_code'] ?? '')),
                'billing_country' => finready_normalize_country_code((string) ($_POST['billing_country'] ?? '')),
                'preferred_currency' => strtoupper(substr(trim((string) ($_POST['preferred_currency'] ?? 'USD')), 0, 3)),
                'timezone' => trim((string) ($_POST['timezone'] ?? 'UTC')),
                'locale' => strtolower(substr(trim((string) ($_POST['locale'] ?? 'en')), 0, 16)),
                'date_format' => trim((string) ($_POST['date_format'] ?? 'DD MMM YYYY')),
                'dashboard_density' => trim((string) ($_POST['dashboard_density'] ?? 'comfortable')),
                'default_billing_cycle' => trim((string) ($_POST['default_billing_cycle'] ?? 'monthly')),
                'preferred_contact_channel' => trim((string) ($_POST['preferred_contact_channel'] ?? 'email')),
                'invoice_delivery_email' => $invoiceDeliveryEmail,
                'invoice_email_opt_in' => isset($_POST['invoice_email_opt_in']) ? 1 : 0,
                'marketing_email_opt_in' => isset($_POST['marketing_email_opt_in']) ? 1 : 0,
                'notification_billing' => isset($_POST['notification_billing']) ? 1 : 0,
                'notification_product' => isset($_POST['notification_product']) ? 1 : 0,
                'notification_marketing' => isset($_POST['notification_marketing']) ? 1 : 0,
                'notification_security' => isset($_POST['notification_security']) ? 1 : 0,
                'accessibility_reduced_motion' => isset($_POST['accessibility_reduced_motion']) ? 1 : 0,
                'accessibility_high_contrast' => isset($_POST['accessibility_high_contrast']) ? 1 : 0,
                'dashboard_widgets' => $dashboardWidgets,
                'notes' => trim((string) ($_POST['notes'] ?? '')),
            ]);
            $feedbackType = 'success';
            $feedbackMessage = 'Customer dashboard settings saved.';
        }
    } elseif ($action === 'send_invoice_email') {
        $orderId = (int) ($_POST['order_id'] ?? 0);
        if ($postedEmail === '' || $orderId <= 0) {
            $feedbackType = 'error';
            $feedbackMessage = 'Invalid order or email for invoice send.';
        } else {
            $order = finready_get_checkout_order($pdo, $orderId);
            if (!is_array($order) || strtolower((string) ($order['customer_email'] ?? '')) !== $postedEmail) {
                $feedbackType = 'error';
                $feedbackMessage = 'Order not found for this customer email.';
            } else {
                $recipientEmail = strtolower(trim((string) ($_POST['recipient_email'] ?? $postedEmail)));
                if (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
                    $recipientEmail = $postedEmail;
                }
                $sendResult = finready_send_invoice_email($pdo, $orderId, $recipientEmail);
                $feedbackType = !empty($sendResult['ok']) ? 'success' : 'error';
                $feedbackMessage = (string) ($sendResult['message'] ?? 'Could not send invoice email.');
            }
        }
    } elseif ($action === 'export_data') {
        if ($postedEmail === '') {
            $feedbackType = 'error';
            $feedbackMessage = 'Provide a valid email before exporting your account data.';
        } else {
            $profileExport = finready_get_customer_profile($pdo, $postedEmail);
            $ordersExportStmt = $pdo->prepare(
                "SELECT o.*, i.invoice_number, i.status AS invoice_status, i.last_emailed_at
                 FROM checkout_orders o
                 LEFT JOIN order_invoices i
                   ON i.order_id = o.id
                 WHERE o.customer_email = :customer_email
                 ORDER BY o.id DESC"
            );
            $ordersExportStmt->execute([':customer_email' => $postedEmail]);
            $ordersExport = $ordersExportStmt->fetchAll();

            $subscriptionsExportStmt = $pdo->prepare(
                "SELECT customer_email, plan_code, status, started_at, renews_at, amount_usd, notes
                 FROM subscriptions
                 WHERE customer_email = :customer_email
                 ORDER BY id DESC"
            );
            $subscriptionsExportStmt->execute([':customer_email' => $postedEmail]);
            $subscriptionsExport = $subscriptionsExportStmt->fetchAll();

            $exportPayload = [
                'generated_at' => gmdate('c'),
                'customer_email' => $postedEmail,
                'profile' => is_array($profileExport) ? $profileExport : new stdClass(),
                'orders' => $ordersExport,
                'subscriptions' => $subscriptionsExport,
            ];

            $exportJson = json_encode($exportPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            if (!is_string($exportJson)) {
                $feedbackType = 'error';
                $feedbackMessage = 'Could not export account data.';
            } else {
                $safeEmail = preg_replace('/[^a-z0-9]+/i', '-', $postedEmail) ?? 'customer';
                $safeEmail = trim($safeEmail, '-');
                if ($safeEmail === '') {
                    $safeEmail = 'customer';
                }
                header('Content-Type: application/json; charset=UTF-8');
                header('Content-Disposition: attachment; filename="finready-account-' . $safeEmail . '-' . gmdate('YmdHis') . '.json"');
                echo $exportJson;
                exit;
            }
        }
    }
}

$profile = null;
$orders = [];
$orderCount = 0;
$pendingOrders = 0;
$paidOrders = 0;
$failedOrders = 0;
$cancelledOrders = 0;
$totalBilledUsd = 0;
$totalTaxUsd = 0;
$totalDiscountUsd = 0;
$distinctItems = [];
$lastOrderDate = '';
$subscriptions = [];
$subscriptionCount = 0;
$activeSubscriptionCount = 0;
$totalSubscriptionValueUsd = 0;
$nextRenewalDate = '';

if ($requestedEmail !== '') {
    $profile = finready_get_customer_profile($pdo, $requestedEmail);

    $subscriptionStmt = $pdo->prepare(
        "SELECT plan_code, status, started_at, renews_at, amount_usd, notes
         FROM subscriptions
         WHERE customer_email = :customer_email
         ORDER BY id DESC
         LIMIT 200"
    );
    $subscriptionStmt->execute([':customer_email' => $requestedEmail]);
    $subscriptions = $subscriptionStmt->fetchAll();
    $subscriptionCount = count($subscriptions);

    $nowTs = time();
    foreach ($subscriptions as $subscriptionRow) {
        $subStatus = strtolower(trim((string) ($subscriptionRow['status'] ?? '')));
        if (in_array($subStatus, ['active', 'trialing', 'grace'], true)) {
            $activeSubscriptionCount++;
        }

        $totalSubscriptionValueUsd += max(0, (int) ($subscriptionRow['amount_usd'] ?? 0));

        $renewsAt = trim((string) ($subscriptionRow['renews_at'] ?? ''));
        $renewsAtTs = $renewsAt !== '' ? strtotime($renewsAt) : false;
        if ($renewsAtTs !== false && $renewsAtTs >= $nowTs) {
            $renewsAtDate = gmdate('Y-m-d', $renewsAtTs);
            if ($nextRenewalDate === '' || strcmp($renewsAtDate, $nextRenewalDate) < 0) {
                $nextRenewalDate = $renewsAtDate;
            }
        }
    }

    $whereSql = 'WHERE o.customer_email = :customer_email';
    $params = [':customer_email' => $requestedEmail];
    if ($orderStatusFilter !== '') {
        $whereSql .= ' AND o.status = :status';
        $params[':status'] = $orderStatusFilter;
    }

    $stmt = $pdo->prepare(
        "SELECT
            o.*,
            i.id AS invoice_id,
            i.invoice_number,
            i.access_token,
            i.status AS invoice_status,
            i.last_emailed_at
         FROM checkout_orders o
         LEFT JOIN order_invoices i
           ON i.order_id = o.id
         {$whereSql}
         ORDER BY o.id DESC
         LIMIT 300"
    );
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    foreach ($orders as &$orderRow) {
        if (trim((string) ($orderRow['invoice_number'] ?? '')) === '') {
            $invoice = finready_create_or_update_invoice($pdo, (int) ($orderRow['id'] ?? 0));
            if (is_array($invoice)) {
                $orderRow['invoice_id'] = (int) ($invoice['id'] ?? 0);
                $orderRow['invoice_number'] = (string) ($invoice['invoice_number'] ?? '');
                $orderRow['access_token'] = (string) ($invoice['access_token'] ?? '');
                $orderRow['invoice_status'] = (string) ($invoice['status'] ?? 'issued');
                $orderRow['last_emailed_at'] = (string) ($invoice['last_emailed_at'] ?? '');
            }
        }

        $status = strtolower((string) ($orderRow['status'] ?? 'pending'));
        if ($status === 'paid') {
            $paidOrders++;
        } elseif ($status === 'failed') {
            $failedOrders++;
        } elseif ($status === 'cancelled') {
            $cancelledOrders++;
        } else {
            $pendingOrders++;
        }

        $rowDiscount = max(0, (int) ($orderRow['discount_usd'] ?? 0));
        $rowTax = max(0, (int) ($orderRow['tax_usd'] ?? 0));
        $rowTotal = max(0, (int) ($orderRow['grand_total_usd'] ?? 0));
        if ($rowTotal <= 0) {
            $rowTotal = max(0, (int) ($orderRow['total_usd'] ?? 0));
        }

        $totalDiscountUsd += $rowDiscount;
        $totalTaxUsd += $rowTax;
        $totalBilledUsd += $rowTotal;

        $items = finready_parse_order_items((string) ($orderRow['items_json'] ?? '[]'));
        foreach ($items as $item) {
            $itemSlug = strtolower(trim((string) ($item['item_slug'] ?? '')));
            if ($itemSlug !== '') {
                $distinctItems[$itemSlug] = true;
            }
        }

        if ($lastOrderDate === '' && !empty($orderRow['created_at'])) {
            $lastOrderDate = substr((string) $orderRow['created_at'], 0, 10);
        }
    }
    unset($orderRow);

    $orderCount = count($orders);

    if (!is_array($profile) && $orderCount > 0) {
        $firstOrder = $orders[0];
        $profile = [
            'customer_email' => $requestedEmail,
            'full_name' => (string) ($firstOrder['billing_name'] ?? ''),
            'phone' => '',
            'company' => (string) ($firstOrder['billing_company'] ?? ''),
            'gst_number' => (string) ($firstOrder['gst_number'] ?? ''),
            'tax_id' => '',
            'billing_line1' => '',
            'billing_line2' => '',
            'billing_city' => '',
            'billing_state' => (string) ($firstOrder['billing_state'] ?? ''),
            'billing_postal_code' => '',
            'billing_country' => (string) ($firstOrder['billing_country'] ?? ''),
            'preferred_currency' => 'USD',
            'timezone' => 'UTC',
            'locale' => 'en',
            'date_format' => 'DD MMM YYYY',
            'dashboard_density' => 'comfortable',
            'default_billing_cycle' => 'monthly',
            'preferred_contact_channel' => 'email',
            'invoice_delivery_email' => $requestedEmail,
            'invoice_email_opt_in' => 1,
            'marketing_email_opt_in' => 0,
            'notification_billing' => 1,
            'notification_product' => 1,
            'notification_marketing' => 0,
            'notification_security' => 1,
            'accessibility_reduced_motion' => 0,
            'accessibility_high_contrast' => 0,
            'dashboard_widgets_json' => '["orders","invoices","recommendations"]',
            'notes' => '',
        ];
    }
}

$profileDefaults = [
    'customer_email' => $requestedEmail,
    'full_name' => '',
    'phone' => '',
    'company' => '',
    'gst_number' => '',
    'tax_id' => '',
    'billing_line1' => '',
    'billing_line2' => '',
    'billing_city' => '',
    'billing_state' => '',
    'billing_postal_code' => '',
    'billing_country' => '',
    'preferred_currency' => 'USD',
    'timezone' => 'UTC',
    'locale' => 'en',
    'date_format' => 'DD MMM YYYY',
    'dashboard_density' => 'comfortable',
    'default_billing_cycle' => 'monthly',
    'preferred_contact_channel' => 'email',
    'invoice_delivery_email' => $requestedEmail,
    'invoice_email_opt_in' => 1,
    'marketing_email_opt_in' => 0,
    'notification_billing' => 1,
    'notification_product' => 1,
    'notification_marketing' => 0,
    'notification_security' => 1,
    'accessibility_reduced_motion' => 0,
    'accessibility_high_contrast' => 0,
    'dashboard_widgets_json' => '["orders","invoices","recommendations"]',
    'notes' => '',
];
$profile = array_merge($profileDefaults, is_array($profile) ? $profile : []);

if (trim((string) ($profile['invoice_delivery_email'] ?? '')) === '' && $requestedEmail !== '') {
    $profile['invoice_delivery_email'] = $requestedEmail;
}

$selectedWidgets = json_decode((string) ($profile['dashboard_widgets_json'] ?? '[]'), true);
if (!is_array($selectedWidgets) || count($selectedWidgets) === 0) {
    $selectedWidgets = ['orders', 'invoices', 'recommendations'];
}
$selectedWidgets = array_values(array_unique(array_filter(array_map(static fn ($item): string => strtolower(trim((string) $item)), $selectedWidgets), static fn (string $item): bool => $item !== '')));

$widgetChoices = [
    'orders' => 'Order and purchase insights',
    'invoices' => 'Invoice shortcuts and alerts',
    'recommendations' => 'Learning recommendations',
    'tools' => 'Saved AI tools panel',
    'certifications' => 'Certification progress panel',
];

$profileChecklist = [
    ['key' => 'full_name', 'label' => 'Full name'],
    ['key' => 'phone', 'label' => 'Phone number'],
    ['key' => 'company', 'label' => 'Company'],
    ['key' => 'billing_line1', 'label' => 'Billing address'],
    ['key' => 'billing_city', 'label' => 'Billing city'],
    ['key' => 'billing_country', 'label' => 'Billing country'],
    ['key' => 'invoice_delivery_email', 'label' => 'Invoice email'],
];
$profileChecklistCount = count($profileChecklist);
$profileCompleteCount = 0;
$profileMissingLabels = [];

foreach ($profileChecklist as $checkItem) {
    $value = trim((string) ($profile[(string) $checkItem['key']] ?? ''));
    if ($value !== '') {
        $profileCompleteCount++;
    } else {
        $profileMissingLabels[] = (string) $checkItem['label'];
    }
}

$profileCompletionPercent = (int) round($profileCompleteCount * 100 / max(1, $profileChecklistCount));
$profilePriorityActions = array_slice($profileMissingLabels, 0, 3);
$profileUpdatedAt = substr((string) ($profile['updated_at'] ?? ''), 0, 10);

$dashboardClassNames = ['account-dashboard-page'];
if ((string) ($profile['dashboard_density'] ?? 'comfortable') === 'compact') {
    $dashboardClassNames[] = 'account-density-compact';
}
if ((int) ($profile['accessibility_high_contrast'] ?? 0) === 1) {
    $dashboardClassNames[] = 'account-high-contrast';
}
if ((int) ($profile['accessibility_reduced_motion'] ?? 0) === 1) {
    $dashboardClassNames[] = 'account-reduced-motion';
}
$dashboardBodyClass = implode(' ', $dashboardClassNames);

$distinctItemCount = count($distinctItems);
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinReady | Customer Dashboard</title>
    <meta name="description" content="Customer self-service dashboard for profile management, billing preferences, invoice controls, and order history." />
    <link rel="icon" type="image/svg+xml" href="<?php echo fr_h(fr_url('assets/images/favicon.svg')); ?>" />
    <link rel="stylesheet" href="<?php echo fr_h(fr_url('assets/css/styles.css?v=20260333')); ?>" />
  </head>
  <body data-page="account" class="<?php echo fr_h($dashboardBodyClass); ?>">
    <a class="skip-link" href="#mainContent">Skip to content</a>
    <div data-site-header></div>

    <main id="mainContent">
      <section class="page-hero">
        <div class="container split-hero">
          <div>
            <span class="eyebrow">Customer Dashboard</span>
            <h1>Manage your profile, settings, orders, invoices, and preferences</h1>
            <p>Everything a customer needs is here: account details, billing controls, communication preferences, dashboard customization, and invoice operations.</p>
          </div>
          <div class="card account-lookup-card">
            <h3>Find Your Dashboard</h3>
            <form method="get" class="account-lookup-form">
              <label>
                Billing Email
                <input type="email" name="email" required value="<?php echo fr_h($requestedEmail); ?>" placeholder="billing@company.com" />
              </label>
              <button class="btn btn-primary" type="submit">Open Dashboard</button>
            </form>
            <p class="muted" style="margin-top: 8px;">Use the same email used during checkout.</p>
          </div>
        </div>
      </section>

      <?php if ($feedbackType !== ''): ?>
        <section class="section" style="padding-top: 8px;">
          <div class="container">
            <div class="<?php echo $feedbackType === 'success' ? 'form-success' : 'form-error'; ?>" style="display: block;">
              <?php echo fr_h($feedbackMessage); ?>
            </div>
          </div>
        </section>
      <?php endif; ?>

      <section class="section" style="padding-top: 14px;">
        <div class="container">
          <?php if ($requestedEmail === ''): ?>
            <div class="card">
              <h2>Enter your billing email to continue</h2>
              <p class="muted">Once loaded, you can maintain profile details, customize dashboard settings, manage billing preferences, and handle invoices.</p>
            </div>
          <?php else: ?>
            <div class="account-toolbar">
              <a class="btn btn-primary" href="<?php echo fr_h(fr_url('dashboard.php')); ?>">Learning Workspace</a>
              <a class="btn btn-outline" href="<?php echo fr_h(fr_url('courses.php')); ?>">Browse Courses</a>
              <a class="btn btn-outline" href="<?php echo fr_h(fr_url('ai-tools.php')); ?>">Open Tools</a>
              <a class="btn btn-secondary" href="<?php echo fr_h(fr_url('pricing.php')); ?>">Manage Plans</a>
            </div>

            <nav class="account-page-nav" aria-label="Account sections">
              <a class="account-nav-chip" href="#accountOverview">Overview</a>
              <a class="account-nav-chip" href="#profileSettings">Profile</a>
              <a class="account-nav-chip" href="#subscriptionsSection">Subscriptions</a>
              <a class="account-nav-chip" href="#ordersHistory">Orders & Invoices</a>
              <a class="account-nav-chip" href="#serviceControls">Support</a>
            </nav>

            <p class="account-helper-note">Start with <strong>Profile</strong> to keep billing and invoices accurate, then manage plans and orders.</p>

            <div class="account-kpi-row" id="accountOverview">
              <article class="account-kpi account-kpi-primary"><p>Total Orders</p><strong><?php echo $orderCount; ?></strong></article>
              <article class="account-kpi account-kpi-primary"><p>Paid</p><strong><?php echo $paidOrders; ?></strong></article>
              <article class="account-kpi account-kpi-primary"><p>Pending</p><strong><?php echo $pendingOrders; ?></strong></article>
              <article class="account-kpi account-kpi-primary"><p>Total Billed</p><strong><?php echo fr_h(fr_format_price($totalBilledUsd)); ?></strong></article>
              <article class="account-kpi account-kpi-primary"><p>Active Subscriptions</p><strong><?php echo $activeSubscriptionCount; ?></strong></article>
              <article class="account-kpi account-kpi-primary"><p>Next Renewal</p><strong><?php echo fr_h($nextRenewalDate !== '' ? $nextRenewalDate : 'N/A'); ?></strong></article>
              <article class="account-kpi account-kpi-secondary"><p>Failed</p><strong><?php echo $failedOrders; ?></strong></article>
              <article class="account-kpi account-kpi-secondary"><p>Cancelled</p><strong><?php echo $cancelledOrders; ?></strong></article>
              <article class="account-kpi account-kpi-secondary"><p>Total Discount</p><strong><?php echo fr_h(fr_format_price($totalDiscountUsd)); ?></strong></article>
              <article class="account-kpi account-kpi-secondary"><p>Total Tax</p><strong><?php echo fr_h(fr_format_price($totalTaxUsd)); ?></strong></article>
              <article class="account-kpi account-kpi-secondary"><p>Products Purchased</p><strong><?php echo $distinctItemCount; ?></strong></article>
              <article class="account-kpi account-kpi-secondary"><p>Subscriptions</p><strong><?php echo $subscriptionCount; ?></strong></article>
              <article class="account-kpi account-kpi-secondary"><p>Subscription Value</p><strong><?php echo fr_h(fr_format_price($totalSubscriptionValueUsd)); ?></strong></article>
              <article class="account-kpi account-kpi-secondary"><p>Last Order</p><strong><?php echo fr_h($lastOrderDate !== '' ? $lastOrderDate : 'N/A'); ?></strong></article>
            </div>

            <div class="account-grid">
              <article class="card" id="profileSettings">
                <h2>Profile and Account Settings</h2>
                <p class="muted">Everything is split into simple sections. Open one section, update fields, then save once.</p>

                <div class="account-progress-card">
                  <div class="account-progress-head">
                    <strong>Profile Completion</strong>
                    <span><?php echo $profileCompletionPercent; ?>%</span>
                  </div>
                  <div class="account-progress-track">
                    <span style="width: <?php echo $profileCompletionPercent; ?>%"></span>
                  </div>
                  <p class="muted">Complete key fields so invoices, billing reminders, and support responses are always accurate.</p>
                  <?php if (count($profilePriorityActions) > 0): ?>
                    <p class="account-missing-line"><strong>Next to complete:</strong> <?php echo fr_h(implode(', ', $profilePriorityActions)); ?></p>
                  <?php endif; ?>
                  <?php if ($profileUpdatedAt !== ''): ?>
                    <p class="account-meta-line">Last profile save: <?php echo fr_h($profileUpdatedAt); ?></p>
                  <?php endif; ?>
                </div>

                <form method="post" class="account-profile-form account-form-sections">
                  <input type="hidden" name="action" value="save_profile" />
                  <input type="hidden" name="customer_email" value="<?php echo fr_h($requestedEmail); ?>" />
                  <?php if ($orderStatusFilter !== ''): ?>
                    <input type="hidden" name="order_status" value="<?php echo fr_h($orderStatusFilter); ?>" />
                  <?php endif; ?>

                  <details class="account-form-accordion" open>
                    <summary>
                      <span class="account-form-summary-title">1. Identity</span>
                      <small>Name, phone, company and contact preference.</small>
                    </summary>
                    <div class="account-form-accordion-content account-form-columns">
                      <label>Full Name<input type="text" name="full_name" value="<?php echo fr_h((string) ($profile['full_name'] ?? '')); ?>" placeholder="Your full name" /></label>
                      <label>Phone<input type="text" name="phone" value="<?php echo fr_h((string) ($profile['phone'] ?? '')); ?>" placeholder="+91..." /></label>
                      <label>Company<input type="text" name="company" value="<?php echo fr_h((string) ($profile['company'] ?? '')); ?>" placeholder="Company / Organization" /></label>
                      <label>Preferred Contact
                        <select name="preferred_contact_channel">
                          <?php foreach (['email' => 'Email', 'phone' => 'Phone', 'whatsapp' => 'WhatsApp'] as $contactKey => $contactLabel): ?>
                            <option value="<?php echo fr_h($contactKey); ?>" <?php echo (string) ($profile['preferred_contact_channel'] ?? 'email') === $contactKey ? 'selected' : ''; ?>><?php echo fr_h($contactLabel); ?></option>
                          <?php endforeach; ?>
                        </select>
                      </label>
                    </div>
                  </details>

                  <details class="account-form-accordion" open>
                    <summary>
                      <span class="account-form-summary-title">2. Billing and Tax Details</span>
                      <small>Invoice destination, billing address and tax references.</small>
                    </summary>
                    <div class="account-form-accordion-content account-form-columns">
                      <label>GST Number<input type="text" name="gst_number" value="<?php echo fr_h((string) ($profile['gst_number'] ?? '')); ?>" placeholder="Optional" /></label>
                      <label>Tax ID<input type="text" name="tax_id" value="<?php echo fr_h((string) ($profile['tax_id'] ?? '')); ?>" placeholder="Optional" /></label>
                      <label>Billing Line 1<input type="text" name="billing_line1" value="<?php echo fr_h((string) ($profile['billing_line1'] ?? '')); ?>" /></label>
                      <label>Billing Line 2<input type="text" name="billing_line2" value="<?php echo fr_h((string) ($profile['billing_line2'] ?? '')); ?>" /></label>
                      <label>City<input type="text" name="billing_city" value="<?php echo fr_h((string) ($profile['billing_city'] ?? '')); ?>" /></label>
                      <label>State<input type="text" name="billing_state" value="<?php echo fr_h((string) ($profile['billing_state'] ?? '')); ?>" /></label>
                      <label>Postal Code<input type="text" name="billing_postal_code" value="<?php echo fr_h((string) ($profile['billing_postal_code'] ?? '')); ?>" /></label>
                      <label>Country Code<input type="text" name="billing_country" maxlength="2" value="<?php echo fr_h((string) ($profile['billing_country'] ?? '')); ?>" placeholder="IN / US" /></label>
                      <label>Currency<input type="text" name="preferred_currency" maxlength="3" value="<?php echo fr_h((string) ($profile['preferred_currency'] ?? 'USD')); ?>" /></label>
                      <label>Invoice Delivery Email<input type="email" name="invoice_delivery_email" value="<?php echo fr_h((string) ($profile['invoice_delivery_email'] ?? $requestedEmail)); ?>" /></label>
                    </div>
                  </details>

                  <details class="account-form-accordion" open>
                    <summary>
                      <span class="account-form-summary-title">3. Dashboard Preferences</span>
                      <small>Choose layout density, billing cycle defaults, and widgets.</small>
                    </summary>
                    <div class="account-form-accordion-content">
                      <div class="account-form-columns">
                        <label>Timezone<input type="text" name="timezone" value="<?php echo fr_h((string) ($profile['timezone'] ?? 'UTC')); ?>" placeholder="Asia/Kolkata" /></label>
                        <label>Locale<input type="text" name="locale" value="<?php echo fr_h((string) ($profile['locale'] ?? 'en')); ?>" placeholder="en, en-IN" /></label>
                        <label>Date Format
                          <select name="date_format">
                            <?php foreach (['DD MMM YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'] as $formatOption): ?>
                              <option value="<?php echo fr_h($formatOption); ?>" <?php echo (string) ($profile['date_format'] ?? 'DD MMM YYYY') === $formatOption ? 'selected' : ''; ?>><?php echo fr_h($formatOption); ?></option>
                            <?php endforeach; ?>
                          </select>
                        </label>
                        <label>Dashboard Density
                          <select name="dashboard_density" data-dashboard-density>
                            <?php foreach (['comfortable' => 'Comfortable', 'compact' => 'Compact'] as $densityKey => $densityLabel): ?>
                              <option value="<?php echo fr_h($densityKey); ?>" <?php echo (string) ($profile['dashboard_density'] ?? 'comfortable') === $densityKey ? 'selected' : ''; ?>><?php echo fr_h($densityLabel); ?></option>
                            <?php endforeach; ?>
                          </select>
                        </label>
                        <label>Default Billing Cycle
                          <select name="default_billing_cycle">
                            <?php foreach (['monthly' => 'Monthly', 'quarterly' => 'Quarterly', 'annual' => 'Annual', 'mixed' => 'Mixed'] as $cycleKey => $cycleLabel): ?>
                              <option value="<?php echo fr_h($cycleKey); ?>" <?php echo (string) ($profile['default_billing_cycle'] ?? 'monthly') === $cycleKey ? 'selected' : ''; ?>><?php echo fr_h($cycleLabel); ?></option>
                            <?php endforeach; ?>
                          </select>
                        </label>
                      </div>
                      <div class="account-widget-grid">
                        <?php foreach ($widgetChoices as $widgetKey => $widgetLabel): ?>
                          <label class="custom-inline-check">
                            <input type="checkbox" name="dashboard_widgets[]" value="<?php echo fr_h($widgetKey); ?>" <?php echo in_array($widgetKey, $selectedWidgets, true) ? 'checked' : ''; ?> />
                            <span><?php echo fr_h($widgetLabel); ?></span>
                          </label>
                        <?php endforeach; ?>
                      </div>
                    </div>
                  </details>

                  <details class="account-form-accordion" open>
                    <summary>
                      <span class="account-form-summary-title">4. Notifications and Accessibility</span>
                      <small>Select email alerts and viewing accessibility options.</small>
                    </summary>
                    <div class="account-form-accordion-content account-preference-grid">
                      <label class="custom-inline-check">
                        <input type="checkbox" name="invoice_email_opt_in" data-pref-toggle="billing" <?php echo (int) ($profile['invoice_email_opt_in'] ?? 1) === 1 ? 'checked' : ''; ?> />
                        <span>Receive invoice emails</span>
                      </label>
                      <label class="custom-inline-check">
                        <input type="checkbox" name="marketing_email_opt_in" data-pref-toggle="marketing" <?php echo (int) ($profile['marketing_email_opt_in'] ?? 0) === 1 ? 'checked' : ''; ?> />
                        <span>Receive product updates</span>
                      </label>
                      <label class="custom-inline-check">
                        <input type="checkbox" name="notification_billing" <?php echo (int) ($profile['notification_billing'] ?? 1) === 1 ? 'checked' : ''; ?> />
                        <span>Billing notifications</span>
                      </label>
                      <label class="custom-inline-check">
                        <input type="checkbox" name="notification_product" <?php echo (int) ($profile['notification_product'] ?? 1) === 1 ? 'checked' : ''; ?> />
                        <span>Product feature notifications</span>
                      </label>
                      <label class="custom-inline-check">
                        <input type="checkbox" name="notification_marketing" <?php echo (int) ($profile['notification_marketing'] ?? 0) === 1 ? 'checked' : ''; ?> />
                        <span>Marketing notifications</span>
                      </label>
                      <label class="custom-inline-check">
                        <input type="checkbox" name="notification_security" <?php echo (int) ($profile['notification_security'] ?? 1) === 1 ? 'checked' : ''; ?> />
                        <span>Security notifications</span>
                      </label>
                      <label class="custom-inline-check">
                        <input type="checkbox" name="accessibility_reduced_motion" data-pref-toggle="reduced-motion" <?php echo (int) ($profile['accessibility_reduced_motion'] ?? 0) === 1 ? 'checked' : ''; ?> />
                        <span>Reduced motion mode</span>
                      </label>
                      <label class="custom-inline-check">
                        <input type="checkbox" name="accessibility_high_contrast" data-pref-toggle="high-contrast" <?php echo (int) ($profile['accessibility_high_contrast'] ?? 0) === 1 ? 'checked' : ''; ?> />
                        <span>High contrast mode</span>
                      </label>
                    </div>
                  </details>

                  <label>
                    Notes (Optional)
                    <textarea name="notes" placeholder="Anything else we should remember for billing or support?"><?php echo fr_h((string) ($profile['notes'] ?? '')); ?></textarea>
                  </label>
                  <div class="card-action-row">
                    <button class="btn btn-primary" type="submit">Save Dashboard Settings</button>
                    <button class="btn btn-outline" type="reset">Reset Form</button>
                  </div>
                </form>
              </article>

              <div class="account-right-stack">
                <article class="card" id="subscriptionsSection">
                  <h2>Plans and Subscriptions</h2>
                  <p class="muted">Track active plans, renewal dates, and quickly change pricing bundles.</p>
                  <?php if ($subscriptionCount === 0): ?>
                    <p class="muted">No subscriptions found yet for this email.</p>
                    <a class="btn btn-secondary" href="<?php echo fr_h(fr_url('pricing.php')); ?>">Choose a Plan</a>
                  <?php else: ?>
                    <ul class="account-subscription-list">
                      <?php foreach ($subscriptions as $subscriptionRow): ?>
                        <?php
                          $subStatus = strtolower(trim((string) ($subscriptionRow['status'] ?? 'pending')));
                          $subStatusClass = 'pending';
                          if (in_array($subStatus, ['active', 'trialing', 'grace'], true)) {
                              $subStatusClass = 'paid';
                          } elseif (in_array($subStatus, ['failed', 'suspended'], true)) {
                              $subStatusClass = 'failed';
                          } elseif ($subStatus === 'cancelled') {
                              $subStatusClass = 'cancelled';
                          }
                        ?>
                        <li class="account-subscription-item">
                          <div>
                            <strong><?php echo fr_h(ucfirst((string) ($subscriptionRow['plan_code'] ?? 'Plan'))); ?></strong>
                            <small>
                              Started <?php echo fr_h(substr((string) ($subscriptionRow['started_at'] ?? ''), 0, 10) ?: 'N/A'); ?>
                              <?php if (trim((string) ($subscriptionRow['renews_at'] ?? '')) !== ''): ?>
                                · Renews <?php echo fr_h(substr((string) ($subscriptionRow['renews_at'] ?? ''), 0, 10)); ?>
                              <?php endif; ?>
                            </small>
                          </div>
                          <div class="account-subscription-meta">
                            <span class="status-pill <?php echo fr_h($subStatusClass); ?>"><?php echo fr_h(ucfirst($subStatus)); ?></span>
                            <strong><?php echo fr_h(fr_format_price((int) ($subscriptionRow['amount_usd'] ?? 0))); ?></strong>
                          </div>
                        </li>
                      <?php endforeach; ?>
                    </ul>
                    <div class="account-inline-actions">
                      <a class="btn btn-outline" href="<?php echo fr_h(fr_url('pricing.php')); ?>">Change Plan Mix</a>
                      <a class="btn btn-primary" href="<?php echo fr_h(fr_url('pricing.php#custom-plan')); ?>">Build Custom Bundle</a>
                    </div>
                  <?php endif; ?>
                </article>

                <article class="card" id="ordersHistory">
                  <h2>Order History and Invoices</h2>
                  <p class="muted">Filter orders, inspect line items, download invoice PDFs, and resend invoice emails.</p>

                  <form method="get" class="account-order-filter-row">
                    <input type="hidden" name="email" value="<?php echo fr_h($requestedEmail); ?>" />
                    <label>
                      Status Filter
                      <select name="order_status">
                        <option value="">All statuses</option>
                        <?php foreach (['pending', 'paid', 'failed', 'cancelled'] as $statusFilterOption): ?>
                          <option value="<?php echo fr_h($statusFilterOption); ?>" <?php echo $orderStatusFilter === $statusFilterOption ? 'selected' : ''; ?>><?php echo fr_h(ucfirst($statusFilterOption)); ?></option>
                        <?php endforeach; ?>
                      </select>
                    </label>
                    <button class="btn btn-outline" type="submit">Apply</button>
                    <?php if ($orderStatusFilter !== ''): ?>
                      <a class="btn btn-secondary" href="<?php echo fr_h(fr_url('account.php?email=' . rawurlencode($requestedEmail))); ?>">Clear</a>
                    <?php endif; ?>
                  </form>

                  <?php if ($orderCount === 0): ?>
                    <p class="muted">No orders found for this email and filter.</p>
                  <?php else: ?>
                    <div class="account-orders-table-wrap">
                      <table class="account-orders-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Subtotal</th>
                            <th>Discount</th>
                            <th>Tax</th>
                            <th>Total</th>
                            <th>Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          <?php foreach ($orders as $orderRow): ?>
                            <?php
                              $orderId = (int) ($orderRow['id'] ?? 0);
                              $invoiceToken = (string) ($orderRow['access_token'] ?? '');
                              $invoiceHref = $invoiceToken !== ''
                                  ? fr_url('invoice.php?order_id=' . $orderId . '&token=' . rawurlencode($invoiceToken))
                                  : '';
                              $invoicePdfHref = $invoiceHref !== '' ? $invoiceHref . '&format=pdf' : '';

                              $items = finready_parse_order_items((string) ($orderRow['items_json'] ?? '[]'));
                              $subtotalUsd = max(0, (int) ($orderRow['subtotal_usd'] ?? 0));
                              if ($subtotalUsd === 0) {
                                  $subtotalUsd = finready_order_items_subtotal($items);
                              }
                              $discountUsd = max(0, (int) ($orderRow['discount_usd'] ?? 0));
                              $taxUsd = max(0, (int) ($orderRow['tax_usd'] ?? 0));
                              $totalUsd = max(0, (int) ($orderRow['grand_total_usd'] ?? 0));
                              if ($totalUsd === 0) {
                                  $totalUsd = max(0, (int) ($orderRow['total_usd'] ?? 0));
                              }
                              $status = strtolower((string) ($orderRow['status'] ?? 'pending'));
                              $statusClass = account_order_status_class($status);
                            ?>
                            <tr>
                              <td>
                                <strong>#<?php echo $orderId; ?></strong><br />
                                <small><?php echo fr_h((string) ($orderRow['payment_reference'] ?? '')); ?></small>
                              </td>
                              <td><?php echo fr_h(substr((string) ($orderRow['created_at'] ?? ''), 0, 10)); ?></td>
                              <td><span class="status-pill <?php echo fr_h($statusClass); ?>"><?php echo fr_h(ucfirst($status)); ?></span></td>
                              <td>
                                <?php if (count($items) === 0): ?>
                                  <small class="muted">No line items</small>
                                <?php else: ?>
                                  <ul class="account-order-item-list">
                                    <?php foreach ($items as $item): ?>
                                      <li>
                                        <strong><?php echo fr_h((string) ($item['item_name'] ?? 'Item')); ?></strong>
                                        <span><?php echo fr_h(ucfirst((string) ($item['billing_cycle'] ?? 'monthly'))); ?> · <?php echo fr_h(fr_format_price((int) ($item['price_usd'] ?? 0))); ?></span>
                                      </li>
                                    <?php endforeach; ?>
                                  </ul>
                                <?php endif; ?>
                              </td>
                              <td><?php echo fr_h(fr_format_price($subtotalUsd)); ?></td>
                              <td>-<?php echo fr_h(fr_format_price($discountUsd)); ?></td>
                              <td><?php echo fr_h(fr_format_price($taxUsd)); ?></td>
                              <td><strong><?php echo fr_h(fr_format_price($totalUsd)); ?></strong></td>
                              <td>
                                <?php if ($invoiceHref !== ''): ?>
                                  <div class="account-inline-actions">
                                    <a class="btn btn-outline" target="_blank" rel="noopener" href="<?php echo fr_h($invoiceHref); ?>">View</a>
                                    <a class="btn btn-secondary" target="_blank" rel="noopener" href="<?php echo fr_h($invoicePdfHref); ?>">PDF</a>
                                  </div>
                                <?php else: ?>
                                  <small class="muted">Generating invoice...</small>
                                <?php endif; ?>
                                <form method="post" style="margin-top: 6px;">
                                  <input type="hidden" name="action" value="send_invoice_email" />
                                  <input type="hidden" name="customer_email" value="<?php echo fr_h($requestedEmail); ?>" />
                                  <?php if ($orderStatusFilter !== ''): ?>
                                    <input type="hidden" name="order_status" value="<?php echo fr_h($orderStatusFilter); ?>" />
                                  <?php endif; ?>
                                  <input type="hidden" name="order_id" value="<?php echo $orderId; ?>" />
                                  <input type="hidden" name="recipient_email" value="<?php echo fr_h((string) ($profile['invoice_delivery_email'] ?? $requestedEmail)); ?>" />
                                  <button class="btn btn-primary" type="submit">Email Invoice</button>
                                </form>
                              </td>
                            </tr>
                          <?php endforeach; ?>
                        </tbody>
                      </table>
                    </div>
                  <?php endif; ?>
                </article>

                <article class="card account-actions-panel" id="serviceControls">
                  <h2>Support and Data</h2>
                  <p class="muted">Export your account records, get help, and keep service settings in one place.</p>
                  <div class="account-inline-actions">
                    <form method="post">
                      <input type="hidden" name="action" value="export_data" />
                      <input type="hidden" name="customer_email" value="<?php echo fr_h($requestedEmail); ?>" />
                      <?php if ($orderStatusFilter !== ''): ?>
                        <input type="hidden" name="order_status" value="<?php echo fr_h($orderStatusFilter); ?>" />
                      <?php endif; ?>
                      <button class="btn btn-outline" type="submit">Export My Data (JSON)</button>
                    </form>
                    <a class="btn btn-secondary" href="<?php echo fr_h(fr_url('help-center.php')); ?>">Help Center</a>
                    <a class="btn btn-primary" href="<?php echo fr_h(fr_url('book-demo.php')); ?>">Talk to Support</a>
                  </div>
                  <ul class="account-list-muted">
                    <li>Invoice delivery email: <strong><?php echo fr_h((string) ($profile['invoice_delivery_email'] ?? $requestedEmail)); ?></strong></li>
                    <li>Default billing cycle: <strong><?php echo fr_h(ucfirst((string) ($profile['default_billing_cycle'] ?? 'monthly'))); ?></strong></li>
                    <li>Dashboard density: <strong><?php echo fr_h(ucfirst((string) ($profile['dashboard_density'] ?? 'comfortable'))); ?></strong></li>
                    <li>Widgets enabled: <strong><?php echo fr_h((string) count($selectedWidgets)); ?></strong></li>
                  </ul>
                </article>
              </div>
            </div>
          <?php endif; ?>
        </div>
      </section>
    </main>

    <div data-site-footer></div>
    <script src="<?php echo fr_h(fr_url('assets/js/main.js?v=20260327')); ?>"></script>
    <script>
      (function () {
        const url = new URL(window.location.href);
        if (!url.searchParams.get("email")) {
          try {
            const raw = localStorage.getItem("finready_user_session");
            if (raw) {
              const session = JSON.parse(raw);
              const email = session && session.email ? String(session.email) : "";
              if (email) {
                url.searchParams.set("email", email);
                window.location.replace(url.toString());
                return;
              }
            }
          } catch (error) {}
        }

        const body = document.body;
        const densityField = document.querySelector("[data-dashboard-density]");
        const highContrastToggle = document.querySelector("input[name='accessibility_high_contrast']");
        const reducedMotionToggle = document.querySelector("input[name='accessibility_reduced_motion']");

        const syncVisualPrefs = function () {
          if (!body) {
            return;
          }

          const densityMode = densityField ? String(densityField.value || "comfortable") : "comfortable";
          body.classList.toggle("account-density-compact", densityMode === "compact");

          const highContrastEnabled = Boolean(highContrastToggle && highContrastToggle.checked);
          body.classList.toggle("account-high-contrast", highContrastEnabled);

          const reducedMotionEnabled = Boolean(reducedMotionToggle && reducedMotionToggle.checked);
          body.classList.toggle("account-reduced-motion", reducedMotionEnabled);
        };

        if (densityField) {
          densityField.addEventListener("change", syncVisualPrefs);
        }
        if (highContrastToggle) {
          highContrastToggle.addEventListener("change", syncVisualPrefs);
        }
        if (reducedMotionToggle) {
          reducedMotionToggle.addEventListener("change", syncVisualPrefs);
        }

        syncVisualPrefs();
      })();
    </script>
  </body>
</html>
