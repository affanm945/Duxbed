import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

interface MediaItem {
    id: number;
    type: 'news' | 'event' | 'award';
    title: string;
    description: string | null;
    content: string | null;
    image_url: string | null;
    video_url: string | null;
    event_date: string | null;
    created_at: string;
    date: string;
    image: string;
}

export default function Media() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [newsItems, setNewsItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch media items from API
    useEffect(() => {
        const fetchMedia = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (activeFilter !== 'all') {
                    params.append('type', activeFilter);
                }
                
                const response = await publicApiCall(`${API_ENDPOINTS.media.list}?${params.toString()}`, 'GET');
                if (response.success) {
                    const items = response.data.map((item: any) => ({
                        ...item,
                        date: item.event_date || item.created_at,
                        image: item.image_url || 'images/about2/about-section.png'
                    }));
                    setNewsItems(items);
                }
            } catch (error) {
                console.error('Error fetching media:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchMedia();
    }, [activeFilter]);

    // Sort and filter items
    const filteredItems = useMemo(() => {
        let items = [...newsItems];
        
        // Sort by date
        items.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        
        return items;
    }, [newsItems, sortOrder]);

    const handleReadMore = (item: MediaItem) => {
        // Use Bootstrap modal if available
        const modalElement = document.getElementById(`mediaModal${item.id}`);
        if (modalElement && (window as any).bootstrap) {
            try {
                let modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
                if (!modalInstance) {
                    modalInstance = new (window as any).bootstrap.Modal(modalElement, {
                        backdrop: true,
                        keyboard: true,
                        focus: true
                    });
                }
                modalInstance.show();
            } catch (error) {
                console.error('Error showing modal:', error);
                // Fallback to manual modal
                showModalManually(modalElement, item.id);
            }
        } else if (modalElement) {
            showModalManually(modalElement, item.id);
        }
    };

    const showModalManually = (modalElement: HTMLElement, modalId: number) => {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        modalElement.style.paddingRight = '0px';
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';

        // Create backdrop
        let backdrop = document.getElementById(`mediaModalBackdrop${modalId}`);
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.id = `mediaModalBackdrop${modalId}`;
            backdrop.style.position = 'fixed';
            backdrop.style.top = '0';
            backdrop.style.left = '0';
            backdrop.style.zIndex = '1050';
            backdrop.style.width = '100vw';
            backdrop.style.height = '100vh';
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            document.body.appendChild(backdrop);
            
            backdrop.addEventListener('click', () => {
                closeModal(modalElement, modalId);
            });
        }

        modalElement.style.zIndex = '1055';
    };

    const closeModal = (modalElement: HTMLElement, modalId: number) => {
        if ((window as any).bootstrap) {
            try {
                const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            } catch (error) {
                // Fallback
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
            }
        } else {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
        }
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        const backdrop = document.getElementById(`mediaModalBackdrop${modalId}`);
        if (backdrop) {
            backdrop.remove();
        }
    };

    return (
        <>
            <div className="page-wraper">
                <Header />

                <div className="page-content">
                    <div className="wt-bnr-inr overlay-wraper bg-center">
                        <div className="overlay-main innr-bnr-olay"></div>
                        <div className="wt-bnr-inr-entry">
                            <div className="banner-title-outer">
                                <div className="banner-title-name">
                                    <h2 className="wt-title" style={{ color: '#010101' }}>Media</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Latest Updates</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>News and Events</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    Stay updated with the latest news, events and announcements from Duxbed.
                                </p>
                            </div>

                            <div className="project-filter-wrap text-center mt-5 mb-5">
                                <div className="d-flex justify-content-center align-items-center flex-wrap gap-3 mb-4">
                                    <span
                                        data-filter="all"
                                        onClick={() => setActiveFilter('all')}
                                        className={activeFilter === 'all' ? 'active' : ''}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '10px 20px',
                                            margin: '0 5px',
                                            borderRadius: '5px',
                                            color: activeFilter === 'all' ? 'rgb(255 255 255)' : '#A6A6A6',
                                            backgroundColor: activeFilter === 'all' ? 'rgb(230, 155, 10)' : 'transparent',
                                            border: '1px solid ' + (activeFilter === 'all' ? 'rgb(230, 155, 10)' : '#e0e0e0'),
                                            display: 'inline-block',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        All
                                    </span>
                                    <span
                                        data-filter="news"
                                        onClick={() => setActiveFilter('news')}
                                        className={activeFilter === 'news' ? 'active' : ''}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '10px 20px',
                                            margin: '0 5px',
                                            borderRadius: '5px',
                                            color: activeFilter === 'news' ? 'rgb(255 255 255)' : '#A6A6A6',
                                            backgroundColor: activeFilter === 'news' ? 'rgb(230, 155, 10)' : 'transparent',
                                            border: '1px solid ' + (activeFilter === 'news' ? 'rgb(230, 155, 10)' : '#e0e0e0'),
                                            display: 'inline-block',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        News
                                    </span>
                                    <span
                                        data-filter="event"
                                        onClick={() => setActiveFilter('event')}
                                        className={activeFilter === 'event' ? 'active' : ''}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '10px 20px',
                                            margin: '0 5px',
                                            borderRadius: '5px',
                                            color: activeFilter === 'event' ? 'rgb(255 255 255)' : '#A6A6A6',
                                            backgroundColor: activeFilter === 'event' ? 'rgb(230, 155, 10)' : 'transparent',
                                            border: '1px solid ' + (activeFilter === 'event' ? 'rgb(230, 155, 10)' : '#e0e0e0'),
                                            display: 'inline-block',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Events
                                    </span>
                                    {/* <span
                                        data-filter="award"
                                        onClick={() => setActiveFilter('award')}
                                        className={activeFilter === 'award' ? 'active' : ''}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '10px 20px',
                                            margin: '0 5px',
                                            borderRadius: '5px',
                                            color: activeFilter === 'award' ? 'rgb(255 255 255)' : '#A6A6A6',
                                            backgroundColor: activeFilter === 'award' ? 'rgb(230, 155, 10)' : 'transparent',
                                            border: '1px solid ' + (activeFilter === 'award' ? 'rgb(230, 155, 10)' : '#e0e0e0'),
                                            display: 'inline-block',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Awards
                                    </span> */}
                                </div>
                                <div className="d-flex justify-content-center align-items-center gap-3">
                                    <label htmlFor="sortOrder" style={{ color: '#666', margin: 0 }}>Sort by:</label>
                                    <select
                                        id="sortOrder"
                                        className="form-select"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                        style={{
                                            width: 'auto',
                                            minWidth: '150px',
                                            borderColor: '#E69B0A',
                                            borderRadius: '5px',
                                            padding: '8px 15px'
                                        }}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>
                            </div>

                            <div className="section-content">
                                {loading ? (
                                    <div className="text-center p-5">
                                        <div className="spinner-border text-primary" role="status" style={{ color: '#E69B0A' }}>
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3" style={{ color: '#666' }}>Loading media items...</p>
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="text-center p-5">
                                        <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#A6A6A6', marginBottom: '20px' }}></i>
                                        <h4 style={{ color: '#666', marginBottom: '10px' }}>No media items found</h4>
                                        <p style={{ color: '#A6A6A6' }}>
                                            {activeFilter !== 'all' 
                                                ? `No ${activeFilter} items available at the moment.` 
                                                : 'No media items available at the moment.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {filteredItems.map((item) => (
                                            <div key={item.id} className="col-lg-4 col-md-6 m-b30">
                                                <div className="media-item" style={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderRadius: '10px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                    transition: 'transform 0.3s ease',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                                                }}
                                                >
                                                    <div className="media-image" style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        overflow: 'hidden',
                                                        position: 'relative'
                                                    }}>
                                                        {item.video_url ? (
                                                            <div style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: '#000',
                                                                position: 'relative'
                                                            }}>
                                                                <i className="bi bi-play-circle-fill" style={{
                                                                    fontSize: '48px',
                                                                    color: '#E69B0A',
                                                                    zIndex: 2
                                                                }}></i>
                                                                <img 
                                                                    src={item.image} 
                                                                    alt={item.title}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        opacity: 0.7
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.title}
                                                                onError={(e) => {
                                                                    const img = e.target as HTMLImageElement;
                                                                    img.src = 'images/about2/about-section.png';
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="media-content" style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            marginBottom: '15px'
                                                        }}>
                                                            <span style={{
                                                                padding: '5px 15px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                textTransform: 'uppercase',
                                                                backgroundColor: '#E69B0A',
                                                                color: '#FFFFFF'
                                                            }}>
                                                                {item.type}
                                                            </span>
                                                            <span style={{ color: '#A6A6A6', fontSize: '14px' }}>
                                                                {formatDate(item.date)}
                                                            </span>
                                                        </div>
                                                        <h4 style={{ 
                                                            color: '#010101', 
                                                            marginBottom: '15px',
                                                            fontSize: '20px',
                                                            lineHeight: '1.4',
                                                            minHeight: '56px'
                                                        }}>
                                                            {item.title}
                                                        </h4>
                                                        <p style={{ 
                                                            color: '#666', 
                                                            fontSize: '14px',
                                                            lineHeight: '1.6',
                                                            marginBottom: '15px',
                                                            flex: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical'
                                                        }}>
                                                            {item.description || item.content || 'No description available.'}
                                                        </p>
                                                        <a 
                                                            href="#!" 
                                                            className="site-button-link mt-auto"
                                                            style={{ color: '#E69B0A', cursor: 'pointer' }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleReadMore(item);
                                                            }}
                                                        >
                                                            Read More <i className="bi bi-arrow-right ms-1"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />

                <button className="scroltop" aria-label="Scroll to top">
                    <span className="bi bi-chevron-up relative" id="btn-vibrate"></span>
                </button>
            </div>

            {/* Media Item Modals */}
            {filteredItems.map((item) => (
                <MediaModal key={item.id} item={item} onClose={() => closeModal(document.getElementById(`mediaModal${item.id}`) as HTMLElement, item.id)} />
            ))}
        </>
    );
}

