<?php
if (!isset($page_title)) {
    $page_title = 'Admin Panel';
}

// Calculate base path to admin root
// Get the directory of the currently executing script
$script_dir = dirname($_SERVER['PHP_SELF']);
$script_dir = str_replace('\\', '/', $script_dir);
$script_dir = trim($script_dir, '/');

// Find the 'admin' directory in the path
$path_parts = explode('/', $script_dir);
$admin_index = array_search('admin', $path_parts);

if ($admin_index !== false) {
    // Calculate how many directories deep we are from admin root
    // If we're at admin/homepage/, we need to go up 1 level (../)
    // If we're at admin/, we need no prefix
    $depth_from_admin = count($path_parts) - ($admin_index + 1);
    $base_path = $depth_from_admin > 0 ? str_repeat('../', $depth_from_admin) : '';
    
    // Calculate API base path - need to go up from admin to root, then into api
    // From admin/homepage/ -> ../../api/
    // From admin/ -> ../api/
    $api_base_path = str_repeat('../', $depth_from_admin + 1) . 'api/';
} else {
    // Fallback: if we can't find 'admin' in path, assume we're in admin root
    $base_path = '';
    $api_base_path = '../api/';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($page_title); ?> - Duxbed Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #E69B0A;
            --sidebar-width: 250px;
        }
        body {
            background-color: #f8f9fa;
        }
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: var(--sidebar-width);
            background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 0;
            z-index: 1000;
            overflow-y: auto;
        }
        .sidebar-header {
            padding: 1.5rem;
            background: rgba(0,0,0,0.2);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-menu {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .sidebar-menu li {
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-divider {
            padding: 0.75rem 1.5rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: rgba(255,255,255,0.5);
            font-weight: 600;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .sidebar-divider span {
            display: block;
        }
        .sidebar-menu a {
            display: block;
            padding: 1rem 1.5rem;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            transition: all 0.3s;
        }
        .sidebar-menu a:hover,
        .sidebar-menu a.active {
            background: var(--primary-color);
            color: white;
            padding-left: 2rem;
        }
        .sidebar-menu a i {
            width: 20px;
            margin-right: 10px;
        }
        .main-content {
            margin-left: var(--sidebar-width);
            padding: 2rem;
        }
        .navbar-top {
            background: white;
            padding: 1rem 2rem;
            margin-left: var(--sidebar-width);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card {
            border: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <div class="sidebar-header">
            <h4><i class="bi bi-house"></i> Duxbed Admin</h4>
            <small class="text-muted">Welcome, <?php echo htmlspecialchars($_SESSION['admin_name'] ?? 'Admin'); ?></small>
        </div>
        <ul class="sidebar-menu">
            <li><a href="<?php echo $base_path; ?>index.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a></li>
            <li><a href="<?php echo $base_path; ?>homepage/videos.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'homepage') !== false ? 'active' : ''; ?>">
                <i class="bi bi-play-circle"></i> Homepage Videos
            </a></li>
            <li><a href="<?php echo $base_path; ?>projects/list.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'projects') !== false ? 'active' : ''; ?>">
                <i class="bi bi-images"></i> Premium Projects
            </a></li>
            <li><a href="<?php echo $base_path; ?>products/list.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'products') !== false ? 'active' : ''; ?>">
                <i class="bi bi-box-seam"></i> Products
            </a></li>
            <li class="sidebar-divider"><span>Content Management</span></li>
            <li><a href="<?php echo $base_path; ?>content/about-us.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'content/about-us') !== false ? 'active' : ''; ?>">
                <i class="bi bi-file-text"></i> About Us
            </a></li>
            <li><a href="<?php echo $base_path; ?>content/story-timeline.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'content/story-timeline') !== false ? 'active' : ''; ?>">
                <i class="bi bi-clock-history"></i> Our Story
            </a></li>
            <li><a href="<?php echo $base_path; ?>content/leadership.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'content/leadership') !== false ? 'active' : ''; ?>">
                <i class="bi bi-people"></i> Leadership
            </a></li>
            <li><a href="<?php echo $base_path; ?>content/why-duxbed.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'content/why-duxbed') !== false ? 'active' : ''; ?>">
                <i class="bi bi-star"></i> Why Duxbed
            </a></li>
            <li><a href="<?php echo $base_path; ?>content/contact-details.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'content/contact-details') !== false ? 'active' : ''; ?>">
                <i class="bi bi-telephone"></i> Contact Details
            </a></li>
            <li><a href="<?php echo $base_path; ?>brochures/list.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'brochures') !== false ? 'active' : ''; ?>">
                <i class="bi bi-file-earmark-pdf"></i> Brochures
            </a></li>
            <li class="sidebar-divider"><span>Other</span></li>
            <li><a href="<?php echo $base_path; ?>media/list.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'media') !== false ? 'active' : ''; ?>">
                <i class="bi bi-newspaper"></i> Media & News
            </a></li>
            <li><a href="<?php echo $base_path; ?>careers/jobs.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'careers') !== false ? 'active' : ''; ?>">
                <i class="bi bi-briefcase"></i> Careers
            </a></li>
            <li><a href="<?php echo $base_path; ?>locations/list.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'locations') !== false ? 'active' : ''; ?>">
                <i class="bi bi-geo-alt"></i> Franchise Locations
            </a></li>
            <li><a href="<?php echo $base_path; ?>orders/list.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'orders') !== false ? 'active' : ''; ?>">
                <i class="bi bi-box-seam"></i> Orders
            </a></li>
            <li><a href="<?php echo $base_path; ?>partnership/list.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'partnership') !== false ? 'active' : ''; ?>">
                <i class="bi bi-box-seam"></i> Partnerships
            </a></li>
            <li><a href="<?php echo $base_path; ?>testimonials/list.php" class="<?php echo strpos($_SERVER['PHP_SELF'], 'testimonials') !== false ? 'active' : ''; ?>">
                <i class="bi bi-chat-quote"></i> Testimonials
            </a></li>
            <li><a href="<?php echo $base_path; ?>logout.php" class="text-danger">
                <i class="bi bi-box-arrow-right"></i> Logout
            </a></li>
        </ul>
    </div>
    
    <!-- Top Navbar -->
    <nav class="navbar-top">
        <div class="d-flex justify-content-between align-items-center w-100">
            <h5 class="mb-0"><?php echo htmlspecialchars($page_title); ?></h5>
            <div>
                <span class="text-muted"><?php echo htmlspecialchars($_SESSION['admin_username'] ?? ''); ?></span>
                <a href="<?php echo $base_path; ?>logout.php" class="btn btn-sm btn-outline-danger ms-3">
                    <i class="bi bi-box-arrow-right"></i> Logout
                </a>
            </div>
        </div>
    </nav>
    
    <!-- Main Content -->
    <div class="main-content">

