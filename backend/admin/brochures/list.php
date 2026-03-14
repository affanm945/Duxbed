<?php
/**
 * Brochures Management
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
    $query = "SELECT * FROM brochures ORDER BY display_order ASC, created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $brochures = $stmt->fetchAll();
} catch (Exception $e) {
    $brochures = [];
    error_log("Error fetching brochures: " . $e->getMessage());
}

$page_title = "Brochures Management";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Brochures Management</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBrochureModal">
        <i class="bi bi-plus-circle"></i> Add Brochure
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Sector</th>
                        <th>File Name</th>
                        <th>Size</th>
                        <th>Downloads</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($brochures as $brochure): ?>
                        <tr>
                            <td><?php echo $brochure['id']; ?></td>
                            <td><?php echo htmlspecialchars($brochure['title']); ?></td>
                            <td>
                                <?php if ($brochure['sector']): ?>
                                    <span class="badge bg-info"><?php echo htmlspecialchars($brochure['sector']); ?></span>
                                <?php else: ?>
                                    <span class="text-muted">-</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <small><?php echo htmlspecialchars($brochure['file_name']); ?></small>
                            </td>
                            <td>
                                <?php 
                                if ($brochure['file_size']) {
                                    $size = $brochure['file_size'];
                                    $units = ['B', 'KB', 'MB', 'GB'];
                                    $unit = floor(log($size, 1024));
                                    echo number_format($size / pow(1024, $unit), 2) . ' ' . $units[$unit];
                                } else {
                                    echo '-';
                                }
                                ?>
                            </td>
                            <td>
                                <span class="badge bg-secondary"><?php echo $brochure['download_count']; ?></span>
                            </td>
                            <td>
                                <span class="badge bg-<?php echo $brochure['is_active'] ? 'success' : 'secondary'; ?>">
                                    <?php echo $brochure['is_active'] ? 'Active' : 'Inactive'; ?>
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editBrochure(<?php echo htmlspecialchars(json_encode($brochure)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteBrochure(<?php echo $brochure['id']; ?>)">
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
<div class="modal fade" id="addBrochureModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Brochure</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="brochureForm">
                <div class="modal-body">
                    <input type="hidden" id="brochure_id" name="id">
                    
                    <div class="mb-3">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-control" id="brochure_title" name="title" required>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" id="brochure_description" name="description" rows="3"></textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">PDF File *</label>
                        <input type="file" class="form-control" id="brochure_file" name="file" accept=".pdf" <?php echo !isset($_GET['edit']) ? 'required' : ''; ?>>
                        <small class="form-text text-muted">Upload a PDF file (Max 100MB)</small>
                        <div id="fileInfo" class="mt-2" style="display: none;">
                            <small class="text-muted">Current file: <span id="currentFileName"></span></small>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Sector (Optional)</label>
                            <select class="form-select" id="brochure_sector" name="sector">
                                <option value="">All Sectors</option>
                                <option value="Space saving furniture">Space saving furniture</option>
                                <option value="Duxpod">Duxpod</option>
                                <option value="Interior designing">Interior designing</option>
                                <option value="Modular kitchen">Modular kitchen</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Display Order</label>
                            <input type="number" class="form-control" id="display_order" name="display_order" value="0">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="is_active" name="is_active">
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="saveBrochureBtn">Save Brochure</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingBrochureId = null;
let currentFilePath = null;
let currentFileName = null;

document.getElementById('brochureForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveBrochureBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Saving...';
    
    try {
        const title = document.getElementById('brochure_title').value;
        const description = document.getElementById('brochure_description').value;
        const sector = document.getElementById('brochure_sector').value || null;
        const displayOrder = parseInt(document.getElementById('display_order').value) || 0;
        const isActive = document.getElementById('is_active').value === '1';
        const fileInput = document.getElementById('brochure_file');
        const file = fileInput.files[0];
        
        let filePath = currentFilePath;
        let fileName = currentFileName;
        let fileSize = null;
        let fileType = 'application/pdf';
        
        // If new file is uploaded, upload it first
        if (file) {
            const formData = new FormData();
            formData.append('document', file);
            
            const uploadResponse = await fetch(API_BASE + 'upload/document.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            const uploadResult = await uploadResponse.json();
            
            if (!uploadResult.success) {
                alert('Error uploading file: ' + uploadResult.message);
                return;
            }
            
            filePath = uploadResult.path || uploadResult.filename;
            fileName = file.name;
            fileSize = file.size;
            fileType = file.type;
        }
        
        // If editing and no new file, keep existing file info
        if (editingBrochureId && !file) {
            // Get existing file info from the brochure data
            // This should be set when editing
        }
        
        const formData = {
            title: title,
            description: description || null,
            file_path: filePath,
            file_name: fileName,
            file_size: fileSize,
            file_type: fileType,
            sector: sector,
            display_order: displayOrder,
            is_active: isActive
        };
        
        if (editingBrochureId) {
            formData.id = editingBrochureId;
            // If no new file, don't update file fields
            if (!file) {
                delete formData.file_path;
                delete formData.file_name;
                delete formData.file_size;
                delete formData.file_type;
            }
            const result = await apiCall('brochures/update.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        } else {
            if (!filePath) {
                alert('Please upload a PDF file');
                return;
            }
            const result = await apiCall('brochures/create.php', 'POST', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }
    } catch (error) {
        console.error('Error saving brochure:', error);
        alert('Error: Failed to save brochure. Please check your connection and try again.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
});

function editBrochure(brochure) {
    editingBrochureId = brochure.id;
    currentFilePath = brochure.file_path;
    currentFileName = brochure.file_name;
    
    document.getElementById('modalTitle').textContent = 'Edit Brochure';
    document.getElementById('brochure_id').value = brochure.id;
    document.getElementById('brochure_title').value = brochure.title;
    document.getElementById('brochure_description').value = brochure.description || '';
    document.getElementById('brochure_sector').value = brochure.sector || '';
    document.getElementById('display_order').value = brochure.display_order || 0;
    document.getElementById('is_active').value = brochure.is_active ? '1' : '0';
    
    // Show current file info
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('currentFileName').textContent = brochure.file_name;
    document.getElementById('brochure_file').removeAttribute('required');
    
    new bootstrap.Modal(document.getElementById('addBrochureModal')).show();
}

function deleteBrochure(id) {
    if (confirm('Are you sure you want to delete this brochure? This action cannot be undone.')) {
        apiCall('brochures/delete.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting brochure:', error);
            alert('Error: Failed to delete brochure. Please try again.');
        });
    }
}

document.getElementById('addBrochureModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('brochureForm').reset();
    editingBrochureId = null;
    currentFilePath = null;
    currentFileName = null;
    document.getElementById('modalTitle').textContent = 'Add Brochure';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('brochure_file').setAttribute('required', 'required');
});
</script>

<?php include '../includes/footer.php'; ?>

