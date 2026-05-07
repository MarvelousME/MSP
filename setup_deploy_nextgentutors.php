<?php
/**
 * Deploy Smarthead parent & child theme, create pages, activate plugins.
 */

require_once __DIR__.'/wp-load.php';

function log_msg($msg) {
    echo '[' . date('Y-m-d H:i:s') . '] ' . $msg . "\n";
}

log_msg('Starting deployment...');

// 1. Backup step skipped per user request
log_msg('Backup step skipped as per user request.');

// 2. Verify parent theme Smarthead exists
$parent = 'smarthead';
$parent_dir = WP_CONTENT_DIR . '/themes/' . $parent;
if (!is_dir($parent_dir)) {
    log_msg('Parent theme Smarthead NOT found. Manual installation required.');
    exit(1);
}
log_msg('Parent theme Smarthead confirmed.');

// 3. Activate child theme (smarthead-child)
$child = 'smarthead-child';
update_option('template', $parent);
update_option('stylesheet', $child);
log_msg("Activated child theme $child with parent $parent");

// 4. Ensure branding logo exists (do not modify)
$logo_path = WP_CONTENT_DIR . '/themes/smarthead-child/assets/logo-small.png';
if (!file_exists($logo_path)) {
    log_msg('Logo file missing at assets/logo-small.png. Please add the logo manually.');
} else {
    log_msg('Logo already exists.');
}

// 5. Configure NGT Settings (if theme provides option)
if (function_exists('update_option')) {
    $ngt_settings = [
        'phone' => '+27 12 345 6789',
        'email' => 'info@nextgentutors.co.za',
        'whatsapp' => '+27 82 123 4567',
    ];
    update_option('ngt_settings', $ngt_settings);
    log_msg('NGT Settings saved (placeholder values).');
}

// 6. Create required pages
$pages = [
    ['title' => 'Home', 'slug' => '', 'template' => 'front-page.php', 'front' => true],
    ['title' => 'Find a Tutor', 'slug' => 'find-a-tutor', 'template' => 'page-find-tutor.php'],
    ['title' => 'Become a Tutor', 'slug' => 'become-a-tutor', 'template' => 'page-become-tutor.php'],
    ['title' => 'Pricing', 'slug' => 'pricing', 'template' => 'page-pricing.php'],
    ['title' => 'Contact', 'slug' => 'contact', 'template' => 'page-contact.php'],
    ['title' => 'About Us', 'slug' => 'about-us', 'template' => 'page-about.php'],
];
foreach ($pages as $p) {
    $existing = get_page_by_path($p['slug'] ?: 'home');
    if ($existing) {
        log_msg("Page {$p['title']} already exists (ID {$existing->ID}). Skipping.");
        continue;
    }
    $post_id = wp_insert_post([
        'post_title'   => $p['title'],
        'post_name'    => $p['slug'],
        'post_status'  => 'publish',
        'post_type'    => 'page',
        'post_content' => '',
    ]);
    if (is_wp_error($post_id)) {
        log_msg('Error creating '.$p['title'].': '.$post_id->get_error_message());
        continue;
    }
    if (!empty($p['template'])) {
        update_post_meta($post_id, '_wp_page_template', $p['template']);
    }
    if (!empty($p['front'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $post_id);
    }
    log_msg("Created page {$p['title']} (ID $post_id).);
}

// 7. Activate core plugins (must already be present)
$plugins = [
    'elementor/elementor.php',
    'ameliabooking/ameliabooking.php',
    'revslider/revslider.php',
    'fluentform/fluentform.php',
    'woocommerce/woocommerce.php',
];
foreach ($plugins as $plugin) {
    if (!is_plugin_active($plugin)) {
        $result = activate_plugin($plugin);
        if (is_wp_error($result)) {
            log_msg("Failed to activate $plugin: {$result->get_error_message()}");
        } else {
            log_msg("Activated plugin $plugin");
        }
    } else {
        log_msg("Plugin $plugin already active.");
    }
}

// 8. Import Elementor JSON templates (if folder exists)
$templates_dir = WP_CONTENT_DIR . '/themes/smarthead-child/elementor-templates';
if (is_dir($templates_dir)) {
    $files = glob($templates_dir.'/*.json');
    foreach ($files as $file) {
        $content = file_get_contents($file);
        if ($content) {
            $import = Elementor\Plugin::$instance->templates_manager->import_template($content);
            if (is_wp_error($import)) {
                log_msg('Failed to import '.basename($file).': '.$import->get_error_message());
            } else {
                log_msg('Imported Elementor template '.basename($file));
            }
        }
    }
}

log_msg('Deployment completed.');
?>
