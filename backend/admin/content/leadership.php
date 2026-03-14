<?php
/**
 * Leadership Profiles Management
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
    $query = "SELECT * FROM leadership_profiles ORDER BY display_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $profiles = $stmt->fetchAll();
} catch (Exception $e) {
    $profiles = [];
    error_log("Error fetching leadership profiles: " . $e->getMessage());
}

$page_title = "Leadership Profiles";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Leadership Profiles</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProfileModal">
        <i class="bi bi-plus-circle"></i> Add Profile
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($profiles as $profile): ?>
                        <tr>
                            <td><?php echo $profile['id']; ?></td>
                            <td>
                                <?php if ($profile['image_url']): ?>
                                    <img src="<?php echo htmlspecialchars($profile['image_url']); ?>" alt="<?php echo htmlspecialchars($profile['name']); ?>" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">
                                <?php else: ?>
                                    <div style="width: 50px; height: 50px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                        <i class="bi bi-person"></i>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td><strong><?php echo htmlspecialchars($profile['name']); ?></strong></td>
                            <td><?php echo htmlspecialchars($profile['position']); ?></td>
                            <td><?php echo $profile['display_order']; ?></td>
                            <td>
                                <span class="badge bg-<?php echo $profile['is_active'] ? 'success' : 'secondary'; ?>">
                                    <?php echo $profile['is_active'] ? 'Active' : 'Inactive'; ?>
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editProfile(<?php echo htmlspecialchars(json_encode($profile)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProfile(<?php echo $profile['id']; ?>)">
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
<div class="modal fade" id="addProfileModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Leadership Profile</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="profileForm">
                <div class="modal-body">
                    <input type="hidden" id="profile_id" name="id">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Name *</label>
                            <input type="text" class="form-control" id="profile_name" name="name" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Position *</label>
                            <input type="text" class="form-control" id="profile_position" name="position" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bio</label>
                        <textarea class="form-control" id="profile_bio" name="bio" rows="4"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Photo</label>
                        <input type="file" class="form-control" id="profile_image_file" name="image_file" accept="image/*">
                        <input type="hidden" id="profile_image" name="image_url">
                        <div id="profile_image_preview" class="mt-2" style="display: none;">
                            <img id="profile_image_preview_img" src="" alt="Photo preview" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 50%; padding: 5px; object-fit: cover;">
                        </div>
                        <div id="profile_image_existing" class="mt-2" style="display: none;">
                            <p class="text-muted small">Current photo:</p>
                            <img id="profile_image_existing_img" src="" alt="Current photo" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 50%; padding: 5px; object-fit: cover;">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="profile_email" name="email">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">LinkedIn URL</label>
                            <input type="url" class="form-control" id="profile_linkedin" name="linkedin_url">
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
                    <button type="submit" class="btn btn-primary">Save Profile</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingProfileId = null;
let currentImageUrl = null;

// Image preview
document.getElementById('profile_image_file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile_image_preview_img').src = e.target.result;
            document.getElementById('profile_image_preview').style.display = 'block';
            document.getElementById('profile_image_existing').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
    
    try {
        let imageUrl = currentImageUrl;
        
        // Upload image if new file is selected
        const imageFile = document.getElementById('profile_image_file').files[0];
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
        } else if (editingProfileId && currentImageUrl) {
            imageUrl = currentImageUrl;
        }
        
        const formData = {
            name: document.getElementById('profile_name').value,
            position: document.getElementById('profile_position').value,
            bio: document.getElementById('profile_bio').value,
            image_url: imageUrl || null,
            email: document.getElementById('profile_email').value || null,
            linkedin_url: document.getElementById('profile_linkedin').value || null,
            display_order: parseInt(document.getElementById('display_order').value),
            is_active: document.getElementById('is_active').value === '1'
        };
        
        if (editingProfileId) {
            formData.id = editingProfileId;
            const result = await apiCall('content/leadership.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        } else {
            const result = await apiCall('content/leadership.php', 'POST', formData);
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
        console.error('Error saving profile:', error);
        alert('Error: Failed to save profile. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function editProfile(profile) {
    editingProfileId = profile.id;
    currentImageUrl = profile.image_url;
    
    document.getElementById('modalTitle').textContent = 'Edit Leadership Profile';
    document.getElementById('profile_id').value = profile.id;
    document.getElementById('profile_name').value = profile.name;
    document.getElementById('profile_position').value = profile.position;
    document.getElementById('profile_bio').value = profile.bio || '';
    document.getElementById('profile_image').value = profile.image_url || '';
    document.getElementById('profile_email').value = profile.email || '';
    document.getElementById('profile_linkedin').value = profile.linkedin_url || '';
    document.getElementById('display_order').value = profile.display_order;
    document.getElementById('is_active').value = profile.is_active ? '1' : '0';
    
    // Reset file input
    document.getElementById('profile_image_file').value = '';
    document.getElementById('profile_image_preview').style.display = 'none';
    
    // Show existing image
    if (profile.image_url) {
        document.getElementById('profile_image_existing_img').src = profile.image_url;
        document.getElementById('profile_image_existing').style.display = 'block';
    } else {
        document.getElementById('profile_image_existing').style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('addProfileModal')).show();
}

function deleteProfile(id) {
    if (confirmDelete()) {
        apiCall('content/leadership.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting profile:', error);
            alert('Error: Failed to delete profile. Please try again.');
        });
    }
}

document.getElementById('addProfileModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('profileForm').reset();
    editingProfileId = null;
    currentImageUrl = null;
    document.getElementById('modalTitle').textContent = 'Add Leadership Profile';
    document.getElementById('profile_image_preview').style.display = 'none';
    document.getElementById('profile_image_existing').style.display = 'none';
});
</script>

<?php include '../includes/footer.php'; ?>

