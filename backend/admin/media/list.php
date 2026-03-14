<?php
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

$type_filter = $_GET['type'] ?? '';

try {
    $query = "SELECT * FROM media_items WHERE 1=1";
    if ($type_filter) {
        $query .= " AND type = :type";
    }
    $query .= " ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    if ($type_filter) {
        $stmt->bindParam(':type', $type_filter);
    }
    $stmt->execute();
    $items = $stmt->fetchAll();
} catch (Exception $e) {
    $items = [];
}

$page_title = "Media Management";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Media & News</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addMediaModal">
        <i class="bi bi-plus-circle"></i> Add Media Item
    </button>
</div>

<div class="card mb-4">
    <div class="card-body">
        <form method="GET" class="row g-3">
            <div class="col-md-4">
                <select class="form-select" name="type">
                    <option value="">All Types</option>
                    <option value="news" <?php echo $type_filter === 'news' ? 'selected' : ''; ?>>News</option>
                    <option value="event" <?php echo $type_filter === 'event' ? 'selected' : ''; ?>>Events</option>
                    <option value="award" <?php echo $type_filter === 'award' ? 'selected' : ''; ?>>Awards</option>
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
                        <th>Type</th>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Published</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($items as $item): ?>
                        <tr>
                            <td><?php echo $item['id']; ?></td>
                            <td><span class="badge bg-info"><?php echo ucfirst($item['type']); ?></span></td>
                            <td><?php echo htmlspecialchars($item['title']); ?></td>
                            <td><?php echo date('d M Y', strtotime($item['event_date'] ?? $item['created_at'])); ?></td>
                            <td><span class="badge bg-<?php echo $item['is_published'] ? 'success' : 'secondary'; ?>"><?php echo $item['is_published'] ? 'Yes' : 'No'; ?></span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editMedia(<?php echo htmlspecialchars(json_encode($item)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteMedia(<?php echo $item['id']; ?>)">
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
<div class="modal fade" id="addMediaModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Media Item</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="mediaForm">
                <div class="modal-body">
                    <input type="hidden" id="media_id" name="id">
                    <div class="mb-3">
                        <label class="form-label">Type *</label>
                        <select class="form-select" id="media_type" name="type" required>
                            <option value="news">News</option>
                            <option value="event">Event</option>
                            <option value="award">Award</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-control" id="media_title" name="title" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Content</label>
                        <textarea class="form-control" id="content" name="content" rows="5"></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Image</label>
                            <input type="file" class="form-control" id="image_file" name="image_file" accept="image/*">
                            <input type="hidden" id="image_url" name="image_url">
                            <div id="image_preview" class="mt-2" style="display: none;">
                                <img id="image_preview_img" src="" alt="Image preview" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                            <div id="image_existing" class="mt-2" style="display: none;">
                                <p class="text-muted small">Current image:</p>
                                <img id="image_existing_img" src="" alt="Current image" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Video URL</label>
                            <input type="url" class="form-control" id="video_url" name="video_url">
                            <small class="text-muted">Enter video URL (YouTube, Vimeo, etc.)</small>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Event Date</label>
                            <input type="date" class="form-control" id="event_date" name="event_date">
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
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingMediaId = null;
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

document.getElementById('mediaForm').addEventListener('submit', async function(e) {
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
        } else if (editingMediaId && currentImageUrl) {
            imageUrl = currentImageUrl;
        }
        
        const formData = {
            type: document.getElementById('media_type').value,
            title: document.getElementById('media_title').value,
            description: document.getElementById('description').value,
            content: document.getElementById('content').value,
            image_url: imageUrl || null,
            video_url: document.getElementById('video_url').value || null,
            event_date: document.getElementById('event_date').value || null,
            is_published: document.getElementById('is_published').value === '1'
        };
        
        if (editingMediaId) {
            formData.id = editingMediaId;
            const result = await apiCall('media/update.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        } else {
            const result = await apiCall('media/create.php', 'POST', formData);
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
        console.error('Error saving media item:', error);
        alert('Error: Failed to save media item. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function editMedia(item) {
    editingMediaId = item.id;
    currentImageUrl = item.image_url;
    
    document.getElementById('modalTitle').textContent = 'Edit Media Item';
    document.getElementById('media_id').value = item.id;
    document.getElementById('media_type').value = item.type;
    document.getElementById('media_title').value = item.title;
    document.getElementById('description').value = item.description || '';
    document.getElementById('content').value = item.content || '';
    document.getElementById('image_url').value = item.image_url || '';
    document.getElementById('video_url').value = item.video_url || '';
    document.getElementById('event_date').value = item.event_date ? item.event_date.split(' ')[0] : '';
    document.getElementById('is_published').value = item.is_published ? '1' : '0';
    
    // Reset file input
    document.getElementById('image_file').value = '';
    document.getElementById('image_preview').style.display = 'none';
    
    // Show existing image
    if (item.image_url) {
        document.getElementById('image_existing_img').src = item.image_url;
        document.getElementById('image_existing').style.display = 'block';
    } else {
        document.getElementById('image_existing').style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('addMediaModal')).show();
}

function deleteMedia(id) {
    if (confirmDelete()) {
        apiCall('media/delete.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting media item:', error);
            alert('Error: Failed to delete media item. Please try again.');
        });
    }
}

document.getElementById('addMediaModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('mediaForm').reset();
    editingMediaId = null;
    currentImageUrl = null;
    document.getElementById('modalTitle').textContent = 'Add Media Item';
    document.getElementById('image_preview').style.display = 'none';
    document.getElementById('image_existing').style.display = 'none';
});
</script>

<?php include '../includes/footer.php'; ?>

