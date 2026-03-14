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

try {
    $query = "SELECT * FROM franchise_locations ORDER BY display_order ASC, city ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $locations = $stmt->fetchAll();
} catch (Exception $e) {
    $locations = [];
}

$page_title = "Franchise Locations";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Franchise Locations</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addLocationModal">
        <i class="bi bi-plus-circle"></i> Add Location
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($locations as $loc): ?>
                        <tr>
                            <td><?php echo $loc['id']; ?></td>
                            <td><strong><?php echo htmlspecialchars($loc['name']); ?></strong></td>
                            <td><?php echo htmlspecialchars($loc['address']); ?></td>
                            <td><?php echo htmlspecialchars($loc['city']); ?></td>
                            <td><?php echo htmlspecialchars($loc['phone']); ?></td>
                            <td><span class="badge bg-<?php echo $loc['is_active'] ? 'success' : 'secondary'; ?>"><?php echo $loc['is_active'] ? 'Active' : 'Inactive'; ?></span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editLocation(<?php echo htmlspecialchars(json_encode($loc)); ?>)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteLocation(<?php echo $loc['id']; ?>)">
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
<div class="modal fade" id="addLocationModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Location</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="locationForm">
                <div class="modal-body">
                    <input type="hidden" id="location_id" name="id">
                    <div class="mb-3">
                        <label class="form-label">Name *</label>
                        <input type="text" class="form-control" id="location_name" name="name" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Address *</label>
                        <textarea class="form-control" id="address" name="address" rows="2" required></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">City</label>
                            <input type="text" class="form-control" id="city" name="city">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">State</label>
                            <input type="text" class="form-control" id="state" name="state">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Pincode</label>
                            <input type="text" class="form-control" id="pincode" name="pincode">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Phone</label>
                            <input type="text" class="form-control" id="phone" name="phone">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Map Query (for Google Maps)</label>
                        <input type="text" class="form-control" id="map_query" name="map_query">
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Latitude</label>
                            <input type="number" step="any" class="form-control" id="latitude" name="latitude">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Longitude</label>
                            <input type="number" step="any" class="form-control" id="longitude" name="longitude">
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
                    <button type="submit" class="btn btn-primary">Save Location</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingLocationId = null;

document.getElementById('locationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('location_name').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        pincode: document.getElementById('pincode').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        map_query: document.getElementById('map_query').value,
        latitude: document.getElementById('latitude').value || null,
        longitude: document.getElementById('longitude').value || null,
        display_order: parseInt(document.getElementById('display_order').value),
        is_active: document.getElementById('is_active').value === '1'
    };
    try {
        if (editingLocationId) {
            formData.id = editingLocationId;
            const result = await apiCall('locations/update.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        } else {
            const result = await apiCall('locations/create.php', 'POST', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }
    } catch (error) {
        console.error('Error saving location:', error);
        alert('Error: Failed to save location. Please check your connection and try again.');
    }
});

function editLocation(loc) {
    editingLocationId = loc.id;
    document.getElementById('modalTitle').textContent = 'Edit Location';
    document.getElementById('location_id').value = loc.id;
    document.getElementById('location_name').value = loc.name;
    document.getElementById('address').value = loc.address;
    document.getElementById('city').value = loc.city || '';
    document.getElementById('state').value = loc.state || '';
    document.getElementById('pincode').value = loc.pincode || '';
    document.getElementById('phone').value = loc.phone || '';
    document.getElementById('email').value = loc.email || '';
    document.getElementById('map_query').value = loc.map_query || '';
    document.getElementById('latitude').value = loc.latitude || '';
    document.getElementById('longitude').value = loc.longitude || '';
    document.getElementById('display_order').value = loc.display_order;
    document.getElementById('is_active').value = loc.is_active ? '1' : '0';
    new bootstrap.Modal(document.getElementById('addLocationModal')).show();
}

function deleteLocation(id) {
    if (confirmDelete()) {
        apiCall('locations/delete.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting location:', error);
            alert('Error: Failed to delete location. Please try again.');
        });
    }
}

document.getElementById('addLocationModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('locationForm').reset();
    editingLocationId = null;
    document.getElementById('modalTitle').textContent = 'Add Location';
});
</script>

<?php include '../includes/footer.php'; ?>

