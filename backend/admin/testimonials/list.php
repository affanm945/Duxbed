<?php
/**
 * Testimonials Management
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
    $query = "SELECT *, type_id FROM testimonials ORDER BY type_id ASC, display_order ASC, created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $testimonials = $stmt->fetchAll();
} catch (Exception $e) {
    $testimonials = [];
    error_log("Error fetching testimonials: " . $e->getMessage());
}

$page_title = "Testimonials Management";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Testimonials</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addTestimonialModal">
        <i class="bi bi-plus-circle"></i> Add Testimonial
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Client/Employee</th>
                        <th>Location</th>
                        <th>Rating</th>
                        <th>Published</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($testimonials as $testimonial): ?>
                        <tr>
                            <td><?php echo $testimonial['id']; ?></td>
                            <td>
                                <?php 
                                $typeId = $testimonial['type_id'] ?? 1;
                                $typeLabel = $typeId == 2 ? 'Employee' : 'Client';
                                $typeBadge = $typeId == 2 ? 'bg-success' : 'bg-primary';
                                ?>
                                <span class="badge <?php echo $typeBadge; ?>"><?php echo $typeLabel; ?></span>
                            </td>
                            <td>
                                <?php if ($testimonial['image_url']): ?>
                                    <img src="<?php echo htmlspecialchars($testimonial['image_url']); ?>" alt="" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" class="me-2">
                                <?php endif; ?>
                                <strong><?php echo htmlspecialchars($testimonial['client_name']); ?></strong>
                            </td>
                            <td><?php echo htmlspecialchars($testimonial['location'] ?? '-'); ?></td>
                            <td>
                                <?php for ($i = 0; $i < 5; $i++): ?>
                                    <i class="bi bi-star<?php echo $i < $testimonial['rating'] ? '-fill text-warning' : ''; ?>"></i>
                                <?php endfor; ?>
                            </td>
                            <td>
                                <span class="badge bg-<?php echo $testimonial['is_published'] ? 'success' : 'secondary'; ?>">
                                    <?php echo $testimonial['is_published'] ? 'Published' : 'Draft'; ?>
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-success" onclick="togglePublish(<?php echo $testimonial['id']; ?>, <?php echo $testimonial['is_published'] ? 0 : 1; ?>)">
                                    <i class="bi bi-<?php echo $testimonial['is_published'] ? 'eye-slash' : 'eye'; ?>"></i>
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="editTestimonial(<?php echo htmlspecialchars(json_encode($testimonial)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteTestimonial(<?php echo $testimonial['id']; ?>)">
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

<!-- Add/Edit Testimonial Modal -->
<div class="modal fade" id="addTestimonialModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Testimonial</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="testimonialForm">
                <div class="modal-body">
                    <input type="hidden" id="testimonial_id" name="id">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Testimonial Type *</label>
                            <select class="form-select" id="type_id" name="type_id" required>
                                <option value="1">Client Testimonials</option>
                                <option value="2">Employee Testimonials</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Client/Employee Name *</label>
                            <input type="text" class="form-control" id="client_name" name="client_name" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Location</label>
                            <input type="text" class="form-control" id="location" name="location">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Testimonial Text *</label>
                        <textarea class="form-control" id="testimonial_text" name="testimonial_text" rows="4" required></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Image</label>
                            <input type="file" class="form-control" id="image_file" name="image_file" accept="image/*">
                            <input type="hidden" id="image_url" name="image_url">
                            <div id="image_preview" class="mt-2" style="display: none;">
                                <img id="image_preview_img" src="" alt="Image preview" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 50%; padding: 5px; object-fit: cover;">
                            </div>
                            <div id="image_existing" class="mt-2" style="display: none;">
                                <p class="text-muted small">Current image:</p>
                                <img id="image_existing_img" src="" alt="Current image" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 50%; padding: 5px; object-fit: cover;">
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Rating</label>
                            <select class="form-select" id="rating" name="rating">
                                <option value="5" selected>5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Display Order</label>
                            <input type="number" class="form-control" id="display_order" name="display_order" value="0">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Publish Status</label>
                            <select class="form-select" id="is_published" name="is_published">
                                <option value="0">Draft</option>
                                <option value="1">Published</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Testimonial</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingTestimonialId = null;
let currentImageUrl = null;

// Image preview
document.getElementById('image_file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image_preview_img').src = e.target.result;
            document.getElementById('image_preview').style.display = 'block';
            document.getElementById('image_existing').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('testimonialForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
    
    try {
        let imageUrl = currentImageUrl;
        
        // Upload image if new file is selected
        const imageFile = document.getElementById('image_file').files[0];
        if (imageFile) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);
            imageFormData.append('type', 'testimonial');
            
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
        } else if (editingTestimonialId && currentImageUrl) {
            imageUrl = currentImageUrl;
        }
        
        const formData = {
            type_id: parseInt(document.getElementById('type_id').value),
            client_name: document.getElementById('client_name').value,
            location: document.getElementById('location').value,
            testimonial_text: document.getElementById('testimonial_text').value,
            image_url: imageUrl || null,
            video_url: null,
            rating: parseInt(document.getElementById('rating').value),
            display_order: parseInt(document.getElementById('display_order').value),
            is_published: document.getElementById('is_published').value === '1'
        };
        
        if (editingTestimonialId) {
            formData.id = editingTestimonialId;
            const result = await apiCall('testimonials/update.php', 'PUT', formData);
            if (result.success) {
                location.reload();
            } else {
                alert('Error: ' + result.message);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        } else {
            const result = await apiCall('testimonials/create.php', 'POST', formData);
            if (result.success) {
                location.reload();
            } else {
                alert('Error: ' + result.message);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }
    } catch (error) {
        console.error('Error saving testimonial:', error);
        alert('Error: Failed to save testimonial. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function editTestimonial(testimonial) {
    editingTestimonialId = testimonial.id;
    currentImageUrl = testimonial.image_url;
    
    document.getElementById('modalTitle').textContent = 'Edit Testimonial';
    document.getElementById('testimonial_id').value = testimonial.id;
    document.getElementById('type_id').value = testimonial.type_id || 1;
    document.getElementById('client_name').value = testimonial.client_name;
    document.getElementById('location').value = testimonial.location || '';
    document.getElementById('testimonial_text').value = testimonial.testimonial_text;
    document.getElementById('image_url').value = testimonial.image_url || '';
    document.getElementById('rating').value = testimonial.rating || 5;
    document.getElementById('display_order').value = testimonial.display_order || 0;
    document.getElementById('is_published').value = testimonial.is_published ? '1' : '0';
    
    // Reset file input
    document.getElementById('image_file').value = '';
    document.getElementById('image_preview').style.display = 'none';
    
    // Show existing image
    if (testimonial.image_url) {
        document.getElementById('image_existing_img').src = testimonial.image_url;
        document.getElementById('image_existing').style.display = 'block';
    } else {
        document.getElementById('image_existing').style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('addTestimonialModal')).show();
}

function togglePublish(id, publish) {
    // Ensure publish is a proper integer (0 or 1)
    const publishValue = publish === 1 || publish === true || publish === '1' ? 1 : 0;
    
    apiCall('testimonials/publish.php', 'PUT', {
        id: parseInt(id),
        is_published: publishValue
    }).then(result => {
        if (result.success) {
            location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    }).catch(error => {
        console.error('Error toggling publish status:', error);
        alert('Error: Failed to update testimonial status. Please try again.');
    });
}

function deleteTestimonial(id) {
    if (confirmDelete()) {
        apiCall('testimonials/delete.php?id=' + id, 'DELETE').then(result => {
            if (result.success) {
                location.reload();
            } else {
                alert('Error: ' + result.message);
            }
        });
    }
}

document.getElementById('addTestimonialModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('testimonialForm').reset();
    editingTestimonialId = null;
    currentImageUrl = null;
    document.getElementById('modalTitle').textContent = 'Add Testimonial';
    document.getElementById('image_preview').style.display = 'none';
    document.getElementById('image_existing').style.display = 'none';
});
</script>

<?php include '../includes/footer.php'; ?>

