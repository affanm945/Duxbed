<?php
/**
 * Job Applications Management
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

$job_id = $_GET['job_id'] ?? null;
$status_filter = $_GET['status'] ?? '';

try {
    $query = "SELECT ja.*, jl.title as job_title, jl.department 
             FROM job_applications ja
             LEFT JOIN job_listings jl ON ja.job_id = jl.id
             WHERE 1=1";
    $params = [];
    
    if ($job_id) {
        $query .= " AND ja.job_id = :job_id";
        $params[':job_id'] = (int)$job_id;
    }
    
    if ($status_filter) {
        $query .= " AND ja.status = :status";
        $params[':status'] = $status_filter;
    }
    
    $query .= " ORDER BY ja.created_at DESC";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $applications = [];
    error_log("Error fetching applications: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
}

$page_title = "Job Applications";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h2>Job Applications</h2>
        <?php if ($job_id && empty($applications)): ?>
            <p class="text-muted mb-0">
                <small>Applications will appear here once candidates apply for this job posting.</small>
            </p>
        <?php endif; ?>
    </div>
    <?php if ($job_id): ?>
        <a href="jobs.php" class="btn btn-secondary">
            <i class="bi bi-arrow-left"></i> Back to Jobs
        </a>
    <?php endif; ?>
</div>

<!-- Filters -->
<div class="card mb-4">
    <div class="card-body">
        <form method="GET" class="row g-3">
            <?php if ($job_id): ?>
                <input type="hidden" name="job_id" value="<?php echo $job_id; ?>">
            <?php endif; ?>
            <div class="col-md-4">
                <select class="form-select" name="status">
                    <option value="">All Statuses</option>
                    <option value="pending" <?php echo $status_filter === 'pending' ? 'selected' : ''; ?>>Pending</option>
                    <option value="reviewed" <?php echo $status_filter === 'reviewed' ? 'selected' : ''; ?>>Reviewed</option>
                    <option value="shortlisted" <?php echo $status_filter === 'shortlisted' ? 'selected' : ''; ?>>Shortlisted</option>
                    <option value="rejected" <?php echo $status_filter === 'rejected' ? 'selected' : ''; ?>>Rejected</option>
                    <option value="hired" <?php echo $status_filter === 'hired' ? 'selected' : ''; ?>>Hired</option>
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100">Filter</button>
            </div>
            <div class="col-md-2">
                <a href="applications.php<?php echo $job_id ? '?job_id=' . $job_id : ''; ?>" class="btn btn-secondary w-100">Clear</a>
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
                        <th>Applicant</th>
                        <th>Position</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Applied Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($applications)): ?>
                        <tr>
                            <td colspan="8" class="text-center py-4">
                                <div class="text-muted">
                                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                                    <p class="mt-3 mb-0">No applications found</p>
                                    <?php if ($job_id): ?>
                                        <small>There are no applications for this job posting yet.</small>
                                    <?php else: ?>
                                        <small>No job applications have been submitted yet.</small>
                                    <?php endif; ?>
                                </div>
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($applications as $app): ?>
                            <tr>
                                <td><?php echo $app['id']; ?></td>
                                <td><strong><?php echo htmlspecialchars($app['name']); ?></strong></td>
                                <td><?php echo htmlspecialchars($app['job_title'] ?? $app['position'] ?? '-'); ?></td>
                                <td><?php echo htmlspecialchars($app['email']); ?></td>
                                <td><?php echo htmlspecialchars($app['phone'] ?? '-'); ?></td>
                                <td>
                                    <span class="badge bg-<?php 
                                        echo match($app['status'] ?? 'pending') {
                                            'hired' => 'success',
                                            'shortlisted' => 'info',
                                            'reviewed' => 'warning',
                                            'rejected' => 'danger',
                                            default => 'secondary'
                                        };
                                    ?>">
                                        <?php echo ucfirst($app['status'] ?? 'pending'); ?>
                                    </span>
                                </td>
                                <td><?php echo date('d M Y', strtotime($app['created_at'])); ?></td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="viewApplication(<?php echo htmlspecialchars(json_encode($app)); ?>)">
                                        <i class="bi bi-eye"></i> View
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- View Application Modal -->
<div class="modal fade" id="viewApplicationModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Application Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="applicationDetails">
                <!-- Content will be loaded dynamically -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<script>
function viewApplication(app) {
    const details = `
        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Applicant Name:</strong><br>
                ${app.name}
            </div>
            <div class="col-md-6">
                <strong>Position Applied:</strong><br>
                ${app.job_title || app.position}
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Email:</strong><br>
                ${app.email}
            </div>
            <div class="col-md-6">
                <strong>Phone:</strong><br>
                ${app.phone || '-'}
            </div>
        </div>
        <div class="mb-3">
            <strong>Cover Letter:</strong><br>
            <p class="mt-2">${app.cover_letter ? app.cover_letter.replace(/\n/g, '<br>') : 'Not provided'}</p>
        </div>
        <div class="mb-3">
            <strong>Resume:</strong><br>
            ${app.resume_path ? `<a href="${app.resume_path}" target="_blank" class="btn btn-sm btn-primary mt-2"><i class="bi bi-download"></i> Download Resume</a>` : 'Not available'}
        </div>
        <hr>
        <form id="statusUpdateForm">
            <input type="hidden" name="id" value="${app.id}">
            <div class="mb-3">
                <label class="form-label"><strong>Update Status</strong></label>
                <select class="form-select" name="status" required>
                    <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="reviewed" ${app.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                    <option value="shortlisted" ${app.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                    <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    <option value="hired" ${app.status === 'hired' ? 'selected' : ''}>Hired</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea class="form-control" name="notes" rows="3">${app.notes || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Update Status</button>
        </form>
    `;
    
    document.getElementById('applicationDetails').innerHTML = details;
    
    document.getElementById('statusUpdateForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        try {
            const result = await apiCall('careers/applications.php', 'PUT', data);
            
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Error: Failed to update application. Please try again.');
        }
    });
    
    new bootstrap.Modal(document.getElementById('viewApplicationModal')).show();
}
</script>

<?php include '../includes/footer.php'; ?>

