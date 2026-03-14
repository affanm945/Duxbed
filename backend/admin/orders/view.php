<?php
/**
 * View Order Details
 */

session_start();
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

if (!isAuthenticated()) {
    header('Location: ../login.php');
    exit();
}

$database = new Database();
$db = $database->getConnection();

$order_id = $_GET['id'] ?? null;

if (!$order_id) {
    header('Location: list.php');
    exit();
}

try {
    // Get order
    $query = "SELECT * FROM orders WHERE id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $order_id);
    $stmt->execute();
    $order = $stmt->fetch();
    
    if (!$order) {
        header('Location: list.php');
        exit();
    }
    
    // Get order items
    $items_query = "SELECT * FROM order_items WHERE order_id = :order_id";
    $items_stmt = $db->prepare($items_query);
    $items_stmt->bindParam(':order_id', $order_id);
    $items_stmt->execute();
    $items = $items_stmt->fetchAll();
    
    // Get tracking history
    $history_query = "SELECT oth.*, au.username as updated_by_name 
                     FROM order_tracking_history oth 
                     LEFT JOIN admin_users au ON oth.updated_by = au.id
                     WHERE oth.order_id = :order_id 
                     ORDER BY oth.created_at ASC";
    $history_stmt = $db->prepare($history_query);
    $history_stmt->bindParam(':order_id', $order_id);
    $history_stmt->execute();
    $history = $history_stmt->fetchAll();
    
} catch (Exception $e) {
    error_log("Error fetching order: " . $e->getMessage());
    header('Location: list.php');
    exit();
}

$page_title = "Order #" . $order['order_number'];
include '../includes/header.php';
?>

<div class="mb-4">
    <a href="list.php" class="btn btn-secondary">
        <i class="bi bi-arrow-left"></i> Back to Orders
    </a>
</div>

<div class="row">
    <div class="col-md-8">
        <!-- Order Details -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Order Details</h5>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong>Order Number:</strong><br>
                        <h4><?php echo htmlspecialchars($order['order_number']); ?></h4>
                    </div>
                    <div class="col-md-6">
                        <strong>Status:</strong><br>
                        <span class="badge bg-primary fs-6">
                            <?php echo ucfirst(str_replace('_', ' ', $order['order_status'])); ?>
                        </span>
                    </div>
                </div>
                
                <hr>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6>Customer Information</h6>
                        <p class="mb-1"><strong>Name:</strong> <?php echo htmlspecialchars($order['customer_name']); ?></p>
                        <p class="mb-1"><strong>Email:</strong> <?php echo htmlspecialchars($order['customer_email']); ?></p>
                        <p class="mb-1"><strong>Phone:</strong> <?php echo htmlspecialchars($order['customer_phone']); ?></p>
                    </div>
                    <div class="col-md-6">
                        <h6>Delivery Information</h6>
                        <p class="mb-1"><strong>Address:</strong><br><?php echo nl2br(htmlspecialchars($order['delivery_address'])); ?></p>
                        <p class="mb-1"><strong>Estimated Delivery:</strong> <?php echo $order['estimated_delivery_date'] ? date('d M Y', strtotime($order['estimated_delivery_date'])) : 'Not set'; ?></p>
                        <?php if ($order['tracking_number']): ?>
                            <p class="mb-1"><strong>Tracking Number:</strong> <?php echo htmlspecialchars($order['tracking_number']); ?></p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Order Items -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Order Items</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            $grand_total = 0;
                            foreach ($items as $item): 
                                $item_total = $item['quantity'] * $item['price'];
                                $grand_total += $item_total;
                            ?>
                                <tr>
                                    <td>
                                        <?php if ($item['image_url']): ?>
                                            <img src="<?php echo htmlspecialchars($item['image_url']); ?>" alt="" style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
                                        <?php endif; ?>
                                        <?php echo htmlspecialchars($item['product_name']); ?>
                                    </td>
                                    <td><?php echo $item['quantity']; ?></td>
                                    <td>₹<?php echo number_format($item['price'], 2); ?></td>
                                    <td>₹<?php echo number_format($item_total, 2); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="3" class="text-end">Grand Total:</th>
                                <th>₹<?php echo number_format($grand_total, 2); ?></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Tracking History -->
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Tracking History</h5>
            </div>
            <div class="card-body">
                <div class="timeline">
                    <?php foreach ($history as $entry): ?>
                        <div class="mb-4 pb-4 border-bottom">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="mb-1"><?php echo ucfirst(str_replace('_', ' ', $entry['status'])); ?></h6>
                                    <p class="mb-1 text-muted"><?php echo nl2br(htmlspecialchars($entry['description'])); ?></p>
                                    <?php if ($entry['location']): ?>
                                        <small class="text-muted"><i class="bi bi-geo-alt"></i> <?php echo htmlspecialchars($entry['location']); ?></small>
                                    <?php endif; ?>
                                    <?php if ($entry['updated_by_name']): ?>
                                        <br><small class="text-muted">Updated by: <?php echo htmlspecialchars($entry['updated_by_name']); ?></small>
                                    <?php endif; ?>
                                </div>
                                <div class="text-end">
                                    <?php if ($entry['image_url']): ?>
                                        <img src="<?php echo htmlspecialchars($entry['image_url']); ?>" alt="" style="width: 100px; height: 100px; object-fit: cover;" class="mb-2"><br>
                                    <?php endif; ?>
                                    <small class="text-muted"><?php echo date('d M Y, h:i A', strtotime($entry['created_at'])); ?></small>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <!-- Quick Actions -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
                <button class="btn btn-primary w-100 mb-2" onclick="updateStatus(<?php echo $order['id']; ?>, '<?php echo $order['order_status']; ?>')">
                    <i class="bi bi-pencil"></i> Update Status
                </button>
                <a href="list.php" class="btn btn-secondary w-100">
                    <i class="bi bi-list"></i> Back to List
                </a>
            </div>
        </div>
        
        <!-- Order Notes -->
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Order Notes</h5>
            </div>
            <div class="card-body">
                <?php if ($order['notes']): ?>
                    <p><?php echo nl2br(htmlspecialchars($order['notes'])); ?></p>
                <?php else: ?>
                    <p class="text-muted">No notes</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Update Status Modal (same as in list.php) -->
