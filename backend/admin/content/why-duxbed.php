<?php
/**
 * Why Duxbed USPs Management
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

try {
    $query = "SELECT * FROM why_duxbed_usps ORDER BY display_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $usps = $stmt->fetchAll();
} catch (Exception $e) {
    $usps = [];
    error_log("Error fetching USPs: " . $e->getMessage());
}

$page_title = "Why Duxbed USPs";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Why Duxbed</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUspModal">
        <i class="bi bi-plus-circle"></i> Add USP
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Icon</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($usps as $usp): ?>
                        <tr>
                            <td><?php echo $usp['id']; ?></td>
                            <td><i class="bi <?php echo htmlspecialchars($usp['icon']); ?>" style="font-size: 24px;"></i></td>
                            <td><strong><?php echo htmlspecialchars($usp['title']); ?></strong></td>
                            <td><?php echo htmlspecialchars(substr($usp['description'] ?? '', 0, 100)) . '...'; ?></td>
                            <td><?php echo $usp['display_order']; ?></td>
                            <td>
                                <span class="badge bg-<?php echo $usp['is_active'] ? 'success' : 'secondary'; ?>">
                                    <?php echo $usp['is_active'] ? 'Active' : 'Inactive'; ?>
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editUsp(<?php echo htmlspecialchars(json_encode($usp)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteUsp(<?php echo $usp['id']; ?>)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Add/Edit Modal -->
<div class="modal fade" id="addUspModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add USP</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="uspForm">
                <div class="modal-body">
                    <input type="hidden" id="usp_id" name="id">
                    <div class="mb-3">
                        <label class="form-label">Icon Class <small class="text-muted">(e.g., bi-tools, bi-lightbulb)</small></label>
                        <input type="text" class="form-control" id="usp_icon" name="icon" placeholder="bi-tools">
                        <small class="form-text text-muted">Bootstrap Icons class name (without "bi" prefix)</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-control" id="usp_title" name="title" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" id="usp_description" name="description" rows="3"></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Display Order</label>
                            <input type="number" class="form-control" id="display_order" name="display_order" value="0">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Status</label>
                            <select class="form-select" id="is_active" name="is_active">
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save USP</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingUspId = null;

document.getElementById('uspForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = {
        icon: document.getElementById('usp_icon').value || null,
        title: document.getElementById('usp_title').value,
        description: document.getElementById('usp_description').value,
        display_order: parseInt(document.getElementById('display_order').value),
        is_active: document.getElementById('is_active').value === '1'
    };
    
    try {
        if (editingUspId) {
            formData.id = editingUspId;
            const result = await apiCall('content/why-duxbed.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        } else {
            const result = await apiCall('content/why-duxbed.php', 'POST', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }
    } catch (error) {
        console.error('Error saving USP:', error);
        alert('Error: Failed to save USP. Please check your connection and try again.');
    }
});

function editUsp(usp) {
    editingUspId = usp.id;
    document.getElementById('modalTitle').textContent = 'Edit USP';
    document.getElementById('usp_id').value = usp.id;
    document.getElementById('usp_icon').value = usp.icon || '';
    document.getElementById('usp_title').value = usp.title;
    document.getElementById('usp_description').value = usp.description || '';
    document.getElementById('display_order').value = usp.display_order;
    document.getElementById('is_active').value = usp.is_active ? '1' : '0';
    new bootstrap.Modal(document.getElementById('addUspModal')).show();
}

function deleteUsp(id) {
    if (confirmDelete()) {
        apiCall('content/why-duxbed.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting USP:', error);
            alert('Error: Failed to delete USP. Please try again.');
        });
    }
}

document.getElementById('addUspModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('uspForm').reset();
    editingUspId = null;
    document.getElementById('modalTitle').textContent = 'Add USP';
});
</script>

<?php include '../includes/footer.php'; ?>