// Media Modal Component
const MediaModal = ({ item, onClose }: { item: MediaItem; onClose: () => void }) => {
    const id = item.id.toString();
    const isYouTube = item.video_url && (item.video_url.includes('youtube.com') || item.video_url.includes('youtu.be'));
    const isVimeo = item.video_url && item.video_url.includes('vimeo.com');

    const getVideoEmbedUrl = () => {
        if (!item.video_url) return null;
        if (isYouTube) {
            let videoId = '';
            if (item.video_url.includes('youtu.be/')) {
                videoId = item.video_url.split('youtu.be/')[1].split('?')[0];
            } else if (item.video_url.includes('youtube.com/watch?v=')) {
                videoId = item.video_url.split('watch?v=')[1].split('&')[0];
            } else if (item.video_url.includes('youtube.com/embed/')) {
                return item.video_url;
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
        if (isVimeo) {
            const videoId = item.video_url.split('vimeo.com/')[1].split('?')[0];
            return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
        }
        return item.video_url; // Direct video URL
    };

    useEffect(() => {
        const modalElement = document.getElementById(`mediaModal${id}`);
        if (modalElement) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target as HTMLElement;
                        if (target.classList.contains('show')) {
                            // Force reload video if available
                            const videoIframe = target.querySelector('iframe');
                            if (videoIframe) {
                                const currentSrc = videoIframe.src;
                                videoIframe.src = '';
                                setTimeout(() => {
                                    videoIframe.src = currentSrc;
                                }, 100);
                            }
                        }
                    }
                });
            });
            observer.observe(modalElement, { attributes: true });
            return () => observer.disconnect();
        }
    }, [id]);

    return (
        <div className="modal fade" id={`mediaModal${id}`} tabIndex={-1} role="dialog" aria-labelledby={`mediaModalLabel${id}`} aria-hidden="true" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" role="document" style={{ maxWidth: '90%', margin: '30px auto' }}>
                <div className="modal-content" style={{ border: 'none', borderRadius: '10px', overflow: 'hidden' }}>
                    <div className="modal-header" style={{ borderBottom: '1px solid #e0e0e0', padding: '20px 30px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                <span style={{
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    backgroundColor: '#E69B0A',
                                    color: '#FFFFFF'
                                }}>
                                    {item.type}
                                </span>
                                <span style={{ color: '#A6A6A6', fontSize: '14px' }}>
                                    {formatDate(item.date)}
                                </span>
                            </div>
                            <h5 className="modal-title" id={`mediaModalLabel${id}`} style={{ color: '#010101', fontSize: '24px', margin: 0 }}>
                                {item.title}
                            </h5>
                        </div>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onClose}
                            aria-label="Close"
                            style={{ fontSize: '20px' }}
                        ></button>
                    </div>
                    <div className="modal-body" style={{ padding: '30px' }}>
                        {/* Video or Image */}
                        {(item.video_url || item.image_url) && (
                            <div style={{ marginBottom: '30px', borderRadius: '10px', overflow: 'hidden' }}>
                                {item.video_url ? (
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        paddingBottom: '56.25%', // 16:9 aspect ratio
                                        height: 0,
                                        backgroundColor: '#000'
                                    }}>
                                        <iframe
                                            src={getVideoEmbedUrl() || ''}
                                            title={item.title}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 'none'
                                            }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <img
                                        src={item.image_url || item.image}
                                        alt={item.title}
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.src = 'images/about2/about-section.png';
                                        }}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '500px',
                                            objectFit: 'contain',
                                            display: 'block',
                                            margin: '0 auto'
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {/* Description */}
                        {item.description && (
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.8', fontStyle: 'italic' }}>
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {/* Full Content */}
                        {item.content && (
                            <div style={{ 
                                color: '#010101', 
                                fontSize: '16px', 
                                lineHeight: '1.8',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}>
                                {item.content}
                            </div>
                        )}

                        {!item.content && !item.description && (
                            <p style={{ color: '#A6A6A6', fontStyle: 'italic' }}>No additional content available.</p>
                        )}
                    </div>
                    <div className="modal-footer" style={{ borderTop: '1px solid #e0e0e0', padding: '15px 30px' }}>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onClose}
                            style={{
                                background: 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)',
                                border: 'none',
                                color: '#FFFFFF',
                                padding: '10px 25px',
                                borderRadius: '5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(230, 155, 10, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to format dates
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

