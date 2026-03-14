<?php
/**
 * Job Listings Management
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
    $query = "SELECT * FROM job_listings ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $jobs = $stmt->fetchAll();
} catch (Exception $e) {
    $jobs = [];
    error_log("Error fetching jobs: " . $e->getMessage());
}

$page_title = "Job Listings";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Job Listings</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addJobModal">
        <i class="bi bi-plus-circle"></i> Add Job
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
                        <th>Department</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($jobs as $job): ?>
                        <tr>
                            <td><?php echo $job['id']; ?></td>
                            <td><strong><?php echo htmlspecialchars($job['title']); ?></strong></td>
                            <td><?php echo htmlspecialchars($job['department'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($job['location'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($job['type']); ?></td>
                            <td>
                                <span class="badge bg-<?php echo $job['is_active'] ? 'success' : 'secondary'; ?>">
                                    <?php echo $job['is_active'] ? 'Active' : 'Inactive'; ?>
                                </span>
                            </td>
                            <td>
                                <a href="applications.php?job_id=<?php echo $job['id']; ?>" class="btn btn-sm btn-info">
                                    <i class="bi bi-people"></i> Applications
                                </a>
                                <button class="btn btn-sm btn-primary" onclick="editJob(<?php echo htmlspecialchars(json_encode($job)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteJob(<?php echo $job['id']; ?>)">
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

<!-- Add/Edit Job Modal -->
<div class="modal fade" id="addJobModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Job Listing</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="jobForm">
                <div class="modal-body">
                    <input type="hidden" id="job_id" name="id">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Job Title *</label>
                            <input type="text" class="form-control" id="job_title" name="title" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Department</label>
                            <input type="text" class="form-control" id="department" name="department">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Location</label>
                            <input type="text" class="form-control" id="job_location" name="location">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Job Type</label>
                            <select class="form-select" id="job_type" name="type">
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description *</label>
                        <textarea class="form-control" id="job_description" name="description" rows="4" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Requirements (one per line)</label>
                        <textarea class="form-control" id="requirements" name="requirements" rows="5" placeholder="Enter requirements, one per line"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Skills Required (one per line)</label>
                        <textarea class="form-control" id="skills_required" name="skills_required" rows="4" placeholder="e.g. Strong communication, MS Excel, Customer handling"></textarea>
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
                    <button type="submit" class="btn btn-primary">Save Job</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingJobId = null;

document.getElementById('jobForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const requirements = document.getElementById('requirements').value.split('\n').filter(r => r.trim());
    const skillsRequired = document.getElementById('skills_required').value.split('\n').filter(r => r.trim());
    
    const formData = {
        title: document.getElementById('job_title').value,
        department: document.getElementById('department').value,
        location: document.getElementById('job_location').value,
        type: document.getElementById('job_type').value,
        description: document.getElementById('job_description').value,
        requirements: requirements.join(', '),
        skills_required: skillsRequired.join(', '),
        is_active: document.getElementById('is_active').value === '1'
    };
    
    if (editingJobId) {
        formData.id = editingJobId;
    }
    
    try {
        const result = await apiCall('careers/jobs.php', editingJobId ? 'PUT' : 'POST', formData);
        
        if (result && result.success) {
            location.reload();
        } else {
            const errorMsg = result?.message || result?.error || 'Unknown error occurred';
            alert('Error: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error saving job:', error);
        alert('Error: Failed to save job. Please check your connection and try again.');
    }
});

function editJob(job) {
    editingJobId = job.id;
    document.getElementById('modalTitle').textContent = 'Edit Job Listing';
    document.getElementById('job_id').value = job.id;
    document.getElementById('job_title').value = job.title;
    document.getElementById('department').value = job.department || '';
    document.getElementById('job_location').value = job.location || '';
    document.getElementById('job_type').value = job.type;
    document.getElementById('job_description').value = job.description || '';
    document.getElementById('requirements').value = job.requirements ? job.requirements.replace(/, /g, '\n') : '';
    document.getElementById('skills_required').value = job.skills_required ? job.skills_required.replace(/, /g, '\n') : '';
    document.getElementById('is_active').value = job.is_active ? '1' : '0';
    
    new bootstrap.Modal(document.getElementById('addJobModal')).show();
}

function deleteJob(id) {
    if (confirmDelete()) {
        apiCall('careers/jobs.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting job:', error);
            alert('Error: Failed to delete job. Please try again.');
        });
    }
}

document.getElementById('addJobModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('jobForm').reset();
    editingJobId = null;
    document.getElementById('modalTitle').textContent = 'Add Job Listing';
});
</script>

<?php include '../includes/footer.php'; ?>

