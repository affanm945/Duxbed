import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useProducts, useProductCategories, Product, ProductCategoryName } from '../hooks/useProducts';
import { API_BASE_URL, publicApiCall, API_ENDPOINTS } from '../config/api';

/** Resolve product image URL: relative paths (e.g. uploads/...) must load from API server, not frontend origin */
function resolveProductImageUrl(url: string | undefined): string {
    if (!url || !url.trim()) return '';
    const u = url.trim();
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    const path = u.startsWith('/') ? u.slice(1) : u;
    const base = API_BASE_URL.replace(/\/?$/, '');
    return `${base}/${path}`;
}

interface ProductPageLayoutProps {
    category: ProductCategoryName;
    defaultHeaderImage?: string;
}

type ContactDetails = {
    whatsapp_number?: string;
};

export default function ProductPageLayout({ category, defaultHeaderImage }: ProductPageLayoutProps) {
    const { products, loading: productsLoading } = useProducts(category);
    const { categories } = useProductCategories();
    const categoryData = categories.find(cat => cat.category_name === category);
    // Use static defaultHeaderImage first (local file from public/images/background), then API, then fallback
    const rawHeaderImage = defaultHeaderImage || categoryData?.header_image_url || `images/background/bc-${category.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    // Ensure root-relative URL so background image loads from public folder (e.g. /images/background/bc-dining.png)
    const headerImage = rawHeaderImage && !rawHeaderImage.startsWith('http') && !rawHeaderImage.startsWith('/')
        ? `/${rawHeaderImage}`
        : rawHeaderImage;
    
    const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);

    useEffect(() => {
        const fetchContactDetails = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.contactDetails.list);
                if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
                    setContactDetails(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching contact details for product page:', error);
            }
        };

        fetchContactDetails();
    }, []);

    const whatsappNumber = (contactDetails?.whatsapp_number || '+919188915976').trim();
    const whatsappNumberDigits = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappBaseUrl = `https://wa.me/${whatsappNumberDigits}`;

    // Group products by subcategory
    const productsBySubcategory = useMemo(() => {
        const grouped: { [key: string]: Product[] } = {};
        products.forEach(product => {
            const subcat = product.subcategory || 'Other';
            if (!grouped[subcat]) {
                grouped[subcat] = [];
            }
            grouped[subcat].push(product);
        });
        return grouped;
    }, [products]);
    
    // Get unique subcategories (include 'Other' when some products have no subcategory)
    const subcategories = useMemo(() => {
        const withOther = products.map(p => (p.subcategory && p.subcategory.trim()) ? p.subcategory.trim() : 'Other');
        return Array.from(new Set(withOther)).sort((a, b) => (a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)));
    }, [products]);

    useEffect(() => {
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".child-checkbox");
        const sections = document.querySelectorAll<HTMLElement>(".product-section");

        sections.forEach(section => {
            section.style.display = "block";
        });

        const handleChange = () => {
            const activeTargets = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.dataset.target);

            if (activeTargets.length === 0) {
                sections.forEach(section => {
                    section.style.display = "block";
                });
            } else {
                sections.forEach(section => {
                    const id = section.getAttribute("id");
                    if (activeTargets.includes(id || "")) {
                        section.style.display = "block";
                    } else {
                        section.style.display = "none";
                    }
                });
            }

            checkboxes.forEach(cb => {
                const label = cb.closest(".nav-link") as HTMLElement | null;
                if (cb.checked) {
                    label?.classList.add("active");
                } else {
                    label?.classList.remove("active");
                }
            });
        };

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", handleChange);
        });

        return () => {
            checkboxes.forEach(checkbox => {
                checkbox.removeEventListener("change", handleChange);
            });
        };
    }, [subcategories]);

    useEffect(() => {
        const handleModalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('modal') || target.classList.contains('modal-backdrop')) {
                const modal = target.closest('.modal') as HTMLElement;
                if (modal) {
                    const modalId = modal.id;
                    if ((window as any).bootstrap) {
                        const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
                        if (bootstrapModal) {
                            bootstrapModal.hide();
                        }
                    } else {
                        modal.classList.remove('show');
                        modal.style.display = 'none';
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        const backdrop = document.querySelector(`#modalBackdrop${modalId.replace('exampleModal', '')}`);
                        if (backdrop) {
                            backdrop.remove();
                        }
                    }
                }
            }
        };

        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show') as HTMLElement;
                if (openModal) {
                    const modalId = openModal.id;
                    if ((window as any).bootstrap) {
                        const bootstrapModal = (window as any).bootstrap.Modal.getInstance(openModal);
                        if (bootstrapModal) {
                            bootstrapModal.hide();
                        }
                    } else {
                        openModal.classList.remove('show');
                        openModal.style.display = 'none';
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        const backdrop = document.querySelector(`#modalBackdrop${modalId.replace('exampleModal', '')}`);
                        if (backdrop) {
                            backdrop.remove();
                        }
                    }
                }
            }
        };

        document.addEventListener('click', handleModalClick);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('click', handleModalClick);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    const ProductCard = ({ product }: { product: Product }) => {
        const id = product.id.toString();
        const thumbnail = resolveProductImageUrl(product.thumbnail_url);
        const name = product.name;
        const whatsappText = product.whatsapp_text || `Hi, I'm interested in this ${product.category} product:\nProduct: ${product.name}`;
        
        const handleZoomClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const modalElement = document.getElementById(`exampleModal${id}`);
            if (modalElement) {
                if ((window as any).bootstrap) {
                    const modal = new (window as any).bootstrap.Modal(modalElement, {
                        backdrop: true,
                        keyboard: true,
                        focus: true
                    });
                    modal.show();
                } else {
                    modalElement.classList.add('show');
                    modalElement.style.display = 'block';
                    modalElement.style.paddingRight = '0px';
                    document.body.classList.add('modal-open');
                    document.body.style.overflow = 'hidden';
                    document.body.style.paddingRight = '0px';
                    
                    let backdrop = document.getElementById(`modalBackdrop${id}`);
                    if (!backdrop) {
                        backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        backdrop.id = `modalBackdrop${id}`;
                        backdrop.style.position = 'fixed';
                        backdrop.style.top = '0';
                        backdrop.style.left = '0';
                        backdrop.style.zIndex = '1050';
                        backdrop.style.width = '100vw';
                        backdrop.style.height = '100vh';
                        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                        document.body.appendChild(backdrop);
                    }
                    
                    (modalElement as HTMLElement).style.zIndex = '1055';
                }
            }
        };

        return (
            <div className="col-lg-4 col-md-4 col-sm-6 m-b30 product-page-card-col">
                <div className="product-page-collection-card">
                    <div className="product-page-card-thumb">
                        <img alt={name} src={thumbnail} loading="lazy" />
                        <div className="product-page-card-actions">
                            <button
                                type="button"
                                className="product-page-card-btn product-page-card-btn-zoom"
                                onClick={handleZoomClick}
                                aria-label="Zoom in to view product"
                            >
                                <i className="bi bi-zoom-in"></i>
                            </button>
                            <a
                                href={`${whatsappBaseUrl}?text=${encodeURIComponent(whatsappText)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="product-page-card-btn product-page-card-btn-whatsapp"
                                aria-label="Contact via WhatsApp"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <i className="bi bi-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                    <div className="product-page-card-info">
                        <h3 className="product-page-card-title">
                            <a href="#" data-bs-toggle="modal" data-bs-target={`#exampleModal${id}`}>
                                {name}
                            </a>
                        </h3>
                    </div>
                </div>
            </div>
        );
    };

    const ProductModal = ({ product }: { product: Product }) => {
        const id = product.id.toString();
        const image = resolveProductImageUrl(product.full_image_url);
        const whatsappText = product.whatsapp_text || `Hi, I'm interested in this ${product.category} product:\nProduct: ${product.name}`;

        return (
            <div className="modal fade" id={`exampleModal${id}`} tabIndex={-1} role="dialog" aria-labelledby={`exampleModalLabel${id}`} aria-hidden="true" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document" style={{ maxWidth: '90%', margin: '30px auto' }}>
                    <div className="modal-content" style={{ border: 'none', borderRadius: '0', overflow: 'hidden' }}>
                        <div className="modal-bodyy" style={{ padding: 0, minHeight: '400px' }}>
                            {/* 1. Heading (product name) - first */}
                            {product.name && (
                                <div style={{ padding: '1rem 1.5rem 0.75rem', background: '#fff', borderBottom: '1px solid #eee' }}>
                                    <h2
                                        id={`exampleModalLabel${id}`}
                                        style={{
                                            fontFamily: 'Urbanist, sans-serif',
                                            fontSize: '1.4rem',
                                            fontWeight: 700,
                                            color: '#1a1a1a',
                                            margin: 0,
                                            paddingBottom: '0.5rem',
                                            borderBottom: '3px solid #E69B0A',
                                            display: 'inline-block',
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        {product.name}
                                    </h2>
                                </div>
                            )}
                            {/* 2. Image - second */}
                            <div style={{ width: '100%', background: '#fafafa', padding: '1rem 1.5rem' }}>
                                <img
                                    alt={product.name || 'Product'}
                                    src={image}
                                    loading="eager"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        maxWidth: '100%',
                                        maxHeight: '60vh',
                                        objectFit: 'contain',
                                        margin: '0 auto'
                                    }}
                                    onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.style.background = '#f0f0f0';
                                        img.alt = 'Image failed to load';
                                    }}
                                />
                            </div>
                            {/* 3. Description - third */}
                            {product.description && (
                                <div style={{ padding: '1rem 1.5rem', background: '#fff', borderTop: '1px solid #eee' }}>
                                    <p
                                        style={{
                                            fontSize: '0.95rem',
                                            lineHeight: 1.65,
                                            color: '#555',
                                            margin: 0
                                        }}
                                    >
                                        {product.description}
                                    </p>
                                </div>
                            )}
                            {/* 4. WhatsApp - last */}
                            <div style={{ padding: '1rem 1.5rem 1.25rem', background: '#f8f8f8', borderTop: '1px solid #e8e8e8', textAlign: 'right' }}>
                                <a
                                    href={`${whatsappBaseUrl}?text=${encodeURIComponent(whatsappText)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-success"
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    aria-label="Contact via WhatsApp"
                                >
                                    <i className="bi bi-whatsapp" style={{ fontSize: '1.2rem' }}></i>
                                    Contact on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="cursor" style={{ display: 'none' }}></div>
            <div className="cursor2" style={{ display: 'none' }}></div>

            <div className="page-wraper">
                <Header />

                <div className="page-content">
                    <div className="section-full get-intouch-style-2-wrap parallax-section" style={{ minHeight: '400px' }}>
                        <div
                            className="get-intouch-style-2 overlay-wraper p-t120 p-b120 parallax-image"
                            style={{
                                backgroundImage: headerImage ? `url("${headerImage}")` : undefined,
                                backgroundColor: '#3d3d3d',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center top'
                            }}
                        ></div>
                        <div className="get-intouch-style-2-inner site-text-white">
                            <h2 className="wt-title site-text-white title_split_anim">{category}</h2>
                            <div className="site-center-btn text-center"></div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90 product-page-main-section">
                        <div className="container custom-container">
                            <div className="row d-flex justify-content-center">
                                <div className="col-xl-3 col-lg-3 col-md-5 rightSidebar m-b30">
                                    <aside className="side-bar">
                                        <div className="widget widget_services p-a20">
                                            <div className="m-b30">
                                                <h4 className="widget-title">Categories</h4>
                                            </div>
                                            <ul>
                                                <li className="parent-category active" data-target="product-all">
                                                    <a href="#" className="parent-link">{category}</a><span className="badge"></span>
                                                    <ul className="child-category-list">
                                                        {subcategories.map((subcat, index) => {
                                                            const sectionId = `product-${index + 9}`;
                                                            return (
                                                                <li key={subcat} className="nav-item">
                                                                    <label className="nav-link checkbox-label">
                                                                        <input type="checkbox" className="child-checkbox" data-target={sectionId} />
                                                                        {subcat}
                                                                    </label>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </li>
                                                {[
                                                    { name: 'Space saving furniture', path: '/space-saving-furniture' },
                                                    { name: 'Duxpod', path: '/duxpod' },
                                                    { name: 'Interior designing', path: '/interior-designing' },
                                                    { name: 'Modular kitchen', path: '/modular-kitchen' }
                                                ].map(c => {
                                                    const path = c.name === 'Duxpod' ? '/duxpod' : c.path;
                                                    if (c.name === category) return null;
                                                    return (
                                                        <li key={path}><a href={path}>{c.name}</a><span className="badge"></span></li>
                                                    );
                                                })
                                                }
                                            </ul>
                                        </div>
                                    </aside>
                                </div>

                                <div className="col-xl-8 col-lg-8 col-md-7">
                                    <div className="wt-product-box-wrap product-page-collection-grid">
                                        {productsLoading ? (
                                            <div className="text-center p-5">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="tab-content jumb">
                                                {subcategories.length === 0 && products.length > 0 ? (
                                                    <div className="product-section padding-35-row-col">
                                                        <div className="row">
                                                            {products.map(product => (
                                                                <ProductCard key={product.id} product={product} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    subcategories.map((subcat, index) => {
                                                        const sectionId = `product-${index + 9}`;
                                                        const subcatProducts = productsBySubcategory[subcat] || [];
                                                        return (
                                                            <div key={subcat} id={sectionId} className="tab-pane product-section padding-35-row-col">
                                            <div className="row">
                                                                    <h2 className="wt-title title_split_anim product-page-subcat-title" style={{ color: '#E69B0A', fontSize: '30px', fontFamily: 'Urbanist', marginBottom: '22px' }}>
                                                                        {subcat}
                                                                    </h2>
                                                                    {subcatProducts.length > 0 ? (
                                                                        subcatProducts.map(product => (
                                                                            <ProductCard key={product.id} product={product} />
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-muted">No products in this subcategory.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                {products.length === 0 && !productsLoading && (
                                                    <div className="alert alert-info">No products available in this category.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />

                <button className="scroltop" aria-label="Scroll to top">
                    <span className="bi bi-chevron-up relative" id="btn-vibrate"></span>
                </button>
            </div>

            {products.map(product => (
                <ProductModal key={product.id} product={product} />
            ))}

            <style>{`
                /* Product page: light grey background */
                .product-page-main-section {
                    background: #e8e8e8;
                }

                /* Sidebar Categories - accent with #E69B0A */
                .product-page-main-section .widget-title {
                    border-left: 4px solid #E69B0A;
                    padding-left: 12px;
                    color: #1a1a1a;
                }
                .product-page-main-section .nav-link.active,
                .product-page-main-section .checkbox-label:hover {
                    color: #E69B0A !important;
                    font-weight: 600;
                }
                .product-page-main-section .child-category-list .nav-link.active::before {
                    content: '';
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background: #E69B0A;
                    border-radius: 50%;
                    margin-right: 8px;
                    vertical-align: middle;
                }

                /* Product page cards - light grey background */
                .product-page-collection-grid {
                    position: relative;
                    padding: 26px 18px 30px;
                    border-radius: 22px;
                    background: #e8e8e8;
                    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                }
                .product-page-collection-grid::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 20px;
                    right: 20px;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
                    border-radius: 0 0 22px 22px;
                    opacity: 0.6;
                }

                /* Subcategory title with #E69B0A underline accent */
                .product-page-subcat-title {
                    position: relative;
                    padding-bottom: 10px;
                }
                .product-page-subcat-title::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 60px;
                    height: 4px;
                    background: #E69B0A;
                    border-radius: 2px;
                }

                .product-page-card-col {
                    display: flex;
                }

                .product-page-collection-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    border-radius: 22px;
                    overflow: hidden;
                    background-color: #E69B0A;
                    box-shadow: 0 10px 30px rgba(230, 155, 10, 0.35);
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    border: 2px solid rgba(199, 133, 9, 0.6);
                }

                .product-page-collection-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #c78509, #E69B0A, #f0b429);
                    z-index: 2;
                    border-radius: 22px 22px 0 0;
                }

                .product-page-collection-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 18px 42px rgba(230, 155, 10, 0.45);
                }

                .product-page-card-thumb {
                    position: relative;
                    border-radius: 22px 22px 0 0;
                    overflow: hidden;
                    border-bottom: 3px solid rgba(199, 133, 9, 0.7);
                }

                .product-page-card-thumb img {
                    display: block;
                    width: 100%;
                    height: 180px;
                    object-fit: cover;
                    transform-origin: center;
                    transition: transform 0.45s ease;
                }

                .product-page-collection-card:hover .product-page-card-thumb img {
                    transform: scale(1.04);
                }

                .product-page-card-actions {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 5;
                }

                .product-page-card-btn {
                    width: 35px;
                    height: 31px;
                    border-radius: 50%;
                    border: none;
                    background-color: #ffffff;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    text-decoration: none;
                }

                .product-page-card-btn:hover {
                    transform: scale(1.08);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                }

                .product-page-card-btn-zoom i {
                    color: #010101;
                    font-size: 1rem;
                }

                .product-page-card-btn-whatsapp i {
                    color: #25D366;
                    font-size: 1.1rem;
                }

                .product-page-card-info {
                    padding: 14px 18px 16px;
                    text-align: center;
                    background: #E69B0A;
                    border-radius: 0 0 22px 22px;
                    border-top: 2px solid rgba(199, 133, 9, 0.8);
                }

                .product-page-card-title {
                    margin: 0;
                    line-height: 1.3;
                    font-family: 'Urbanist', sans-serif;
                    font-weight: 600;
                    font-size: 15px;
                    color: #1a1a1a;
                    text-transform: capitalize;
                }

                .product-page-card-title a {
                    color: #1a1a1a;
                    text-decoration: none;
                }

                .product-page-card-title a:hover {
                    color: #fff;
                }

                .product-page-card-title a::first-letter {
                    text-transform: uppercase;
                }

                /* Hover state: slightly darker yellow, title goes white */
                .product-page-collection-card:hover .product-page-card-info {
                    background: #d48d09;
                }

                .product-page-collection-card:hover .product-page-card-title,
                .product-page-collection-card:hover .product-page-card-title a {
                    color: #fff;
                }

                @media (max-width: 991.98px) {
                    .product-page-collection-grid {
                        padding: 20px 12px 24px;
                        border-radius: 20px;
                    }

                    .product-page-collection-card {
                        border-radius: 18px;
                    }

                    .product-page-card-thumb {
                        border-radius: 18px 18px 0 0;
                    }
                }
            `}</style>
        </>
    );
}
