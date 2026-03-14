<?php
/**
 * Admin Dashboard
 */

session_start();
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../includes/functions.php';

if (!isAuthenticated()) {
    header('Location: login.php');
    exit();
}

$database = new Database();
$db = $database->getConnection();

// Get dashboard statistics
try {
    // Count orders
    $orders_query = "SELECT COUNT(*) as total FROM orders";
    $orders_stmt = $db->prepare($orders_query);
    $orders_stmt->execute();
    $orders_count = $orders_stmt->fetch()['total'];
    
    // Count pending orders
    $pending_query = "SELECT COUNT(*) as total FROM orders WHERE order_status IN ('placed', 'confirmed', 'processing')";
    $pending_stmt = $db->prepare($pending_query);
    $pending_stmt->execute();
    $pending_orders = $pending_stmt->fetch()['total'];
    
    // Count job applications
    $apps_query = "SELECT COUNT(*) as total FROM job_applications WHERE status = 'pending'";
    $apps_stmt = $db->prepare($apps_query);
    $apps_stmt->execute();
    $pending_apps = $apps_stmt->fetch()['total'];
    
    // Count partnership inquiries
    $partnership_query = "SELECT COUNT(*) as total FROM partnership_inquiries WHERE status = 'pending'";
    $partnership_stmt = $db->prepare($partnership_query);
    $partnership_stmt->execute();
    $pending_partnerships = $partnership_stmt->fetch()['total'];
    
    // Recent orders
    $recent_orders_query = "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5";
    $recent_orders_stmt = $db->prepare($recent_orders_query);
    $recent_orders_stmt->execute();
    $recent_orders = $recent_orders_stmt->fetchAll();
    
} catch (Exception $e) {
    error_log("Dashboard error: " . $e->getMessage());
}

$page_title = "Dashboard";
include 'includes/header.php';
?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h3 mb-4">Dashboard</h1>
        </div>
    </div>
    
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card text-white bg-primary">
                <div class="card-body">
                    <h5 class="card-title">Total Orders</h5>
                    <h2 class="mb-0"><?php echo $orders_count ?? 0; ?></h2>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-warning">
                <div class="card-body">
                    <h5 class="card-title">Pending Orders</h5>
                    <h2 class="mb-0"><?php echo $pending_orders ?? 0; ?></h2>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-info">
                <div class="card-body">
                    <h5 class="card-title">Job Applications</h5>
                    <h2 class="mb-0"><?php echo $pending_apps ?? 0; ?></h2>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-success">
                <div class="card-body">
                    <h5 class="card-title">Partnership Inquiries</h5>
                    <h2 class="mb-0"><?php echo $pending_partnerships ?? 0; ?></h2>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Recent Orders -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Recent Orders</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Order Number</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (!empty($recent_orders)): ?>
                                    <?php foreach ($recent_orders as $order): ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($order['order_number']); ?></td>
                                            <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
                                            <td><span class="badge bg-secondary"><?php echo ucfirst(str_replace('_', ' ', $order['order_status'])); ?></span></td>
                                            <td><?php echo date('d M Y', strtotime($order['created_at'])); ?></td>
                                            <td><a href="orders/view.php?id=<?php echo $order['id']; ?>" class="btn btn-sm btn-primary">View</a></td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="5" class="text-center">No orders yet</td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>