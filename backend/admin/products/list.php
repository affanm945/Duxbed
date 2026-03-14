<?php
/**
 * Products Management
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
    // Get all products grouped by category
    $query = "SELECT * FROM products ORDER BY category, display_order ASC, created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    // Get categories
    $categories_query = "SELECT * FROM product_categories ORDER BY display_order ASC";
    $categories_stmt = $db->prepare($categories_query);
    $categories_stmt->execute();
    $categories = $categories_stmt->fetchAll();
    
    // Group products by category
    $products_by_category = [];
    foreach ($products as $product) {
        $cat = $product['category'];
        if (!isset($products_by_category[$cat])) {
            $products_by_category[$cat] = [];
        }
        $products_by_category[$cat][] = $product;
    }
} catch (Exception $e) {
    $products = [];
    $categories = [];
    $products_by_category = [];
    error_log("Error fetching products: " . $e->getMessage());
}

$page_title = "Products Management";
include '../includes/header.php';

// Slug for tab IDs (spaces break Bootstrap tab targeting: #id with space is invalid)
function category_tab_id($name) {
    return preg_replace('/\s+/', '-', strtolower(trim($name)));
}
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Products Management</h2>
    <div>
        <button class="btn btn-info me-2" data-bs-toggle="modal" data-bs-target="#categorySettingsModal">
            <i class="bi bi-gear"></i> Category Settings
        </button>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal">
            <i class="bi bi-plus-circle"></i> Add Product
        </button>
    </div>
</div>

<!-- Category Tabs -->
<ul class="nav nav-tabs mb-4" id="categoryTabs" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-bs-target="#all" type="button" role="tab">
            All Products
        </button>
    </li>
    <?php foreach ($categories as $cat): 
        $tab_id = category_tab_id($cat['category_name']);
    ?>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="<?php echo htmlspecialchars($tab_id); ?>-tab" data-bs-toggle="tab" 
                    data-bs-target="#<?php echo htmlspecialchars($tab_id); ?>" type="button" role="tab">
                <?php echo htmlspecialchars($cat['category_name']); ?>
            </button>
        </li>
    <?php endforeach; ?>
</ul>

<!-- Tab Content -->
<div class="tab-content" id="categoryTabContent">
    <!-- All Products Tab -->
    <div class="tab-pane fade show active" id="all" role="tabpanel">
        <div class="row">
            <?php foreach ($products as $product): ?>
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="<?php echo htmlspecialchars($product['thumbnail_url']); ?>" 
                             class="card-img-top" alt="<?php echo htmlspecialchars($product['name']); ?>" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23ddd\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'14\' dy=\'10.5\' font-weight=\'bold\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\'%3ENo Image%3C/text%3E%3C/svg%3E'">
                        <div class="card-body">
                            <h5 class="card-title"><?php echo htmlspecialchars($product['name']); ?></h5>
                            <p class="card-text">
                                <span class="badge bg-primary"><?php echo htmlspecialchars($product['category']); ?></span>
                                <?php if ($product['subcategory']): ?>
                                    <span class="badge bg-secondary"><?php echo htmlspecialchars($product['subcategory']); ?></span>
                                <?php endif; ?>
                                <span class="badge bg-<?php echo $product['is_active'] ? 'success' : 'danger'; ?>">
                                    <?php echo $product['is_active'] ? 'Active' : 'Inactive'; ?>
                                </span>
                            </p>
                            <p class="text-muted small mb-2">
                                Priority: <?php echo $product['display_order']; ?>
                            </p>
                            <div class="btn-group w-100">
                                <button class="btn btn-sm btn-primary" onclick="editProduct(<?php echo htmlspecialchars(json_encode($product)); ?>)">
                                    <i class="bi bi-pencil"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProduct(<?php echo $product['id']; ?>)">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
            <?php if (empty($products)): ?>
                <div class="col-12">
                    <div class="alert alert-info">No products found. Add your first product!</div>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Category-specific tabs -->
    <?php foreach ($categories as $cat): 
        $tab_id = category_tab_id($cat['category_name']);
    ?>
        <div class="tab-pane fade" id="<?php echo htmlspecialchars($tab_id); ?>" role="tabpanel">
            <div class="row">
                <?php 
                $cat_products = $products_by_category[$cat['category_name']] ?? [];
                foreach ($cat_products as $product): 
                ?>
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="<?php echo htmlspecialchars($product['thumbnail_url']); ?>" 
                                 class="card-img-top" alt="<?php echo htmlspecialchars($product['name']); ?>" 
                                 style="height: 200px; object-fit: cover;"
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23ddd\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'14\' dy=\'10.5\' font-weight=\'bold\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\'%3ENo Image%3C/text%3E%3C/svg%3E'">
                            <div class="card-body">
                                <h5 class="card-title"><?php echo htmlspecialchars($product['name']); ?></h5>
                                <p class="card-text">
                                    <?php if ($product['subcategory']): ?>
                                        <span class="badge bg-secondary"><?php echo htmlspecialchars($product['subcategory']); ?></span>
                                    <?php endif; ?>
                                    <span class="badge bg-<?php echo $product['is_active'] ? 'success' : 'danger'; ?>">
                                        <?php echo $product['is_active'] ? 'Active' : 'Inactive'; ?>
                                    </span>
                                </p>
                                <p class="text-muted small mb-2">
                                    Priority: <?php echo $product['display_order']; ?>
                                </p>
                                <div class="btn-group w-100">
                                    <button class="btn btn-sm btn-primary" onclick="editProduct(<?php echo htmlspecialchars(json_encode($product)); ?>)">
                                        <i class="bi bi-pencil"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(<?php echo $product['id']; ?>)">
                                        <i class="bi bi-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
                <?php if (empty($cat_products)): ?>
                    <div class="col-12">
                        <div class="alert alert-info">No products in this category yet.</div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<!-- Add/Edit Product Modal -->
<div class="modal fade" id="addProductModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Add Product</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="productForm">
                <div class="modal-body">
                    <input type="hidden" id="product_id" name="id">
                    <div class="row">
                        <div class="col-md-8 mb-3">
                            <label class="form-label">Product Name *</label>
                            <input type="text" class="form-control" id="product_name" name="name" required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Category *</label>
                            <select class="form-select" id="product_category" name="category" required>
                                <option value="">Select Category</option>
                                <option value="Space saving furniture">Space saving furniture</option>
                                <option value="Duxpod">Duxpod</option>
                                <option value="Interior designing">Interior designing</option>
                                <option value="Modular kitchen">Modular kitchen</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Subcategory</label>
                            <input type="text" class="form-control" id="product_subcategory" name="subcategory" 
                                   placeholder="e.g., Chairs, Sofa, Bed, etc.">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Display Order (Priority) *</label>
                            <input type="number" class="form-control" id="product_display_order" name="display_order" value="0" required>
                            <small class="text-muted">Lower numbers appear first</small>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Thumbnail Image <span id="thumbnail_required" class="text-danger">*</span></label>
                            <input type="file" class="form-control" id="product_thumbnail_file" name="thumbnail_file" accept="image/*">
                            <input type="hidden" id="product_thumbnail" name="thumbnail_url">
                            <small class="text-muted">Small image for product listing</small>
                            <div id="thumbnail_preview" class="mt-2" style="display: none;">
                                <img id="thumbnail_preview_img" src="" alt="Thumbnail preview" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                            <div id="thumbnail_existing" class="mt-2" style="display: none;">
                                <p class="text-muted small">Current thumbnail:</p>
                                <img id="thumbnail_existing_img" src="" alt="Current thumbnail" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Full Image <span id="full_image_required" class="text-danger">*</span></label>
                            <input type="file" class="form-control" id="product_full_image_file" name="full_image_file" accept="image/*">
                            <input type="hidden" id="product_full_image" name="full_image_url">
                            <small class="text-muted">Large image for product modal</small>
                            <div id="full_image_preview" class="mt-2" style="display: none;">
                                <img id="full_image_preview_img" src="" alt="Full image preview" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                            <div id="full_image_existing" class="mt-2" style="display: none;">
                                <p class="text-muted small">Current full image:</p>
                                <img id="full_image_existing_img" src="" alt="Current full image" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">WhatsApp Message Text</label>
                        <textarea class="form-control" id="product_whatsapp" name="whatsapp_text" rows="3" 
                                  placeholder="Message that will be sent when user clicks WhatsApp button"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" id="product_description" name="description" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="product_is_active" name="is_active">
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Product</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Category Settings Modal -->
<div class="modal fade" id="categorySettingsModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Category Settings</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p class="text-muted">Manage category header images and settings</p>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Header Image</th>
                                <th>Display Order</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($categories as $cat): ?>
                                <tr>
                                    <td><strong><?php echo htmlspecialchars($cat['category_name']); ?></strong></td>
                                    <td>
                                        <input type="file" class="form-control form-control-sm category-header-image-file" 
                                               data-category="<?php echo htmlspecialchars($cat['category_name']); ?>"
                                               accept="image/*">
                                        <input type="hidden" class="category-header-image" 
                                               data-category="<?php echo htmlspecialchars($cat['category_name']); ?>"
                                               value="<?php echo htmlspecialchars($cat['header_image_url'] ?? ''); ?>">
                                        <?php if ($cat['header_image_url']): ?>
                                            <div class="mt-1">
                                                <img src="<?php echo htmlspecialchars($cat['header_image_url']); ?>" 
                                                     alt="Current header" 
                                                     style="max-width: 100px; max-height: 60px; border: 1px solid #ddd; border-radius: 4px; padding: 2px;"
                                                     class="category-header-preview" data-category="<?php echo htmlspecialchars($cat['category_name']); ?>">
                                            </div>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <input type="number" class="form-control form-control-sm category-display-order" 
                                               data-category="<?php echo htmlspecialchars($cat['category_name']); ?>"
                                               value="<?php echo $cat['display_order']; ?>">
                                    </td>
                                    <td>
                                        <select class="form-select form-select-sm category-status" 
                                                data-category="<?php echo htmlspecialchars($cat['category_name']); ?>">
                                            <option value="1" <?php echo $cat['is_active'] ? 'selected' : ''; ?>>Active</option>
                                            <option value="0" <?php echo !$cat['is_active'] ? 'selected' : ''; ?>>Inactive</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="saveCategorySettings('<?php echo htmlspecialchars($cat['category_name']); ?>')">
                                            <i class="bi bi-save"></i> Save
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<script>
let editingProductId = null;
let currentThumbnailUrl = null;
let currentFullImageUrl = null;

// Thumbnail preview
document.getElementById('product_thumbnail_file').addEventListener('change', function(e) {
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

// Full image preview
document.getElementById('product_full_image_file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('full_image_preview_img').src = e.target.result;
            document.getElementById('full_image_preview').style.display = 'block';
            document.getElementById('full_image_existing').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
    
    try {
        let thumbnailUrl = currentThumbnailUrl;
        let fullImageUrl = currentFullImageUrl;
        
        // Upload thumbnail if new file is selected
        const thumbnailFile = document.getElementById('product_thumbnail_file').files[0];
        if (thumbnailFile) {
            const thumbnailFormData = new FormData();
            thumbnailFormData.append('image', thumbnailFile);
            thumbnailFormData.append('type', 'product');
            
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
        } else if (editingProductId && currentThumbnailUrl) {
            thumbnailUrl = currentThumbnailUrl;
        }
        
        // Upload full image if new file is selected
        const fullImageFile = document.getElementById('product_full_image_file').files[0];
        if (fullImageFile) {
            const fullImageFormData = new FormData();
            fullImageFormData.append('image', fullImageFile);
            fullImageFormData.append('type', 'product');
            
            const fullImageUploadResponse = await fetch(API_BASE + 'upload/image.php', {
                method: 'POST',
                body: fullImageFormData,
                credentials: 'include'
            });
            
            const fullImageUploadResult = await fullImageUploadResponse.json();
            
            if (!fullImageUploadResult.success) {
                alert('Error uploading full image: ' + fullImageUploadResult.message);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            fullImageUrl = fullImageUploadResult.url;
        } else if (editingProductId && currentFullImageUrl) {
            fullImageUrl = currentFullImageUrl;
        }
        
        // Validate required fields
        if (!thumbnailUrl) {
            if (editingProductId && !currentThumbnailUrl) {
                alert('Please upload a thumbnail image or keep the existing one');
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            } else if (!editingProductId) {
                alert('Please upload a thumbnail image');
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
        }
        
        if (!fullImageUrl) {
            if (editingProductId && !currentFullImageUrl) {
                alert('Please upload a full image or keep the existing one');
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            } else if (!editingProductId) {
                alert('Please upload a full image');
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
        }
        
        const formData = {
            name: document.getElementById('product_name').value,
            category: document.getElementById('product_category').value,
            subcategory: document.getElementById('product_subcategory').value || null,
            thumbnail_url: thumbnailUrl,
            full_image_url: fullImageUrl,
            whatsapp_text: document.getElementById('product_whatsapp').value || '',
            description: document.getElementById('product_description').value || null,
            display_order: parseInt(document.getElementById('product_display_order').value),
            is_active: document.getElementById('product_is_active').value === '1'
        };
        
        if (editingProductId) {
            formData.id = editingProductId;
            const result = await apiCall('products/update.php', 'PUT', formData);
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        } else {
            const result = await apiCall('products/create.php', 'POST', formData);
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
        console.error('Error saving product:', error);
        alert('Error: Failed to save product. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function editProduct(product) {
    editingProductId = product.id;
    currentThumbnailUrl = product.thumbnail_url;
    currentFullImageUrl = product.full_image_url;
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('product_id').value = product.id;
    document.getElementById('product_name').value = product.name;
    document.getElementById('product_category').value = product.category;
    document.getElementById('product_subcategory').value = product.subcategory || '';
    document.getElementById('product_thumbnail').value = product.thumbnail_url;
    document.getElementById('product_full_image').value = product.full_image_url;
    document.getElementById('product_whatsapp').value = product.whatsapp_text || '';
    document.getElementById('product_description').value = product.description || '';
    document.getElementById('product_display_order').value = product.display_order;
    document.getElementById('product_is_active').value = product.is_active ? '1' : '0';
    
    // Hide required indicators when editing
    document.getElementById('thumbnail_required').style.display = 'none';
    document.getElementById('full_image_required').style.display = 'none';
    
    // Reset file inputs
    document.getElementById('product_thumbnail_file').value = '';
    document.getElementById('product_full_image_file').value = '';
    document.getElementById('thumbnail_preview').style.display = 'none';
    document.getElementById('full_image_preview').style.display = 'none';
    
    // Show existing images
    if (product.thumbnail_url) {
        document.getElementById('thumbnail_existing_img').src = product.thumbnail_url;
        document.getElementById('thumbnail_existing').style.display = 'block';
    } else {
        document.getElementById('thumbnail_existing').style.display = 'none';
    }
    
    if (product.full_image_url) {
        document.getElementById('full_image_existing_img').src = product.full_image_url;
        document.getElementById('full_image_existing').style.display = 'block';
    } else {
        document.getElementById('full_image_existing').style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('addProductModal')).show();
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        apiCall('products/delete.php?id=' + id, 'DELETE').then(result => {
            if (result && result.success) {
                location.reload();
            } else {
                const errorMsg = result?.message || result?.error || 'Unknown error occurred';
                alert('Error: ' + errorMsg);
            }
        }).catch(error => {
            console.error('Error deleting product:', error);
            alert('Error: Failed to delete product. Please try again.');
        });
    }
}

// Category header image preview
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('category-header-image-file')) {
        const file = e.target.files[0];
        const categoryName = e.target.dataset.category;
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                let preview = document.querySelector(`.category-header-preview[data-category="${categoryName}"]`);
                if (!preview) {
                    const td = e.target.closest('td');
                    const div = document.createElement('div');
                    div.className = 'mt-1';
                    div.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 60px; border: 1px solid #ddd; border-radius: 4px; padding: 2px;" class="category-header-preview" data-category="${categoryName}">`;
                    td.appendChild(div);
                } else {
                    preview.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }
});

async function saveCategorySettings(categoryName) {
    const headerImageFile = document.querySelector(`.category-header-image-file[data-category="${categoryName}"]`).files[0];
    const headerImageInput = document.querySelector(`.category-header-image[data-category="${categoryName}"]`);
    const displayOrder = parseInt(document.querySelector(`.category-display-order[data-category="${categoryName}"]`).value);
    const isActive = document.querySelector(`.category-status[data-category="${categoryName}"]`).value === '1';
    
    let headerImageUrl = headerImageInput.value;
    
    // Upload header image if new file is selected
    if (headerImageFile) {
        const headerImageFormData = new FormData();
        headerImageFormData.append('image', headerImageFile);
        headerImageFormData.append('type', 'product');
        
        try {
            const headerImageUploadResponse = await fetch(API_BASE + 'upload/image.php', {
                method: 'POST',
                body: headerImageFormData,
                credentials: 'include'
            });
            
            const headerImageUploadResult = await headerImageUploadResponse.json();
            
            if (!headerImageUploadResult.success) {
                alert('Error uploading header image: ' + headerImageUploadResult.message);
                return;
            }
            
            headerImageUrl = headerImageUploadResult.url;
        } catch (error) {
            console.error('Error uploading header image:', error);
            alert('Error uploading header image. Please try again.');
            return;
        }
    }
    
    const formData = {
        category_name: categoryName,
        header_image_url: headerImageUrl || null,
        display_order: displayOrder,
        is_active: isActive
    };
    
    try {
        const result = await apiCall('products/categories.php', 'PUT', formData);
        if (result && result.success) {
            alert('Category settings saved successfully!');
            // Update the hidden input with new URL
            headerImageInput.value = headerImageUrl || '';
        } else {
            const errorMsg = result?.message || result?.error || 'Unknown error occurred';
            alert('Error: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error saving category settings:', error);
        alert('Error: Failed to save category settings. Please try again.');
    }
}

document.getElementById('addProductModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('productForm').reset();
    editingProductId = null;
    currentThumbnailUrl = null;
    currentFullImageUrl = null;
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('thumbnail_required').style.display = 'inline';
    document.getElementById('full_image_required').style.display = 'inline';
    document.getElementById('thumbnail_preview').style.display = 'none';
    document.getElementById('thumbnail_existing').style.display = 'none';
    document.getElementById('full_image_preview').style.display = 'none';
    document.getElementById('full_image_existing').style.display = 'none';
});
</script>

<?php include '../includes/footer.php'; ?>
