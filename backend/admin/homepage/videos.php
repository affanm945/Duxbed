<?php
/**
 * Homepage Videos Management
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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

// Fetch videos
try {
    $query = "SELECT * FROM homepage_videos ORDER BY display_order ASC, created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $videos = $stmt->fetchAll();
} catch (Exception $e) {
    $videos = [];
    error_log("Error fetching videos: " . $e->getMessage());
}

$page_title = "Homepage Videos";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Homepage Videos</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addVideoModal">
        <i class="bi bi-plus-circle"></i> Add Video
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
                        <th>URL</th>
                        <th>Active</th>
                        <th>Order</th>
                        <th>Section</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($videos as $video): ?>
                        <tr>
                            <td><?php echo $video['id']; ?></td>
                            <td><?php echo htmlspecialchars($video['title'] ?? 'Untitled'); ?></td>
                            <td><a href="<?php echo htmlspecialchars($video['video_url']); ?>" target="_blank">View</a></td>
                            <td>
                                <span class="badge bg-<?php echo $video['is_active'] ? 'success' : 'secondary'; ?>">
                                    <?php echo $video['is_active'] ? 'Active' : 'Inactive'; ?>
                                </span>
                            </td>
                            <td><?php echo $video['display_order']; ?></td>
                            <td>
                                <?php
                                $section = '';
                                $badgeClass = 'secondary';
                                switch((int)$video['display_order']) {
                                    case 1:
                                        $section = 'Hero Slider';
                                        $badgeClass = 'primary';
                                        break;
                                    case 2:
                                        $section = 'Watch Video';
                                        $badgeClass = 'info';
                                        break;
                                    case 3:
                                        $section = 'Background';
                                        $badgeClass = 'success';
                                        break;
                                    default:
                                        $section = 'Not Used';
                                        $badgeClass = 'secondary';
                                }
                                ?>
                                <span class="badge bg-<?php echo $badgeClass; ?>"><?php echo $section; ?></span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editVideo(<?php echo htmlspecialchars(json_encode($video)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteVideo(<?php echo $video['id']; ?>)">
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

<!-- Add/Edit Video Modal -->
<div class="modal fade" id="addVideoModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Video</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="videoForm">
                <div class="modal-body">
                    <input type="hidden" id="video_id" name="id">
                    <div class="mb-3">
                        <label class="form-label">Video URL</label>
                        <input type="url" class="form-control" id="video_url" name="video_url" placeholder="https://... (optional if uploading file)">
                        <small class="form-text text-muted">You can either paste a video URL (YouTube, etc.) or upload a video file below.</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Video File (optional)</label>
                        <input type="file" class="form-control" id="video_file" name="video_file" accept="video/*">
                        <small class="form-text text-muted">If you upload a file, it will be used instead of the URL above.</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Thumbnail Image</label>
                        <input type="file" class="form-control" id="thumbnail_file" name="thumbnail_file" accept="image/*">
                        <input type="hidden" id="thumbnail_url" name="thumbnail_url">
                        <div id="thumbnail_preview" class="mt-2" style="display: none;">
                            <img id="thumbnail_preview_img" src="" alt="Thumbnail preview" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                        </div>
                        <div id="thumbnail_existing" class="mt-2" style="display: none;">
                            <p class="text-muted small">Current thumbnail:</p>
                            <img id="thumbnail_existing_img" src="" alt="Current thumbnail" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-control" id="video_title" name="title">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" id="video_description" name="description" rows="3"></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Display Order <span class="text-muted">(1-3 for homepage sections)</span></label>
                                <input type="number" class="form-control" id="display_order" name="display_order" value="0" min="0">
                                <small class="form-text text-muted">
                                    <strong>Homepage Sections:</strong><br>
                                    • <strong>1</strong> = Hero Slider (Top section)<br>
                                    • <strong>2</strong> = Watch Video Section (Middle)<br>
                                    • <strong>3</strong> = Background Video (Bottom)<br>
                                    • <strong>4+</strong> = Reserved for future use (not displayed)
                                </small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-select" id="is_active" name="is_active">
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Video</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingVideoId = null;
let currentThumbnailUrl = null;
let currentVideoUrl = null;

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

document.getElementById('videoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
    
    try {
        let thumbnailUrl = currentThumbnailUrl;
        let videoUrl = (document.getElementById('video_url').value || '').trim();
        
        // Upload thumbnail if new file is selected
        const thumbnailFile = document.getElementById('thumbnail_file').files[0];
        if (thumbnailFile) {
            const thumbnailFormData = new FormData();
            thumbnailFormData.append('image', thumbnailFile);
            thumbnailFormData.append('type', 'general');
            
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
        } else if (editingVideoId && currentThumbnailUrl) {
            thumbnailUrl = currentThumbnailUrl;
        }

        // Upload video file if selected
        const videoFile = document.getElementById('video_file').files[0];
        if (videoFile) {
            const videoFormData = new FormData();
            videoFormData.append('video', videoFile);
            videoFormData.append('type', 'homepage');

            const videoUploadResponse = await fetch(API_BASE + 'upload/video.php', {
                method: 'POST',
                body: videoFormData,
                credentials: 'include'
            });

            const videoUploadResult = await videoUploadResponse.json();

            if (!videoUploadResult.success) {
                alert('Error uploading video: ' + videoUploadResult.message);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }

            videoUrl = videoUploadResult.url;
        } else if (editingVideoId && currentVideoUrl && !videoUrl) {
            // If editing and no new file/URL provided, keep existing video URL
            videoUrl = currentVideoUrl;
        }
        
        const formData = {
            video_url: videoUrl || null,
            thumbnail_url: thumbnailUrl || null,
            title: document.getElementById('video_title').value,
            description: document.getElementById('video_description').value,
            display_order: parseInt(document.getElementById('display_order').value) || 0,
            is_active: document.getElementById('is_active').value === '1'
        };
        
        if (editingVideoId) {
            formData.id = editingVideoId;
        }
        
        const result = await apiCall('homepage/videos.php', editingVideoId ? 'PUT' : 'POST', formData);
        
        if (result && result.success) {
            location.reload();
        } else {
            const errorMsg = result?.message || result?.error || 'Unknown error occurred';
            alert('Error: ' + errorMsg);
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Error saving video:', error);
        alert('Error: Failed to save video. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function editVideo(video) {
    editingVideoId = video.id;
    currentThumbnailUrl = video.thumbnail_url;
    currentVideoUrl = video.video_url;
    
    document.getElementById('modalTitle').textContent = 'Edit Video';
    document.getElementById('video_id').value = video.id;
    document.getElementById('video_url').value = video.video_url || '';
    document.getElementById('thumbnail_url').value = video.thumbnail_url || '';
    document.getElementById('video_title').value = video.title || '';
    document.getElementById('video_description').value = video.description || '';
    document.getElementById('display_order').value = video.display_order;
    document.getElementById('is_active').value = video.is_active ? '1' : '0';
    
    // Reset file inputs
    document.getElementById('thumbnail_file').value = '';
    document.getElementById('video_file').value = '';
    document.getElementById('thumbnail_preview').style.display = 'none';
    
    // Show existing thumbnail
    if (video.thumbnail_url) {
        document.getElementById('thumbnail_existing_img').src = video.thumbnail_url;
        document.getElementById('thumbnail_existing').style.display = 'block';
    } else {
        document.getElementById('thumbnail_existing').style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('addVideoModal')).show();
}

function deleteVideo(id) {
    if (confirmDelete()) {
        apiCall('homepage/videos.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting video:', error);
            alert('Error: Failed to delete video. Please try again.');
        });
    }
}

// Reset form when modal is closed
document.getElementById('addVideoModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('videoForm').reset();
    editingVideoId = null;
    currentThumbnailUrl = null;
    currentVideoUrl = null;
    document.getElementById('modalTitle').textContent = 'Add Video';
    document.getElementById('thumbnail_preview').style.display = 'none';
    document.getElementById('thumbnail_existing').style.display = 'none';
});
</script>

<?php include '../includes/footer.php'; ?>