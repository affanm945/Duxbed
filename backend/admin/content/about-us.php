<?php
/**
 * About Us Content Management
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
    $query = "SELECT * FROM about_us_content ORDER BY display_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $sections = $stmt->fetchAll();
} catch (Exception $e) {
    $sections = [];
    error_log("Error fetching about us content: " . $e->getMessage());
}

$page_title = "About Us Content";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>About Us Content</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSectionModal">
        <i class="bi bi-plus-circle"></i> Add Section
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Section Key</th>
                        <th>Title</th>
                        <th>Content Preview</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($sections as $section): ?>
                        <tr>
                            <td><?php echo $section['id']; ?></td>
                            <td><code><?php echo htmlspecialchars($section['section_key']); ?></code></td>
                            <td><?php echo htmlspecialchars($section['title'] ?? 'Untitled'); ?></td>
                            <td><?php echo htmlspecialchars(substr($section['content'] ?? '', 0, 100)) . '...'; ?></td>
                            <td><?php echo $section['display_order']; ?></td>
                            <td>
                                <span class="badge bg-<?php echo $section['is_active'] ? 'success' : 'secondary'; ?>">
                                    <?php echo $section['is_active'] ? 'Active' : 'Inactive'; ?>
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editSection(<?php echo htmlspecialchars(json_encode($section)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteSection(<?php echo $section['id']; ?>)">
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
<div class="modal fade" id="addSectionModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Section</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="sectionForm">
                <div class="modal-body">
                    <input type="hidden" id="section_id" name="id">
                    <div class="mb-3">
                        <label class="form-label">Section Key * <small class="text-muted">(e.g., welcome, mission, vision)</small></label>
                        <input type="text" class="form-control" id="section_key" name="section_key" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-control" id="section_title" name="title">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Content</label>
                        <textarea class="form-control" id="section_content" name="content" rows="5"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Image</label>
                        <input type="file" class="form-control" id="section_image_file" name="image_file" accept="image/*">
                        <input type="hidden" id="section_image" name="image_url">
                        <div id="section_image_preview" class="mt-2" style="display: none;">
                            <img id="section_image_preview_img" src="" alt="Image preview" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                        </div>
                        <div id="section_image_existing" class="mt-2" style="display: none;">
                            <p class="text-muted small">Current image:</p>
                            <img id="section_image_existing_img" src="" alt="Current image" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                        </div>
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
                    <button type="submit" class="btn btn-primary">Save Section</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingSectionId = null;
let currentImageUrl = null;

// Image preview
document.getElementById('section_image_file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('section_image_preview_img').src = e.target.result;
            document.getElementById('section_image_preview').style.display = 'block';
            document.getElementById('section_image_existing').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('sectionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
    
    try {
        let imageUrl = currentImageUrl;
        
        // Upload image if new file is selected
        const imageFile = document.getElementById('section_image_file').files[0];
        if (imageFile) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);
            imageFormData.append('type', 'general');
            
            const imageUploadResponse = await fetch(API_BASE + 'upload/image.php', {
                method: 'POST',
                body: imageFormData,
                credentials: 'include'
            });
            
            const imageUploadResult = await imageUploadResponse.json();
            
            if (!imageUploadResult.success) {
                alert('Error uploading image: ' + imageUploadResult.message);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            imageUrl = imageUploadResult.url;
        } else if (editingSectionId && currentImageUrl) {
            imageUrl = currentImageUrl;
        }
        
        const formData = {
            section_key: document.getElementById('section_key').value,
            title: document.getElementById('section_title').value,
            content: document.getElementById('section_content').value,
            image_url: imageUrl || null,
            display_order: parseInt(document.getElementById('display_order').value),
            is_active: document.getElementById('is_active').value === '1'
        };
        
        if (editingSectionId) {
            formData.id = editingSectionId;
            const result = await apiCall('content/about-us.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        } else {
            const result = await apiCall('content/about-us.php', 'POST', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }
    } catch (error) {
        console.error('Error saving section:', error);
        alert('Error: Failed to save section. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function editSection(section) {
    editingSectionId = section.id;
    currentImageUrl = section.image_url;
    
    document.getElementById('modalTitle').textContent = 'Edit Section';
    document.getElementById('section_id').value = section.id;
    document.getElementById('section_key').value = section.section_key;
    document.getElementById('section_key').readOnly = true;
    document.getElementById('section_title').value = section.title || '';
    document.getElementById('section_content').value = section.content || '';
    document.getElementById('section_image').value = section.image_url || '';
    document.getElementById('display_order').value = section.display_order;
    document.getElementById('is_active').value = section.is_active ? '1' : '0';
    
    // Reset file input
    document.getElementById('section_image_file').value = '';
    document.getElementById('section_image_preview').style.display = 'none';
    
    // Show existing image
    if (section.image_url) {
        document.getElementById('section_image_existing_img').src = section.image_url;
        document.getElementById('section_image_existing').style.display = 'block';
    } else {
        document.getElementById('section_image_existing').style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('addSectionModal')).show();
}

function deleteSection(id) {
    if (confirmDelete()) {
        apiCall('content/about-us.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting section:', error);
            alert('Error: Failed to delete section. Please try again.');
        });
    }
}

document.getElementById('addSectionModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('sectionForm').reset();
    editingSectionId = null;
    currentImageUrl = null;
    document.getElementById('section_key').readOnly = false;
    document.getElementById('modalTitle').textContent = 'Add Section';
    document.getElementById('section_image_preview').style.display = 'none';
    document.getElementById('section_image_existing').style.display = 'none';
});
</script>

<?php include '../includes/footer.php'; ?>

