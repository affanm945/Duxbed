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
    $query = "SELECT * FROM contact_details ORDER BY id DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $contacts = $stmt->fetchAll();
} catch (Exception $e) {
    $contacts = [];
}

$page_title = "Contact Details";
include '../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Contact Details</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#contactDetailsModal">
        <i class="bi bi-plus-circle"></i> Add Contact
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Address Line 1</th>
                        <th>Address Line 2</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>WhatsApp</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($contacts as $contact): ?>
                        <tr>
                            <td><?php echo $contact['id']; ?></td>
                            <td><?php echo htmlspecialchars($contact['address_line1']); ?></td>
                            <td><?php echo htmlspecialchars($contact['address_line2'] ?? ''); ?></td>
                            <td><?php echo htmlspecialchars($contact['phone']); ?></td>
                            <td><?php echo htmlspecialchars($contact['email']); ?></td>
                            <td><?php echo htmlspecialchars($contact['whatsapp_number']); ?></td>
                            <td>
                                <span class="badge bg-<?php echo !empty($contact['is_active']) ? 'success' : 'secondary'; ?>">
                                    <?php echo !empty($contact['is_active']) ? 'Active' : 'Inactive'; ?>
                                </span>
                            </td>
                            <td>
                                <button
                                    class="btn btn-sm btn-primary"
                                    onclick='editContact(<?php echo json_encode($contact, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>)'>
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteContact(<?php echo $contact['id']; ?>)">
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
<div class="modal fade" id="contactDetailsModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="contactModalTitle">Add Contact</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="contactForm">
                <div class="modal-body">
                    <input type="hidden" id="contact_id" name="id">
                    <div class="mb-3">
                        <label class="form-label">Address Line 1 *</label>
                        <input type="text" class="form-control" id="address_line1" name="address_line1" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Address Line 2 *</label>
                        <input type="text" class="form-control" id="address_line2" name="address_line2" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Phone *</label>
                        <input type="text" class="form-control" id="phone" name="phone" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email *</label>
                        <input type="email" class="form-control" id="email" name="email" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">WhatsApp Number *</label>
                        <input type="text" class="form-control" id="whatsapp_number" name="whatsapp_number" required>
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
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let editingContactId = null;

document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        address_line1: document.getElementById('address_line1').value,
        address_line2: document.getElementById('address_line2').value || null,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        whatsapp_number: document.getElementById('whatsapp_number').value || null,
        is_active: document.getElementById('is_active').value === '1'
    };

    try {
        let result;
        if (editingContactId) {
            formData.id = editingContactId;
            result = await apiCall('contact-details/update.php', 'PUT', formData);
        } else {
            result = await apiCall('contact-details/create.php', 'POST', formData);
        }

        if (result && result.success) {
            location.reload();
        } else {
            const errorMsg = result?.message || result?.error || 'Unknown error occurred';
            alert('Error: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error saving contact details:', error);
        alert('Error: Failed to save contact details. Please try again.');
    }
});

function editContact(contact) {
    editingContactId = contact.id;
    document.getElementById('contactModalTitle').textContent = 'Edit Contact';
    document.getElementById('contact_id').value = contact.id;
    document.getElementById('address_line1').value = contact.address_line1 || '';
    document.getElementById('address_line2').value = contact.address_line2 || '';
    document.getElementById('phone').value = contact.phone || '';
    document.getElementById('email').value = contact.email || '';
    document.getElementById('whatsapp_number').value = contact.whatsapp_number || '';
    document.getElementById('is_active').value = contact.is_active ? '1' : '0';

    new bootstrap.Modal(document.getElementById('contactDetailsModal')).show();
}

function deleteContact(id) {
    if (confirmDelete('Are you sure you want to delete this contact record?')) {
        apiCall('contact-details/delete.php?id=' + id, 'DELETE')
            .then(result => {
                if (result && result.success) {
                    location.reload();
                } else {
                    const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                    alert('Error: ' + errorMsg);
                }
            })
            .catch(error => {
                console.error('Error deleting contact details:', error);
                alert('Error: Failed to delete contact details. Please try again.');
            });
    }
}

document.getElementById('contactDetailsModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('contactForm').reset();
    editingContactId = null;
    document.getElementById('contactModalTitle').textContent = 'Add Contact';
});
</script>

<?php include '../includes/footer.php'; ?>

