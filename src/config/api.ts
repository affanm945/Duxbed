/**
 * API Configuration
 * Centralized API endpoint configuration
 *
 * Local dev:  npm run dev + backend on port 8000 → use http://localhost:8000/api/
 * Production: Set VITE_API_BASE_URL in .env.production (e.g. https://1xs.43c.mytemp.website/api/backend/)
 *             Then run: npm run build
 */
const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
// export const API_BASE_URL = import.meta.env.DEV
//     ? (apiBase ? apiBase.replace(/\/?$/, '/') : 'http://localhost:8000/api/')
//     : (apiBase ? apiBase.replace(/\/?$/, '/') : 'http://localhost:8000/api/');
export const API_BASE_URL = import.meta.env.DEV ? '/api/' : (apiBase ? apiBase.replace(/\/?$/, '/') : 'https://localhost:8000/api/');

export async function apiCall(endpoint: string, method: string = 'GET', data?: any, isPublic: boolean = false): Promise<any> {
    const url = API_BASE_URL + endpoint.replace(/^\//, '');
    
    const options: RequestInit = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (!isPublic) {
        options.credentials = 'include';
    }

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        if (import.meta.env.DEV) {
            console.log('Making API call to:', url);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();

            if (import.meta.env.DEV) {
                console.error('API response error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
            }

            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();

        if (import.meta.env.DEV) {
            console.log('API call successful:', url);
        }

        return data;
    } catch (error: any) {
        if (import.meta.env.DEV) {
            console.error('API call error:', {
                url,
                method,
                error: error?.message,
                stack: error?.stack
            });
        }
        
        // Provide more helpful error messages
        if (error?.message === 'Failed to fetch') {
            const helpfulError = new Error(
                `Failed to connect to API at ${url}. Please check:\n` +
                `1. Is the backend server running?\n` +
                `2. Is the API endpoint correct? (${endpoint})\n` +
                `3. Are there any CORS issues? (see backend config)\n` +
                `4. Check browser console (F12 → Network) for status (404, 500, CORS)`
            );
            helpfulError.name = 'NetworkError';
            throw helpfulError;
        }
        
        throw error;
    }
}

// Public API calls (no authentication required)
export const publicApiCall = (endpoint: string, method: string = 'GET', data?: any) => {
    return apiCall(endpoint, method, data, true);
};

// Helper for file uploads
export async function uploadFile(file: File, endpoint: string = 'upload/image.php', type: string = 'general'): Promise<any> {
    const url = API_BASE_URL + endpoint.replace(/^\//, '');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Upload error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
}

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    auth: {
        login: 'auth/login.php',
        logout: 'auth/logout.php',
        check: 'auth/check.php',
    },
    // Homepage
    homepage: {
        videos: 'homepage/videos.php',
    },
    // Projects
    projects: {
        list: 'projects/list.php',
        create: 'projects/create.php',
        update: 'projects/update.php',
        delete: 'projects/delete.php',
    },
    // Media
    media: {
        list: 'media/list.php',
        create: 'media/create.php',
        update: 'media/update.php',
        delete: 'media/delete.php',
    },
    // Careers
    careers: {
        jobs: 'careers/jobs.php',
        applications: 'careers/applications.php',
        submit: 'careers/submit.php',
    },
    // Locations
    locations: {
        list: 'locations/list.php',
    },
    // Orders
    orders: {
        track: 'orders/track.php',
    },
    // Partnership
    partnership: {
        eligibleDistricts: 'partnership/eligible-districts.php',
        checkEligibility: 'partnership/check-eligibility.php',
        submit: 'partnership/submit.php',
    },
    // Testimonials
    testimonials: {
        list: 'testimonials/list.php',
    },
    // Content Management
    content: {
        aboutUs: 'content/about-us.php',
        storyTimeline: 'content/story-timeline.php',
        leadership: 'content/leadership.php',
        whyDuxbed: 'content/why-duxbed.php',
    },
    // Upload
    upload: {
        image: 'upload/image.php',
        document: 'upload/document.php',
    },
    // Brochures
    brochures: {
        list: 'brochures/list.php',
        download: 'brochures/download.php',
    },
    // Contact
    contact: {
        submit: 'contact/submit.php',
    },
    // Contact Details
    contactDetails: {
        list: 'contact-details/list.php',
    },
    // Products
    products: {
        list: 'products/list.php',
        categories: 'products/categories.php',
    },
};