<?php
/**
 * Partnership Inquiries Management
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
$eligibility_filter = $_GET['eligibility'] ?? '';

try {
    $query = "SELECT * FROM partnership_inquiries WHERE 1=1";
    $params = [];
    
    if ($status_filter) {
        $query .= " AND status = :status";
        $params[':status'] = $status_filter;
    }
    
    if ($eligibility_filter) {
        $query .= " AND eligibility_status = :eligibility";
        $params[':eligibility'] = $eligibility_filter;
    }
    
    $query .= " ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $inquiries = $stmt->fetchAll();
} catch (Exception $e) {
    $inquiries = [];
    error_log("Error fetching inquiries: " . $e->getMessage());
}

$page_title = "Partnership Inquiries";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Partnership Inquiries</h2>
</div>

<!-- Filters -->
<div class="card mb-4">
    <div class="card-body">
        <form method="GET" class="row g-3">
            <div class="col-md-4">
                <select class="form-select" name="status">
                    <option value="">All Statuses</option>
                    <option value="pending" <?php echo $status_filter === 'pending' ? 'selected' : ''; ?>>Pending</option>
                    <option value="contacted" <?php echo $status_filter === 'contacted' ? 'selected' : ''; ?>>Contacted</option>
                    <option value="approved" <?php echo $status_filter === 'approved' ? 'selected' : ''; ?>>Approved</option>
                    <option value="rejected" <?php echo $status_filter === 'rejected' ? 'selected' : ''; ?>>Rejected</option>
                </select>
            </div>
            <div class="col-md-4">
                <select class="form-select" name="eligibility">
                    <option value="">All Eligibility</option>
                    <option value="eligible" <?php echo $eligibility_filter === 'eligible' ? 'selected' : ''; ?>>Eligible</option>
                    <option value="not_eligible" <?php echo $eligibility_filter === 'not_eligible' ? 'selected' : ''; ?>>Not Eligible</option>
                    <option value="pending" <?php echo $eligibility_filter === 'pending' ? 'selected' : ''; ?>>Pending</option>
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
                        <th>ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>District</th>
                        <th>Pincode</th>
                        <th>Space (sqft)</th>
                        <th>Eligibility</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($inquiries as $inquiry): ?>
                        <tr>
                            <td><?php echo $inquiry['id']; ?></td>
                            <td>
                                <strong><?php echo htmlspecialchars($inquiry['name']); ?></strong><br>
                                <small class="text-muted"><?php echo htmlspecialchars($inquiry['email']); ?></small>
                            </td>
                            <td><?php echo htmlspecialchars($inquiry['location']); ?></td>
                            <td><?php echo htmlspecialchars($inquiry['district'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($inquiry['pincode'] ?? '-'); ?></td>
                            <td><?php echo number_format($inquiry['space_availability']); ?></td>
                            <td>
                                <span class="badge bg-<?php echo $inquiry['eligibility_status'] === 'eligible' ? 'success' : ($inquiry['eligibility_status'] === 'not_eligible' ? 'danger' : 'warning'); ?>">
                                    <?php echo ucfirst(str_replace('_', ' ', $inquiry['eligibility_status'])); ?>
                                </span>
                            </td>
                            <td>
                                <span class="badge bg-<?php 
                                    echo match($inquiry['status']) {
                                        'approved' => 'success',
                                        'contacted' => 'info',
                                        'rejected' => 'danger',
                                        default => 'secondary'
                                    };
                                ?>">
                                    <?php echo ucfirst($inquiry['status']); ?>
                                </span>
                            </td>
                            <td><?php echo date('d M Y', strtotime($inquiry['created_at'])); ?></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewInquiry(<?php echo htmlspecialchars(json_encode($inquiry)); ?>)">
                                    <i class="bi bi-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- View Inquiry Modal -->
<div class="modal fade" id="viewInquiryModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Partnership Inquiry Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="inquiryDetails">
                <!-- Content loaded dynamically -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<script>
function viewInquiry(inquiry) {
    const details = `
        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Name:</strong><br>
                ${inquiry.name}
            </div>
            <div class="col-md-6">
                <strong>Email:</strong><br>
                ${inquiry.email}
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Phone:</strong><br>
                ${inquiry.phone || '-'}
            </div>
            <div class="col-md-6">
                <strong>Location:</strong><br>
                ${inquiry.location}
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-4">
                <strong>District:</strong><br>
                ${inquiry.district || '-'}
            </div>
            <div class="col-md-4">
                <strong>Pincode:</strong><br>
                ${inquiry.pincode || '-'}
            </div>
            <div class="col-md-4">
                <strong>Space Availability:</strong><br>
                ${inquiry.space_availability.toLocaleString()} sqft
            </div>
            <div class="col-md-4">
                <strong>Eligibility:</strong><br>
                <span class="badge bg-${inquiry.eligibility_status === 'eligible' ? 'success' : (inquiry.eligibility_status === 'not_eligible' ? 'danger' : 'warning')}">
                    ${inquiry.eligibility_status.replace('_', ' ').toUpperCase()}
                </span>
            </div>
        </div>
        <hr>
        <form id="statusUpdateForm">
            <input type="hidden" name="id" value="${inquiry.id}">
            <div class="mb-3">
                <label class="form-label"><strong>Update Status</strong></label>
                <select class="form-select" name="status" required>
                    <option value="pending" ${inquiry.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="contacted" ${inquiry.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="approved" ${inquiry.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="rejected" ${inquiry.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea class="form-control" name="notes" rows="3">${inquiry.notes || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Update Status</button>
        </form>
    `;
    
    document.getElementById('inquiryDetails').innerHTML = details;
    
    document.getElementById('statusUpdateForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        const result = await apiCall('partnership/update.php', 'PUT', data);
        
        if (result.success) {
            location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    });
    
    new bootstrap.Modal(document.getElementById('viewInquiryModal')).show();
}
</script>

<?php include '../includes/footer.php'; ?>

