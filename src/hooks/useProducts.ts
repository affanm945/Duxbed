import { useState, useEffect } from 'react';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

export type ProductCategoryName = 'Space saving furniture' | 'Duxpod' | 'Interior designing' | 'Modular kitchen';

export interface Product {
    id: number;
    category: ProductCategoryName;
    subcategory?: string;
    name: string;
    thumbnail_url: string;
    full_image_url: string;
    whatsapp_text?: string;
    description?: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductCategory {
    id: number;
    category_name: ProductCategoryName;
    header_image_url?: string;
    description?: string;
    is_active: boolean;
    display_order: number;
}

/** Fetches products from API: GET products/list.php?category=...&active_only=true (see src/config/api.ts API_ENDPOINTS.products) */
export function useProducts(category?: string, subcategory?: string) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let url = API_ENDPOINTS.products.list;
                const params = new URLSearchParams();
                if (category) params.append('category', category);
                if (subcategory) params.append('subcategory', subcategory);
                params.append('active_only', 'true');
                
                if (params.toString()) {
                    url += '?' + params.toString();
                }
                
                const response = await publicApiCall(url);
                
                if (response.success && response.data) {
                    // Sort by display_order ascending (0, 1, 2, ...) so backend priority is reflected
                    const sorted = [...response.data].sort(
                        (a: Product, b: Product) => (a.display_order ?? 0) - (b.display_order ?? 0)
                    );
                    setProducts(sorted);
                } else {
                    setError('Failed to fetch products');
                    setProducts([]);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, subcategory]);

    return { products, loading, error };
}

/** Fetches product categories (for banner images etc.) from API: GET products/categories.php (see src/config/api.ts) */
export function useProductCategories() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await publicApiCall(API_ENDPOINTS.products.categories);
                
                if (response.success && response.data) {
                    setCategories(response.data);
                } else {
                    setError('Failed to fetch categories');
                    setCategories([]);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories');
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}
