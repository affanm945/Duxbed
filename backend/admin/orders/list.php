<?php
/**
 * Orders Management
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

$status_filter = $_GET['status'] ?? '';
$search = $_GET['search'] ?? '';

try {
    $query = "SELECT o.*, COUNT(oi.id) as item_count 
              FROM orders o 
              LEFT JOIN order_items oi ON o.id = oi.order_id 
              WHERE 1=1";
    $params = [];
    
    if ($status_filter) {
        $query .= " AND o.order_status = :status";
        $params[':status'] = $status_filter;
    }
    
    if ($search) {
        $query .= " AND (o.order_number LIKE :search OR o.customer_name LIKE :search OR o.customer_email LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    $query .= " GROUP BY o.id ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $orders = $stmt->fetchAll();
} catch (Exception $e) {
    $orders = [];
    error_log("Error fetching orders: " . $e->getMessage());
}

$page_title = "Orders Management";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Orders Management</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addOrderModal">
        <i class="bi bi-plus-circle"></i> Create Order
    </button>
</div>

<!-- Filters -->
<div class="card mb-4">
    <div class="card-body">
        <form method="GET" class="row g-3">
            <div class="col-md-4">
                <input type="text" class="form-control" name="search" placeholder="Search orders..." value="<?php echo htmlspecialchars($search); ?>">
            </div>
            <div class="col-md-3">
                <select class="form-select" name="status">
                    <option value="">All Statuses</option>
                    <option value="placed" <?php echo $status_filter === 'placed' ? 'selected' : ''; ?>>Placed</option>
                    <option value="confirmed" <?php echo $status_filter === 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                    <option value="processing" <?php echo $status_filter === 'processing' ? 'selected' : ''; ?>>Processing</option>
                    <option value="shipped" <?php echo $status_filter === 'shipped' ? 'selected' : ''; ?>>Shipped</option>
                    <option value="in_transit" <?php echo $status_filter === 'in_transit' ? 'selected' : ''; ?>>In Transit</option>
                    <option value="delivered" <?php echo $status_filter === 'delivered' ? 'selected' : ''; ?>>Delivered</option>
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100">Filter</button>
            </div>
            <div class="col-md-2">
                <a href="list.php" class="btn btn-secondary w-100">Clear</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Order Date</th>
                        <th>Est. Delivery</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orders as $order): ?>
                        <tr>
                            <td><strong><?php echo htmlspecialchars($order['order_number']); ?></strong></td>
                            <td>
                                <?php echo htmlspecialchars($order['customer_name']); ?><br>
                                <small class="text-muted"><?php echo htmlspecialchars($order['customer_email']); ?></small>
                            </td>
                            <td><?php echo $order['item_count']; ?> item(s)</td>
                            <td>
                                <span class="badge bg-<?php 
                                    echo match($order['order_status']) {
                                        'delivered' => 'success',
                                        'shipped', 'in_transit' => 'info',
                                        'processing', 'confirmed' => 'warning',
                                        default => 'secondary'
                                    };
                                ?>">
                                    <?php echo ucfirst(str_replace('_', ' ', $order['order_status'])); ?>
                                </span>
                            </td>
                            <td><?php echo date('d M Y', strtotime($order['created_at'])); ?></td>
                            <td><?php echo $order['estimated_delivery_date'] ? date('d M Y', strtotime($order['estimated_delivery_date'])) : '-'; ?></td>
                            <td>
                                <a href="view.php?id=<?php echo $order['id']; ?>" class="btn btn-sm btn-primary">
                                    <i class="bi bi-eye"></i> View
                                </a>
                                <button class="btn btn-sm btn-success" onclick="updateStatus(<?php echo $order['id']; ?>, '<?php echo $order['order_status']; ?>')">
                                    <i class="bi bi-pencil"></i> Update
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Create Order Modal -->
<div class="modal fade" id="addOrderModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Create New Order</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="createOrderForm">
                <div class="modal-body">
                    <h6 class="mb-3">Customer Information</h6>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Customer Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="customer_name" name="customer_name" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Customer Email</label>
                            <input type="email" class="form-control" id="customer_email" name="customer_email">
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Customer Phone</label>
                            <input type="text" class="form-control" id="customer_phone" name="customer_phone">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Order Status</label>
                            <select class="form-select" id="order_status" name="order_status">
                                <option value="placed">Placed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Delivery Address</label>
                        <textarea class="form-control" id="delivery_address" name="delivery_address" rows="2"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Notes</label>
                        <textarea class="form-control" id="notes" name="notes" rows="2"></textarea>
                    </div>
                    
                    <hr>
                    <h6 class="mb-3">Order Items <span class="text-danger">*</span></h6>
                    <div id="orderItems">
                        <div class="order-item mb-3 p-3 border rounded">
                            <div class="row">
                                <div class="col-md-5">
                                    <label class="form-label">Product Name</label>
                                    <input type="text" class="form-control item-product-name" name="items[0][product_name]" required>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Quantity</label>
                                    <input type="number" class="form-control item-quantity" name="items[0][quantity]" value="1" min="1" required>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Price</label>
                                    <input type="number" class="form-control item-price" name="items[0][price]" step="0.01" min="0" required>
                                </div>
                                <div class="col-md-1">
                                    <label class="form-label">&nbsp;</label>
                                    <button type="button" class="btn btn-sm btn-danger w-100 remove-item-btn">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="addItemBtn">
                        <i class="bi bi-plus-circle"></i> Add Item
                    </button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Order</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Update Status Modal -->
<div class="modal fade" id="updateStatusModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Update Order Status</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="statusForm">
                <div class="modal-body">
                    <input type="hidden" id="order_id" name="order_id">
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="order_status" name="status" required>
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Estimated Delivery Date</label>
                        <input type="date" class="form-control" id="estimated_delivery" name="estimated_delivery_date">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Tracking Number</label>
                        <input type="text" class="form-control" id="tracking_number" name="tracking_number">
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
// Create Order Modal functionality
let itemCount = 1;

// Add remove functionality to initial item
document.addEventListener('DOMContentLoaded', function() {
    const initialRemoveBtn = document.querySelector('.order-item .remove-item-btn');
    if (initialRemoveBtn) {
        initialRemoveBtn.addEventListener('click', function() {
            const itemsContainer = document.getElementById('orderItems');
            if (itemsContainer.querySelectorAll('.order-item').length > 1) {
                this.closest('.order-item').remove();
            } else {
                alert('At least one item is required');
            }
        });
    }
});

document.getElementById('addItemBtn').addEventListener('click', function() {
    const itemsContainer = document.getElementById('orderItems');
    const newItem = document.createElement('div');
    newItem.className = 'order-item mb-3 p-3 border rounded';
    newItem.innerHTML = `
        <div class="row">
            <div class="col-md-5">
                <label class="form-label">Product Name</label>
                <input type="text" class="form-control item-product-name" name="items[${itemCount}][product_name]" required>
            </div>
            <div class="col-md-3">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-control item-quantity" name="items[${itemCount}][quantity]" value="1" min="1" required>
            </div>
            <div class="col-md-3">
                <label class="form-label">Price</label>
                <input type="number" class="form-control item-price" name="items[${itemCount}][price]" step="0.01" min="0" required>
            </div>
            <div class="col-md-1">
                <label class="form-label">&nbsp;</label>
                <button type="button" class="btn btn-sm btn-danger w-100 remove-item-btn">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
    itemsContainer.appendChild(newItem);
    
    itemCount++;
    
    // Add remove functionality
    newItem.querySelector('.remove-item-btn').addEventListener('click', function() {
        const itemsContainer = document.getElementById('orderItems');
        if (itemsContainer.querySelectorAll('.order-item').length > 1) {
            newItem.remove();
        } else {
            alert('At least one item is required');
        }
    });
});

// Handle form submission
document.getElementById('createOrderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creating...';
    
    const formData = {
        customer_name: document.getElementById('customer_name').value,
        customer_email: document.getElementById('customer_email').value || null,
        customer_phone: document.getElementById('customer_phone').value || null,
        order_status: document.getElementById('order_status').value,
        delivery_address: document.getElementById('delivery_address').value || null,
        notes: document.getElementById('notes').value || null,
        items: []
    };
    
    // Collect items and upload images
    const itemElements = document.querySelectorAll('.order-item');
    
    try {
        for (let item of itemElements) {
            const productName = item.querySelector('.item-product-name').value;
            const quantity = parseInt(item.querySelector('.item-quantity').value);
            const price = parseFloat(item.querySelector('.item-price').value);
            
            if (productName && quantity && price) {
                formData.items.push({
                    product_name: productName,
                    quantity: quantity,
                    price: price,
                    image_url: null
                });
            }
        }
        
        if (formData.items.length === 0) {
            alert('Please add at least one order item');
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            return;
        }
        
        const result = await apiCall('orders/create.php', 'POST', formData);
        
        if (result.success) {
            alert('Order created successfully! Order #: ' + result.order_number);
            location.reload();
        } else {
            alert('Error: ' + result.message);
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Error creating order:', error);
        alert('An error occurred while creating the order');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

// Reset form when modal is closed
document.getElementById('addOrderModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('createOrderForm').reset();
    document.getElementById('orderItems').innerHTML = `
        <div class="order-item mb-3 p-3 border rounded">
            <div class="row">
                <div class="col-md-5">
                    <label class="form-label">Product Name</label>
                    <input type="text" class="form-control item-product-name" name="items[0][product_name]" required>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control item-quantity" name="items[0][quantity]" value="1" min="1" required>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Price</label>
                    <input type="number" class="form-control item-price" name="items[0][price]" step="0.01" min="0" required>
                </div>
                <div class="col-md-1">
                    <label class="form-label">&nbsp;</label>
                    <button type="button" class="btn btn-sm btn-danger w-100 remove-item-btn">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    itemCount = 1;
    
    // Re-add remove functionality to reset item
    const resetRemoveBtn = document.querySelector('.order-item .remove-item-btn');
    if (resetRemoveBtn) {
        resetRemoveBtn.addEventListener('click', function() {
            const itemsContainer = document.getElementById('orderItems');
            if (itemsContainer.querySelectorAll('.order-item').length > 1) {
                this.closest('.order-item').remove();
            } else {
                alert('At least one item is required');
            }
        });
    }
});

async function updateStatus(orderId, currentStatus) {
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