<div class="modal fade" id="updateStatusModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Update Order Status</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="statusForm">
                <div class="modal-body">
                    <input type="hidden" id="order_id" name="order_id" value="<?php echo $order['id']; ?>">
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="order_status" name="status" required>
                            <option value="placed" <?php echo $order['order_status'] === 'placed' ? 'selected' : ''; ?>>Placed</option>
                            <option value="confirmed" <?php echo $order['order_status'] === 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                            <option value="processing" <?php echo $order['order_status'] === 'processing' ? 'selected' : ''; ?>>Processing</option>
                            <option value="shipped" <?php echo $order['order_status'] === 'shipped' ? 'selected' : ''; ?>>Shipped</option>
                            <option value="in_transit" <?php echo $order['order_status'] === 'in_transit' ? 'selected' : ''; ?>>In Transit</option>
                            <option value="delivered" <?php echo $order['order_status'] === 'delivered' ? 'selected' : ''; ?>>Delivered</option>
                            <option value="cancelled" <?php echo $order['order_status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Estimated Delivery Date</label>
                        <input type="date" class="form-control" id="estimated_delivery" name="estimated_delivery_date" value="<?php echo $order['estimated_delivery_date'] ? date('Y-m-d', strtotime($order['estimated_delivery_date'])) : ''; ?>">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Tracking Number</label>
                        <input type="text" class="form-control" id="tracking_number" name="tracking_number" value="<?php echo htmlspecialchars($order['tracking_number'] ?? ''); ?>">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" id="location" name="location">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Status</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function updateStatus(orderId, currentStatus) {
    document.getElementById('order_id').value = orderId;
    document.getElementById('order_status').value = currentStatus;
    new bootstrap.Modal(document.getElementById('updateStatusModal')).show();
}

document.getElementById('statusForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        order_id: document.getElementById('order_id').value,
        status: document.getElementById('order_status').value,
        estimated_delivery_date: document.getElementById('estimated_delivery').value || null,
        tracking_number: document.getElementById('tracking_number').value || null,
        location: document.getElementById('location').value || null,
        description: document.getElementById('description').value || null
    };
    
    const result = await apiCall('orders/update.php', 'PUT', formData);
    
    if (result.success) {
        location.reload();
    } else {
        alert('Error: ' + result.message);
    }
});
</script>

<?php include '../includes/footer.php'; ?>

