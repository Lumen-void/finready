<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/public.php';
require_once __DIR__ . '/includes/billing.php';

$adminBootstrap = __DIR__ . '/admin-panel/includes/bootstrap.php';
$isAdminView = false;
if (is_file($adminBootstrap)) {
    require_once $adminBootstrap;
    if (function_exists('admin_current_user') && is_array(admin_current_user())) {
        $isAdminView = true;
    }
}

$pdo = finready_db();
$orderId = (int) ($_GET['order_id'] ?? 0);
$format = strtolower(trim((string) ($_GET['format'] ?? 'html')));
$token = trim((string) ($_GET['token'] ?? ''));

if ($orderId <= 0) {
    http_response_code(400);
    echo 'Invalid order id.';
    exit;
}

$order = finready_get_checkout_order($pdo, $orderId);
if (!is_array($order)) {
    http_response_code(404);
    echo 'Order not found.';
    exit;
}

$invoice = finready_create_or_update_invoice($pdo, $orderId);
if (!is_array($invoice)) {
    http_response_code(500);
    echo 'Could not load invoice.';
    exit;
}

if (!$isAdminView) {
    $invoiceToken = (string) ($invoice['access_token'] ?? '');
    if ($token === '' || $invoiceToken === '' || !hash_equals($invoiceToken, $token)) {
        http_response_code(403);
        echo 'Unauthorized invoice access.';
        exit;
    }
}

$profile = finready_get_customer_profile($pdo, (string) ($order['customer_email'] ?? ''));

if ($format === 'pdf') {
    $relativePath = finready_generate_invoice_pdf($pdo, $invoice, $order, $profile);
    $absolutePath = __DIR__ . '/' . ltrim($relativePath, '/');
    if (!is_file($absolutePath)) {
        http_response_code(500);
        echo 'Could not generate PDF.';
        exit;
    }

    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="invoice-' . preg_replace('/[^A-Z0-9\-]/', '', strtoupper((string) ($invoice['invoice_number'] ?? 'invoice'))) . '.pdf"');
    header('Content-Length: ' . filesize($absolutePath));
    readfile($absolutePath);
    exit;
}

echo finready_invoice_html($invoice, $order, $profile);
