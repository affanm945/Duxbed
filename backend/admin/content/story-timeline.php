<?php
/**
 * Our Story Timeline Management
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
    $query = "SELECT * FROM story_timeline ORDER BY year ASC, display_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $events = $stmt->fetchAll();
} catch (Exception $e) {
    $events = [];
    error_log("Error fetching timeline events: " . $e->getMessage());
}

$page_title = "Our Story Timeline";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Our Story Timeline</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addEventModal">
        <i class="bi bi-plus-circle"></i> Add Event
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Year</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($events as $event): ?>
                        <tr>
                            <td><?php echo $event['id']; ?></td>
                            <td><strong><?php echo $event['year']; ?></strong></td>
                            <td><?php echo htmlspecialchars($event['title']); ?></td>
                            <td><?php echo htmlspecialchars(substr($event['description'] ?? '', 0, 100)) . '...'; ?></td>
                            <td><?php echo $event['display_order']; ?></td>
                            <td>
                                <span class="badge bg-<?php echo $event['is_active'] ? 'success' : 'secondary'; ?>">
                                    <?php echo $event['is_active'] ? 'Active' : 'Inactive'; ?>
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editEvent(<?php echo htmlspecialchars(json_encode($event)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEvent(<?php echo $event['id']; ?>)">
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
<div class="modal fade" id="addEventModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Timeline Event</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="eventForm">
                <div class="modal-body">
                    <input type="hidden" id="event_id" name="id">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Year *</label>
                            <input type="number" class="form-control" id="event_year" name="year" required min="1900" max="2100">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Display Order</label>
                            <input type="number" class="form-control" id="display_order" name="display_order" value="0">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-control" id="event_title" name="title" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" id="event_description" name="description" rows="4"></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Image</label>
                            <input type="file" class="form-control" id="event_image_file" name="image_file" accept="image/*">
                            <input type="hidden" id="event_image" name="image_url">
                            <div id="event_image_preview" class="mt-2" style="display: none;">
                                <img id="event_image_preview_img" src="" alt="Image preview" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                            <div id="event_image_existing" class="mt-2" style="display: none;">
                                <p class="text-muted small">Current image:</p>
                                <img id="event_image_existing_img" src="" alt="Current image" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
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
                    <button type="submit" class="btn btn-primary">Save Event</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingEventId = null;
let currentImageUrl = null;

// Image preview
document.getElementById('event_image_file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('event_image_preview_img').src = e.target.result;
            document.getElementById('event_image_preview').style.display = 'block';
            document.getElementById('event_image_existing').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('eventForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
    
    try {
        let imageUrl = currentImageUrl;
        
        // Upload image if new file is selected
        const imageFile = document.getElementById('event_image_file').files[0];
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
        } else if (editingEventId && currentImageUrl) {
            imageUrl = currentImageUrl;
        }
        
        const formData = {
            year: parseInt(document.getElementById('event_year').value),
            title: document.getElementById('event_title').value,
            description: document.getElementById('event_description').value,
            image_url: imageUrl || null,
            display_order: parseInt(document.getElementById('display_order').value),
            is_active: document.getElementById('is_active').value === '1'
        };
        
        if (editingEventId) {
            formData.id = editingEventId;
            const result = await apiCall('content/story-timeline.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        } else {
            const result = await apiCall('content/story-timeline.php', 'POST', formData);
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
        console.error('Error saving event:', error);
        alert('Error: Failed to save event. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function editEvent(event) {
    console.log(event,"event");
    console.log(currentImageUrl,"currentImageUrl");
    editingEventId = event.id;
    currentImageUrl = event.image_url;
    
    document.getElementById('modalTitle').textContent = 'Edit Timeline Event';
    document.getElementById('event_id').value = event.id;
    document.getElementById('event_year').value = event.year;
    document.getElementById('event_title').value = event.title;
    document.getElementById('event_description').value = event.description || '';
    document.getElementById('event_image').value = event.image_url || '';
    document.getElementById('display_order').value = event.display_order;
    document.getElementById('is_active').value = event.is_active ? '1' : '0';
    console.log(event,"event");
    console.log(currentImageUrl,"currentImageUrl");
    // Reset file input
    document.getElementById('event_image_file').value = '';
    document.getElementById('event_image_preview').style.display = 'none';
    
    // Show existing image - ensure absolute URL (fix malformed URLs with (http://...) prefix)
    if (event.image_url) {
        let imgUrl = event.image_url;
        if (/^\(https?:\/\/[^)]+\)/.test(imgUrl)) {
            imgUrl = imgUrl.replace(/^\(https?:\/\/[^)]+\)/, '');
        }
        if (!/^https?:\/\//.test(imgUrl)) {
            imgUrl = (window.location.origin + '/').replace(/\/+$/, '/') + imgUrl.replace(/^\//, '');
        }
        document.getElementById('event_image_existing_img').src = imgUrl;
        document.getElementById('event_image_existing').style.display = 'block';
    } else {
        document.getElementById('event_image_existing').style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('addEventModal')).show();
}

function deleteEvent(id) {
    if (confirmDelete()) {
        apiCall('content/story-timeline.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting event:', error);
            alert('Error: Failed to delete event. Please try again.');
        });
    }
}

document.getElementById('addEventModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('eventForm').reset();
    editingEventId = null;
    currentImageUrl = null;
    document.getElementById('modalTitle').textContent = 'Add Timeline Event';
    document.getElementById('event_image_preview').style.display = 'none';
    document.getElementById('event_image_existing').style.display = 'none';
});
</script>

<?php include '../includes/footer.php'; ?>

