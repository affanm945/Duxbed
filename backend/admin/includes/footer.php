    </div> <!-- End main-content -->
    
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
    <script>
        // Initialize DataTables
        $(document).ready(function() {
            if ($('.data-table').length) {
                $('.data-table').DataTable({
                    pageLength: 25,
                    order: [[0, 'desc']]
                });
            }
        });
        
        // Confirm delete
        function confirmDelete(message = 'Are you sure you want to delete this item?') {
            return confirm(message);
        }
        
        // API base URL - dynamically calculated
        const API_BASE = '<?php echo isset($api_base_path) ? $api_base_path : "../api/"; ?>';
        
        // Helper function for API calls
        async function apiCall(endpoint, method = 'GET', data = null) {
            try {
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                if (data && method !== 'GET') {
                    options.body = JSON.stringify(data);
                }
                
                const response = await fetch(API_BASE + endpoint, options);
                
                // Check if response is ok
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ 
                        success: false, 
                        message: `HTTP Error: ${response.status} ${response.statusText}` 
                    }));
                    return errorData;
                }
                
                const result = await response.json().catch(() => {
                    return { 
                        success: false, 
                        message: 'Invalid JSON response from server' 
                    };
                });
                
                return result;
            } catch (error) {
                console.error('API call error:', error);
                return {
                    success: false,
                    message: error.message || 'Network error. Please check your connection.'
                };
            }
        }
    </script>
</body>
</html>

