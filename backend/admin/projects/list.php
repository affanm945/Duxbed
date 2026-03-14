<?php
/**
 * Premium Projects Management
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
    $query = "SELECT * FROM premium_projects ORDER BY display_order ASC, created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get images for each project
    foreach ($projects as &$project) {
        $images_query = "SELECT * FROM project_images WHERE project_id = :project_id ORDER BY display_order ASC";
        $images_stmt = $db->prepare($images_query);
        $project_id = $project['id'];
        $images_stmt->bindParam(':project_id', $project_id, PDO::PARAM_INT);
        $images_stmt->execute();
        $project['images'] = $images_stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    // Unset reference to avoid issues
    unset($project);
} catch (PDOException $e) {
    $projects = [];
    error_log("Error fetching projects (PDO): " . $e->getMessage());
} catch (Exception $e) {
    $projects = [];
    error_log("Error fetching projects: " . $e->getMessage());
}

$page_title = "Premium Projects";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Premium Projects</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProjectModal">
        <i class="bi bi-plus-circle"></i> Add Project
    </button>
</div>

<div class="row">
    <?php foreach ($projects as $project): ?>
        <div class="col-md-4 mb-4">
            <div class="card">
                <img src="<?php echo htmlspecialchars($project['thumbnail_url']); ?>" class="card-img-top" alt="<?php echo htmlspecialchars($project['title']); ?>" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title"><?php echo htmlspecialchars($project['title']); ?></h5>
                    <p class="card-text">
                        <span class="badge bg-secondary"><?php echo htmlspecialchars($project['category']); ?></span>
                        <span class="badge bg-info"><?php echo ucfirst($project['type']); ?></span>
                    </p>
                    <p class="text-muted small mb-2">
                        <?php echo count($project['images']); ?> image(s)
                    </p>
                    <div class="btn-group w-100">
                        <button class="btn btn-sm btn-primary" onclick="editProject(<?php echo htmlspecialchars(json_encode($project)); ?>)">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProject(<?php echo $project['id']; ?>)">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<!-- Add/Edit Project Modal -->
<div class="modal fade" id="addProjectModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Premium Project</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="projectForm">
                <div class="modal-body">
                    <input type="hidden" id="project_id" name="id">
                    <div class="row">
                        <div class="col-md-8 mb-3">
                            <label class="form-label">Project Title *</label>
                            <input type="text" class="form-control" id="project_title" name="title" required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Category</label>
                            <select class="form-select" id="category" name="category">
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Thumbnail Image <span id="thumbnail_required" class="text-danger">*</span></label>
                            <input type="file" class="form-control" id="thumbnail_file" name="thumbnail_file" accept="image/*">
                            <input type="hidden" id="thumbnail_url" name="thumbnail_url">
                            <small class="text-muted">Upload a thumbnail image for the project (required for new projects)</small>
                            <div id="thumbnail_preview" class="mt-2" style="display: none;">
                                <img id="thumbnail_preview_img" src="" alt="Thumbnail preview" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                            <div id="thumbnail_existing" class="mt-2" style="display: none;">
                                <p class="text-muted small">Current thumbnail:</p>
                                <img id="thumbnail_existing_img" src="" alt="Current thumbnail" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Project Type</label>
                            <select class="form-select" id="project_type" name="type" onchange="toggleVideoField()">
                                <option value="gallery">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3" id="video_url_field" style="display: none;">
                        <label class="form-label">Video URL</label>
                        <input type="url" class="form-control" id="video_url" name="video_url">
                        <small class="text-muted">Enter the video URL (YouTube, Vimeo, etc.)</small>
                    </div>
                    <div class="mb-3" id="gallery_images_field">
                        <label class="form-label">Gallery Images *</label>
                        <input type="file" class="form-control" id="gallery_images" name="gallery_images[]" accept="image/*" multiple>
                        <small class="text-muted">Select multiple images for the gallery (hold Ctrl/Cmd to select multiple)</small>
                        <div id="gallery_preview" class="mt-3 row"></div>
                        <div id="gallery_existing" class="mt-3" style="display: none;">
                            <p class="text-muted small mb-2">Current gallery images:</p>
                            <div id="gallery_existing_images" class="row"></div>
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
                    <button type="submit" class="btn btn-primary">Save Project</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingProjectId = null;
let currentThumbnailUrl = null;
let currentGalleryImages = [];

// Thumbnail preview
document.getElementById('thumbnail_file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('thumbnail_preview_img').src = e.target.result;
            document.getElementById('thumbnail_preview').style.display = 'block';
            document.getElementById('thumbnail_existing').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// Gallery images preview
document.getElementById('gallery_images').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    const previewDiv = document.getElementById('gallery_preview');
    previewDiv.innerHTML = '';
    
    if (files.length > 0) {
        document.getElementById('gallery_existing').style.display = 'none';
    }
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-2';
            col.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}" 
                     style="width: 100%; height: 150px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
            `;
            previewDiv.appendChild(col);
        };
        reader.readAsDataURL(file);
    });
});

function toggleVideoField() {
    const type = document.getElementById('project_type').value;
    const videoField = document.getElementById('video_url_field');
    const galleryField = document.getElementById('gallery_images_field');
    
    if (type === 'video') {
        videoField.style.display = 'block';
        galleryField.style.display = 'none';
        document.getElementById('video_url').required = true;
        document.getElementById('gallery_images').required = false;
    } else {
        videoField.style.display = 'none';
        galleryField.style.display = 'block';
        document.getElementById('video_url').required = false;
        document.getElementById('gallery_images').required = true;
    }
}

document.getElementById('projectForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
    
    try {
        let thumbnailUrl = currentThumbnailUrl;
        let galleryImageUrls = currentGalleryImages;
        
        // Upload thumbnail if new file is selected
        const thumbnailFile = document.getElementById('thumbnail_file').files[0];
        if (thumbnailFile) {
            const thumbnailFormData = new FormData();
            thumbnailFormData.append('image', thumbnailFile);
            thumbnailFormData.append('type', 'project');
            
            const thumbnailUploadResponse = await fetch(API_BASE + 'upload/image.php', {
                method: 'POST',
                body: thumbnailFormData,
                credentials: 'include'
            });
            
            const thumbnailUploadResult = await thumbnailUploadResponse.json();
            
            if (!thumbnailUploadResult.success) {
                alert('Error uploading thumbnail: ' + thumbnailUploadResult.message);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            thumbnailUrl = thumbnailUploadResult.url;
        } else if (editingProjectId && currentThumbnailUrl) {
            // Keep existing thumbnail if editing and no new file uploaded
            thumbnailUrl = currentThumbnailUrl;
        }
        
        // Upload gallery images if new files are selected
        const galleryFiles = Array.from(document.getElementById('gallery_images').files);
        if (galleryFiles.length > 0) {
            galleryImageUrls = [];
            for (const file of galleryFiles) {
                const imageFormData = new FormData();
                imageFormData.append('image', file);
                imageFormData.append('type', 'project');
                
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
                
                galleryImageUrls.push({
                    url: imageUploadResult.url,
                    alt: document.getElementById('project_title').value
                });
            }
        }
        
        // Validate required fields
        if (!thumbnailUrl) {
            if (editingProjectId && !currentThumbnailUrl) {
                alert('Please upload a thumbnail image or keep the existing one');
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            } else if (!editingProjectId) {
                alert('Please upload a thumbnail image');
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
        }
        
        const type = document.getElementById('project_type').value;
        if (type === 'gallery') {
            if (galleryImageUrls.length === 0 && currentGalleryImages.length === 0 && !editingProjectId) {
                alert('Please upload at least one gallery image');
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            // If editing and no new images uploaded, keep existing images
            if (galleryImageUrls.length === 0 && currentGalleryImages.length > 0) {
                galleryImageUrls = currentGalleryImages;
            }
        }
        
        const formData = {
            title: document.getElementById('project_title').value,
            category: document.getElementById('category').value,
            thumbnail_url: thumbnailUrl,
            type: type,
            video_url: type === 'video' ? document.getElementById('video_url').value : null,
            images: type === 'gallery' ? galleryImageUrls : [],
            display_order: parseInt(document.getElementById('display_order').value),
            is_active: document.getElementById('is_active').value === '1'
        };
        
        if (editingProjectId) {
            formData.id = editingProjectId;
            const result = await apiCall('projects/update.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        } else {
            const result = await apiCall('projects/create.php', 'POST', formData);
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
        console.error('Error saving project:', error);
        alert('Error: Failed to save project. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function editProject(project) {
    editingProjectId = project.id;
    currentThumbnailUrl = project.thumbnail_url;
    currentGalleryImages = project.images ? project.images.map(img => ({
        url: img.image_url,
        alt: project.title
    })) : [];
    
    document.getElementById('modalTitle').textContent = 'Edit Premium Project';
    document.getElementById('project_id').value = project.id;
    document.getElementById('project_title').value = project.title;
    document.getElementById('category').value = project.category;
    document.getElementById('thumbnail_url').value = project.thumbnail_url;
    document.getElementById('project_type').value = project.type;
    document.getElementById('video_url').value = project.video_url || '';
    document.getElementById('display_order').value = project.display_order;
    document.getElementById('is_active').value = project.is_active ? '1' : '0';
    
    // Hide required indicator when editing
    document.getElementById('thumbnail_required').style.display = 'none';
    
    // Reset file inputs
    document.getElementById('thumbnail_file').value = '';
    document.getElementById('gallery_images').value = '';
    document.getElementById('thumbnail_preview').style.display = 'none';
    document.getElementById('gallery_preview').innerHTML = '';
    
    // Show existing thumbnail
    if (project.thumbnail_url) {
        document.getElementById('thumbnail_existing_img').src = project.thumbnail_url;
        document.getElementById('thumbnail_existing').style.display = 'block';
    } else {
        document.getElementById('thumbnail_existing').style.display = 'none';
    }
    
    // Show existing gallery images
    if (project.images && project.images.length > 0) {
        const existingDiv = document.getElementById('gallery_existing_images');
        existingDiv.innerHTML = '';
        project.images.forEach((img, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-2';
            col.innerHTML = `
                <img src="${img.image_url}" alt="Image ${index + 1}" 
                     style="width: 100%; height: 150px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
            `;
            existingDiv.appendChild(col);
        });
        document.getElementById('gallery_existing').style.display = 'block';
    } else {
        document.getElementById('gallery_existing').style.display = 'none';
    }
    
    toggleVideoField();
    new bootstrap.Modal(document.getElementById('addProjectModal')).show();
}

function deleteProject(id) {
    if (confirmDelete()) {
        apiCall('projects/delete.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting project:', error);
            alert('Error: Failed to delete project. Please try again.');
        });
    }
}

document.getElementById('addProjectModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('projectForm').reset();
    editingProjectId = null;
    currentThumbnailUrl = null;
    currentGalleryImages = [];
    document.getElementById('modalTitle').textContent = 'Add Premium Project';
    document.getElementById('thumbnail_required').style.display = 'inline';
    document.getElementById('thumbnail_preview').style.display = 'none';
    document.getElementById('thumbnail_existing').style.display = 'none';
    document.getElementById('gallery_preview').innerHTML = '';
    document.getElementById('gallery_existing').style.display = 'none';
    toggleVideoField();
});
</script>

<?php include '../includes/footer.php'; ?>