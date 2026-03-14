import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, NavLink } from "react-router-dom";
import { publicApiCall, API_ENDPOINTS, API_BASE_URL } from '../config/api';

const testimonialsCarouselInitialized = { current: false };

export default function Index() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [galleryModal, setGalleryModal] = useState<{ isOpen: boolean; images: string[]; currentIndex: number; title: string }>({
        isOpen: false,
        images: [],
        currentIndex: 0,
        title: ''
    });
    const [homepageVideos, setHomepageVideos] = useState<any[]>([]);
    const [premiumProjects, setPremiumProjects] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [homepageLeadership, setHomepageLeadership] = useState<any[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const heroVideoRef = useRef<HTMLVideoElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const extractYouTubeId = (url: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const normalizeVideoUrl = (url?: string): string | undefined => {
        if (!url) return undefined;

        // If the URL points to our backend uploads/videos folder, route it
        // through the streaming endpoint so we control Range / Accept-Ranges.
        const uploadsPattern = /\/uploads\/videos\//;
        if (uploadsPattern.test(url)) {
            try {
                const parsed = new URL(url, window.location.origin);
                const uploadsIndex = parsed.pathname.indexOf('/uploads/');
                const relativeFromUploads = parsed.pathname.slice(uploadsIndex + '/uploads/'.length);
                const streamUrl = `${API_BASE_URL}stream-video.php?file=${encodeURIComponent(relativeFromUploads)}`;
                return streamUrl;
            } catch {
                // If URL constructor fails, fall back to simple string handling
                const cleaned = url.replace(/^https?:\/\/[^/]+/, '');
                const fromUploads = cleaned.replace(/^\/?uploads\//, '');
                const streamUrl = `${API_BASE_URL}stream-video.php?file=${encodeURIComponent(fromUploads)}`;
                return streamUrl;
            }
        }

        try {
            const parsed = new URL(url, window.location.origin);

            // In production, upgrade http → https to avoid mixed-content issues.
            // In development (localhost), keep the original protocol so http://localhost:8000 works.
            if (import.meta.env.PROD && parsed.protocol === 'http:') {
                parsed.protocol = 'https:';
            }

            return parsed.toString();
        } catch {
            if (import.meta.env.PROD && url.startsWith('http://')) {
                return `https://${url.slice(7)}`;
            }
            return url;
        }
    };

    const getShortLeadershipBio = (bio?: string) => {
        if (!bio) return '';
        const maxLength = 140;
        if (bio.length <= maxLength) return bio;
        return bio.slice(0, maxLength).trimEnd() + '...';
    };

    const getLeaderSlug = (leader: { id?: string | number; name?: string }, index: number) => {
        if (leader.id != null) return String(leader.id);
        const slug = (leader.name || '')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        return slug || String(index);
    };

    // Simple splash loader: show Duxbed logo until first load completes or timeout hits
    useEffect(() => {
        const handleLoad = () => {
            setIsPageLoading(false);
        };

        if (document.readyState === 'complete') {
            setIsPageLoading(false);
        } else {
            window.addEventListener('load', handleLoad);
        }

        // Safety timeout: at most 10 seconds
        const timeoutId = window.setTimeout(() => {
            setIsPageLoading(false);
        }, 10000);

        return () => {
            window.removeEventListener('load', handleLoad);
            clearTimeout(timeoutId);
        };
    }, []);

    // Detect touch / mobile-like devices (used to adjust video behaviour)
    useEffect(() => {
        try {
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            setIsTouchDevice(hasTouch);
        } catch {
            setIsTouchDevice(false);
        }
    }, []);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.homepage.videos);

                if (response && response.success && response.data) {
                    setHomepageVideos(response.data);
                } else {
                    console.warn('No videos found or API error:', response);
                }
            } catch (error) {
                console.error('Error fetching homepage videos:', error);
            }
        };
        fetchVideos();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.projects.list);

                if (response && response.success && response.data) {
                    setPremiumProjects(response.data);
                } else {
                    console.warn('No projects found or API error:', response);
                }
            } catch (error) {
                console.error('Error fetching premium projects:', error);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const endpoint = API_ENDPOINTS.testimonials.list + '?type_id=1';
                const fullUrl = API_BASE_URL + endpoint.replace(/^\//, '');

                if (import.meta.env.DEV) {
                    console.log('Fetching client testimonials from:', endpoint);
                    console.log('Full URL:', fullUrl);
                }

                const response = await publicApiCall(endpoint, 'GET');

                if (import.meta.env.DEV) {
                    console.log('Testimonials API response:', response);
                }

                if (response && response.success !== false) {
                    const testimonialsData = response.data || response;

                    if (import.meta.env.DEV) {
                        console.log('Testimonials data extracted:', testimonialsData);
                        console.log('Is array?', Array.isArray(testimonialsData));
                    }

                    if (Array.isArray(testimonialsData)) {
                        setTestimonials(testimonialsData);

                        if (import.meta.env.DEV) {
                            console.log('Testimonials state updated with', testimonialsData.length, 'items');
                        }
                    } else if (testimonialsData && Array.isArray(testimonialsData.testimonials)) {
                        setTestimonials(testimonialsData.testimonials);
                    } else {
                        if (import.meta.env.DEV) {
                            console.warn('Unexpected testimonials response format:', response);
                        }
                        setTestimonials([]);
                    }
                } else {
                    if (import.meta.env.DEV) {
                        console.warn('Testimonials API returned error:', response);
                    }
                    setTestimonials([]);
                }
            } catch (error: any) {
                if (import.meta.env.DEV) {
                    console.error('Error fetching testimonials:', error);
                    console.error('Error details:', {
                        message: error?.message,
                        stack: error?.stack,
                        response: error?.response
                    });
                }
                setTestimonials([]);
            }
        };
        fetchTestimonials();
    }, []);

    useEffect(() => {
        const fetchLeadership = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.content.leadership);

                if (response && response.success && response.data && Array.isArray(response.data)) {
                    setHomepageLeadership(response.data.slice(0, 4));
                } else if (Array.isArray(response)) {
                    setHomepageLeadership(response.slice(0, 4));
                } else {
                    // Fallback static data
                    setHomepageLeadership([
                        {
                            name: 'Leadership Member 1',
                            position: 'Chairman',
                            image_url: 'images/testimonials/testi4.png',
                            bio: 'Providing strategic vision and guiding the overall direction of Duxbed.'
                        },
                        {
                            name: 'Leadership Member 2',
                            position: 'Director',
                            image_url: 'images/testimonials/testi4.png',
                            bio: 'Driving growth and ensuring operational excellence across all departments.'
                        },
                        {
                            name: 'Leadership Member 3',
                            position: 'CEO',
                            image_url: 'images/testimonials/testi4.png',
                            bio: 'Leading Duxbed with a customer-first mindset and commitment to quality.'
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching homepage leadership:', error);
            }
        };

        fetchLeadership();
    }, []);

    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('Testimonials useEffect triggered, testimonials.length:', testimonials.length);
        }
        if (testimonials.length === 0) {
            return;
        }

        let carouselInstance: any = null;
        let timeoutId: ReturnType<typeof setTimeout>;
        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 50;

        const initTestimonialCarousel = () => {
            if (!isMounted) return;

            if (typeof window === 'undefined' || !(window as any).jQuery || !(window as any).jQuery.fn.owlCarousel) {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutId = setTimeout(initTestimonialCarousel, 100);
                } else {
                    console.error('jQuery or OwlCarousel not available after max retries');
                }
                return;
            }

            const $ = (window as any).jQuery;
            let carouselElement = $('.testimonial-1-content[data-react-carousel="true"]');
            if (!carouselElement.length) {
                carouselElement = $('.testimonial-1-content');
            }

            if (import.meta.env.DEV) {
                console.log('Carousel element found:', carouselElement.length, 'elements');
            }
            if (!isMounted || !carouselElement.length) {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutId = setTimeout(initTestimonialCarousel, 100);
                }
                return;
            }
            carouselElement.attr('data-react-carousel', 'true');

            if (carouselElement.data('owl.carousel') && testimonialsCarouselInitialized.current) {
                if (import.meta.env.DEV) {
                    console.log('Carousel already initialized, skipping re-initialization');
                }
                return;
            }

            try {
                carouselInstance = carouselElement.owlCarousel({
                    loop: testimonials.length > 1,
                    margin: 30,
                    nav: false,
                    dots: false,
                    autoplay: testimonials.length > 1,
                    autoplayTimeout: 5000,
                    responsive: {
                        0: { items: 1 },
                        768: { items: 1 },
                        992: { items: 1 },
                        1200: { items: 1 }
                    }
                });
                testimonialsCarouselInitialized.current = true;
                if (import.meta.env.DEV) {
                    console.log('OwlCarousel initialized successfully');
                }
            } catch (error) {
                console.error('Error initializing testimonial carousel:', error);
            }
        };

        timeoutId = setTimeout(initTestimonialCarousel, 300);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [testimonials.length]);

    useEffect(() => {
        let carouselInstance: any = null;
        let timeoutId: ReturnType<typeof setTimeout>;
        let retryCount = 0;
        const maxRetries = 50;
        let isMounted = true;

        const initClientCarousel = () => {
            if (!isMounted) return;

            if (typeof window === 'undefined' || !(window as any).Swiper) {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutId = setTimeout(initClientCarousel, 100);
                }
                return;
            }

            const Swiper = (window as any).Swiper;
            const carouselElement = document.querySelector('.home-client-carousel') as HTMLElement;

            if (!isMounted || !carouselElement) {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutId = setTimeout(initClientCarousel, 100);
                }
                return;
            }

            carouselElement.setAttribute('data-react-carousel', 'true');

            const wrapper = carouselElement.querySelector('.swiper-wrapper');
            if (!wrapper || !wrapper.children.length) {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutId = setTimeout(initClientCarousel, 100);
                }
                return;
            }

            if ((carouselElement as any).swiper) {
                try {
                    const existingSwiper = (carouselElement as any).swiper;
                    if (existingSwiper.autoplay) {
                        existingSwiper.autoplay.stop();
                    }
                    existingSwiper.destroy(true, true);
                } catch (e) {
                }
                (carouselElement as any).swiper = null;
            }

            try {
                carouselInstance = new Swiper(carouselElement, {
                    modules: [],
                    slidesPerView: 1,
                    spaceBetween: 5,
                    loop: true,
                    autoplay: {
                        delay: 1500,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: false,
                    },
                    speed: 600,
                    grabCursor: true,
                    watchSlidesProgress: true,
                    breakpoints: {
                        0: {
                            slidesPerView: 2,
                        },
                        480: {
                            slidesPerView: 3,
                        },
                        767: {
                            slidesPerView: 4,
                        },
                        1000: {
                            slidesPerView: 6,
                        },
                    },
                });

                (carouselElement as any).swiper = carouselInstance;

                if (carouselInstance && carouselInstance.autoplay) {
                    carouselInstance.autoplay.start();

                    setTimeout(() => {
                        if (carouselInstance && carouselInstance.autoplay && !carouselInstance.autoplay.running) {
                            carouselInstance.autoplay.start();
                        }
                    }, 200);
                }

                console.log('Client carousel initialized successfully', carouselInstance);
            } catch (error) {
                console.error('Error initializing client carousel:', error);
            }
        };

        // Wait for DOM to be ready and clientLogos to be available
        timeoutId = setTimeout(initClientCarousel, 800);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);

            // Cleanup carousel on unmount
            const carouselElement = document.querySelector('.home-client-carousel') as HTMLElement;
            if (carouselElement && (carouselElement as any).swiper) {
                try {
                    const swiper = (carouselElement as any).swiper;
                    if (swiper.autoplay) {
                        swiper.autoplay.stop();
                    }
                    swiper.destroy(true, true);
                    (carouselElement as any).swiper = null;
                } catch (error) {
                    // Silently ignore cleanup errors
                }
            }
        };
    }, []);

    // Get videos for different sections
    const heroVideo = homepageVideos.find(v => v.display_order === 1) || homepageVideos.find(v => v.display_order === '1') || homepageVideos[0];
    const watchVideo = homepageVideos.find(v => v.display_order === 2) || homepageVideos.find(v => v.display_order === '2') || homepageVideos[1];
    const backgroundVideo = homepageVideos.find(v => v.display_order === 3) || homepageVideos.find(v => v.display_order === '3') || homepageVideos[2];

    // Extract YouTube IDs when URLs are YouTube links; uploaded MP4s will return null
    const heroVideoId = heroVideo ? extractYouTubeId(normalizeVideoUrl(heroVideo.video_url) || '') : null;
    const watchVideoId = watchVideo ? extractYouTubeId(normalizeVideoUrl(watchVideo.video_url) || '') : null;
    const backgroundVideoId = backgroundVideo ? extractYouTubeId(normalizeVideoUrl(backgroundVideo.video_url) || '') : null;

    // Fallback IDs only when there is no API video at all
    const finalHeroVideoId = heroVideoId || (!heroVideo ? '2512Iw_0DPA' : null);
    const finalWatchVideoId = watchVideoId || (!watchVideo ? 'afCtix2-BGI' : null);
    const finalBackgroundVideoId = backgroundVideoId || (!backgroundVideo ? 'afCtix2-BGI' : null);

    // Trigger play on hero video so it autoplays on load (muted so browsers allow it).
    // Run on both desktop and touch devices: iOS often needs explicit play() after canplay.
    useEffect(() => {
        if (!heroVideoId && heroVideoRef.current) {
            const v = heroVideoRef.current;
            const attemptPlay = () => {
                v.play().catch(() => { });
            };
            v.load(); // iOS: ensure loading starts
            attemptPlay();
            v.addEventListener('loadeddata', attemptPlay);
            v.addEventListener('canplay', attemptPlay);
            v.addEventListener('loadedmetadata', attemptPlay);
            return () => {
                v.removeEventListener('loadeddata', attemptPlay);
                v.removeEventListener('canplay', attemptPlay);
                v.removeEventListener('loadedmetadata', attemptPlay);
            };
        }
    }, [heroVideoId, heroVideo?.video_url]);

    const fallbackCollections = [
        { image: 'images/project-3/bridal_set.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/foldable_cot_with_storage.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/storage_bed.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Alpha-X.jpg', title: 'Duxpod', link: '/duxpod-experience', filter: 'filter2', searchTitle: 'Duxpod' },
        { image: 'images/project-3/wall_foldable_bed_cot.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/horizontal_iron_board.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/foldable_shoe_rack.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Alpha-Y.jpg', title: 'Duxpod', link: '/duxpod-experience', filter: 'filter2', searchTitle: 'Duxpod' },
        { image: 'images/project-3/Shoe_rack_with_holder.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Three_layer_shoe_rack.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/flip_type_sofa_cum_bed.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Alpha-Z.jpg', title: 'Duxpod', link: '/duxpod-experience', filter: 'filter2', searchTitle: 'Duxpod' },
        { image: 'images/project-3/inclined_sofa_cum_bed.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/sliding_sofa_cum_bed.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/extendabledinintable.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Foldable_dining table_with_seat.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/duxpod-hero.png', title: 'Duxpod', link: '/duxpod-experience', filter: 'filter2', searchTitle: 'Duxpod' },
        { image: 'images/project-3/Foldable_dining_tables.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Teapoy_cum_studytable.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Teapoy_with storage.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Wall_foldablestudy_table.jpg', title: 'Space saving furniture', link: '/space-saving-furniture', filter: 'filter1', searchTitle: 'Space saving furniture' },
        { image: 'images/project-3/Interior.png', title: 'Interior Designing', link: '/interior-designing', filter: 'filter3', searchTitle: 'Interior Designing' },
        { image: 'images/project-3/modular.png', title: 'Modular Furniture', link: '/modular-kitchen', filter: 'filter4', searchTitle: 'Modular Furniture' },
    ];

    // Use fallback for preview for now (skip backend data binding)
    const displayCollections = fallbackCollections;

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
    };

    // Handle keyboard navigation for gallery modal
    useEffect(() => {
        if (!galleryModal.isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setGalleryModal(prev => ({ ...prev, isOpen: false }));
            } else if (e.key === 'ArrowLeft') {
                setGalleryModal(prev => ({
                    ...prev,
                    currentIndex: prev.currentIndex > 0
                        ? prev.currentIndex - 1
                        : prev.images.length - 1
                }));
            } else if (e.key === 'ArrowRight') {
                setGalleryModal(prev => ({
                    ...prev,
                    currentIndex: prev.currentIndex < prev.images.length - 1
                        ? prev.currentIndex + 1
                        : 0
                }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [galleryModal.isOpen, galleryModal.images.length]);

    // Initialize Collections Swiper - Fixed to work on initial load
    useEffect(() => {
        // Only initialize when we actually have slides to render
        if (displayCollections.length === 0) {
            return;
        }

        let retryCount = 0;
        const maxRetries = 50;

        const checkAndInitSwiper = () => {
            if (typeof window === 'undefined' || !(window as any).Swiper) {
                retryCount++;
                if (retryCount < maxRetries) {
                    setTimeout(checkAndInitSwiper, 100);
                } else {
                    console.error('Swiper library not loaded after max retries');
                }
                return;
            }

            const Swiper = (window as any).Swiper;
            const swiperContainer = document.querySelector('.pro-filtr-cate-bx') as HTMLElement;

            if (!swiperContainer) {
                retryCount++;
                if (retryCount < maxRetries) {
                    setTimeout(checkAndInitSwiper, 100);
                }
                return;
            }

            // Check if slides exist
            const allSlides = swiperContainer.querySelectorAll('[data-filter]');
            if (allSlides.length === 0) {
                retryCount++;
                if (retryCount < maxRetries) {
                    setTimeout(checkAndInitSwiper, 100);
                }
                return;
            }

            // Destroy existing Swiper instance if it exists
            if ((swiperContainer as any).swiper) {
                (swiperContainer as any).swiper.destroy(true, true);
                (swiperContainer as any).swiper = null;
            }

            // Show/hide slides based on filter
            allSlides.forEach((slide: any) => {
                const slideFilter = slide.getAttribute('data-filter');
                if (activeFilter === 'all') {
                    slide.classList.remove('non-swiper-slide');
                    slide.classList.add('swiper-slide');
                    slide.style.display = '';
                } else {
                    if (slideFilter === activeFilter) {
                        slide.classList.remove('non-swiper-slide');
                        slide.classList.add('swiper-slide');
                        slide.style.display = '';
                    } else {
                        slide.classList.add('non-swiper-slide');
                        slide.classList.remove('swiper-slide');
                        slide.style.display = 'none';
                    }
                }
            });

            // Count visible slides
            const visibleSlides = swiperContainer.querySelectorAll('.swiper-slide:not(.non-swiper-slide)');
            const hasMultipleSlides = visibleSlides.length > 1;

            // Swiper configuration – autoHeight so section is fully visible after images load
            const config = {
                slidesPerView: 1,
                spaceBetween: 20,
                speed: 600, // Transition speed (animation duration) - faster for continuous feel
                loop: hasMultipleSlides, // Only loop if multiple slides
                autoplay: hasMultipleSlides ? {
                    delay: 600, // Match speed for continuous sliding (no pause between slides)
                    disableOnInteraction: false, // Continue autoplay after user interaction
                    pauseOnMouseEnter: true, // Pause when hovering
                    waitForTransition: false, // Don't wait for transition to complete
                    reverseDirection: false, // Always slide forward
                } : false,
                grabCursor: true,
                freeMode: false,
                breakpoints: {
                    0: {
                        slidesPerView: 1,
                        slidesPerGroup: 1,
                        spaceBetween: 20
                    },
                    575: {
                        slidesPerView: 2,
                        slidesPerGroup: 1,
                        spaceBetween: 30
                    },
                    991: {
                        slidesPerView: 3,
                        slidesPerGroup: 1,
                        spaceBetween: 30
                    },
                    1366: {
                        slidesPerView: 4,
                        slidesPerGroup: 1,
                        spaceBetween: 40
                    }
                },
                navigation: {
                    nextEl: swiperContainer ? swiperContainer.querySelector('.swiper-button-next') : null,
                    prevEl: swiperContainer ? swiperContainer.querySelector('.swiper-button-prev') : null,
                    disabledClass: 'swiper-button-disabled',
                    hiddenClass: 'swiper-button-hidden'
                },
                on: {
                    init: function (this: any) {
                        console.log('Collections Swiper initialized successfully with', visibleSlides.length, 'visible slides');
                        // Update navigation immediately
                        if (this.navigation && this.navigation.update) {
                            this.navigation.update();
                        }
                        // Ensure autoplay starts on init - start immediately
                        if (hasMultipleSlides && this.autoplay && this.autoplay.start) {
                            // Start immediately, then also start after a short delay to ensure it works
                            this.autoplay.start();
                            console.log('Autoplay started in init callback (immediate)');
                            // Also start after a short delay as backup
                            setTimeout(() => {
                                if (this.autoplay && this.autoplay.start) {
                                    this.autoplay.start();
                                    console.log('Autoplay started in init callback (backup)');
                                }
                            }, 100);
                        }
                    },
                    slideChange: function (this: any) {
                        // Update navigation on every slide change to ensure buttons work
                        if (this.navigation && this.navigation.update) {
                            this.navigation.update();
                        }
                    },
                    slideChangeTransitionEnd: function (this: any) {
                        // Update navigation after transition completes
                        if (this.navigation && this.navigation.update) {
                            this.navigation.update();
                        }
                    },
                    autoplayStart: function (this: any) {
                        console.log('Autoplay started for Collections Swiper');
                    },
                    autoplayStop: function (this: any) {
                        console.log('Autoplay stopped for Collections Swiper');
                    }
                }
            };

            // Initialize Swiper after ensuring DOM is ready
            setTimeout(() => {
                try {
                    // Re-query navigation buttons to ensure they exist
                    const nextButton = swiperContainer.querySelector('.swiper-button-next') as HTMLElement;
                    const prevButton = swiperContainer.querySelector('.swiper-button-prev') as HTMLElement;

                    if (!nextButton || !prevButton) {
                        console.warn('Navigation buttons not found, retrying...');
                        // Retry after a short delay
                        setTimeout(() => {
                            const retryNextButton = swiperContainer.querySelector('.swiper-button-next') as HTMLElement;
                            const retryPrevButton = swiperContainer.querySelector('.swiper-button-prev') as HTMLElement;
                            if (retryNextButton && retryPrevButton) {
                                config.navigation.nextEl = retryNextButton;
                                config.navigation.prevEl = retryPrevButton;
                                const swiper = new Swiper(swiperContainer, config);
                                (swiperContainer as any).swiper = swiper;
                                console.log('Swiper initialized with navigation buttons');
                                // Start autoplay if enabled - CRITICAL for initial load
                                if (hasMultipleSlides && swiper.autoplay && swiper.autoplay.start) {
                                    swiper.autoplay.start();
                                    console.log('Autoplay started for Collections Swiper (retry)');
                                    // Also restart after a short delay to ensure it works
                                    setTimeout(() => {
                                        if (swiper.autoplay && swiper.autoplay.start) {
                                            swiper.autoplay.start();
                                        }
                                    }, 150);
                                }
                            } else {
                                console.error('Navigation buttons still not found after retry');
                            }
                        }, 100);
                        return;
                    }

                    // Update config with found buttons
                    config.navigation.nextEl = nextButton;
                    config.navigation.prevEl = prevButton;

                    const swiper = new Swiper(swiperContainer, config);
                    (swiperContainer as any).swiper = swiper;

                    // Verify navigation is working and ensure buttons are clickable
                    if (swiper.navigation) {
                        console.log('Swiper navigation initialized successfully');
                        console.log('Next button:', swiper.navigation.nextEl);
                        console.log('Prev button:', swiper.navigation.prevEl);

                        // Ensure buttons are properly bound and clickable
                        if (nextButton) {
                            nextButton.style.pointerEvents = 'auto';
                            nextButton.style.cursor = 'pointer';
                            // Remove any disabled state
                            nextButton.classList.remove('swiper-button-disabled');
                        }
                        if (prevButton) {
                            prevButton.style.pointerEvents = 'auto';
                            prevButton.style.cursor = 'pointer';
                            // Remove any disabled state
                            prevButton.classList.remove('swiper-button-disabled');
                        }

                        // Force navigation update
                        if (swiper.navigation.update) {
                            swiper.navigation.update();
                        }
                    }

                    // Explicitly start autoplay if enabled - START IMMEDIATELY
                    if (hasMultipleSlides && swiper.autoplay) {
                        // Start autoplay immediately without delay
                        if (swiper.autoplay.start) {
                            swiper.autoplay.start();
                            console.log('Autoplay started for Collections Swiper (immediate)');
                        }
                    }

                    // Force update multiple times to ensure proper rendering on initial load
                    setTimeout(() => {
                        if (swiper) {
                            if (swiper.update) swiper.update();
                            if (swiper.updateSlides) swiper.updateSlides();
                            if (swiper.updateSlidesClasses) swiper.updateSlidesClasses();
                            if (swiper.updateAutoHeight) swiper.updateAutoHeight();
                            // Don't use slideTo(0, 0) as it might interfere with autoplay
                            // Just ensure we're on a valid slide
                            // Update navigation after slides are ready
                            if (swiper.navigation && swiper.navigation.update) {
                                swiper.navigation.update();
                            }
                            // Ensure navigation buttons are clickable
                            const nextBtn = swiperContainer.querySelector('.swiper-button-next') as HTMLElement;
                            const prevBtn = swiperContainer.querySelector('.swiper-button-prev') as HTMLElement;
                            if (nextBtn) {
                                nextBtn.style.pointerEvents = 'auto';
                                nextBtn.style.cursor = 'pointer';
                            }
                            if (prevBtn) {
                                prevBtn.style.pointerEvents = 'auto';
                                prevBtn.style.cursor = 'pointer';
                            }
                            // CRITICAL: Restart autoplay after update to ensure it works on initial load
                            if (hasMultipleSlides && swiper.autoplay) {
                                if (swiper.autoplay.start) {
                                    swiper.autoplay.start();
                                    console.log('Autoplay restarted after update');
                                }
                            }
                        }
                    }, 200);

                    // Additional update after a longer delay to catch any late DOM changes
                    setTimeout(() => {
                        if (swiper && swiper.update) {
                            swiper.update();
                            // Update navigation again
                            if (swiper.navigation && swiper.navigation.update) {
                                swiper.navigation.update();
                            }
                            // Ensure navigation buttons are clickable
                            const nextBtn = swiperContainer.querySelector('.swiper-button-next') as HTMLElement;
                            const prevBtn = swiperContainer.querySelector('.swiper-button-prev') as HTMLElement;
                            if (nextBtn) {
                                nextBtn.style.pointerEvents = 'auto';
                                nextBtn.style.cursor = 'pointer';
                            }
                            if (prevBtn) {
                                prevBtn.style.pointerEvents = 'auto';
                                prevBtn.style.cursor = 'pointer';
                            }
                            // CRITICAL: Ensure autoplay is running after final update - ensures it works on initial load
                            if (hasMultipleSlides && swiper.autoplay) {
                                if (swiper.autoplay.start) {
                                    swiper.autoplay.start();
                                    console.log('Autoplay restarted after final update (initial load guarantee)');
                                }
                            }
                        }
                    }, 500);
                } catch (error) {
                    console.error('Swiper initialization error:', error);
                }
            }, 200);
        };

        // Start initialization - use longer delay on initial load to ensure DOM is fully ready
        const timeoutId = setTimeout(checkAndInitSwiper, 400);

        // Cleanup function
        return () => {
            clearTimeout(timeoutId);
            const swiperContainer = document.querySelector('.pro-filtr-cate-bx') as HTMLElement;
            if (swiperContainer && (swiperContainer as any).swiper) {
                (swiperContainer as any).swiper.destroy(true, true);
                (swiperContainer as any).swiper = null;
            }
        };
    }, [activeFilter, displayCollections.length]);

    // Initialize hero sliders (twm-slider1 and twm-slider1-content)
    useEffect(() => {
        const initHeroSliders = () => {
            if (typeof window === 'undefined' || !(window as any).Swiper) {
                // If Swiper not loaded yet, wait and retry
                setTimeout(initHeroSliders, 100);
                return;
            }

            const Swiper = (window as any).Swiper;

            // Initialize content slider first (twm-slider1-content)
            const contentSliderContainer = document.querySelector('.twm-slider1-content') as HTMLElement;
            const imageSliderContainer = document.querySelector('.twm-slider1') as HTMLElement;

            if (contentSliderContainer && imageSliderContainer) {
                // Destroy existing instances if they exist
                if ((contentSliderContainer as any).swiper) {
                    (contentSliderContainer as any).swiper.destroy(true, true);
                    (contentSliderContainer as any).swiper = null;
                }
                if ((imageSliderContainer as any).swiper) {
                    (imageSliderContainer as any).swiper.destroy(true, true);
                    (imageSliderContainer as any).swiper = null;
                }

                setTimeout(() => {
                    try {
                        // Initialize content slider first
                        const contentSwiper = new Swiper(contentSliderContainer, {
                            slidesPerView: 1,
                            speed: 3000,
                            parallax: true,
                            freeMode: false,
                            loop: true,
                            grabCursor: true,
                            autoplay: {
                                delay: 60000,
                                disableOnInteraction: false
                            },
                            navigation: {
                                nextEl: ".twm-slider1-wrap .swiper-button-next",
                                prevEl: ".twm-slider1-wrap .swiper-button-prev",
                            },
                            scrollbar: {
                                el: ".twm-slider1-wrap .swiper-scrollbar",
                                hide: false,
                            },
                            pagination: {
                                el: ".twm-slider1-content .swiper-pagination",
                                type: "fraction",
                            },
                        });
                        (contentSliderContainer as any).swiper = contentSwiper;

                        // Initialize image slider and sync with content slider
                        const imageSwiper = new Swiper(imageSliderContainer, {
                            slidesPerView: 1,
                            speed: 3000,
                            parallax: true,
                            freeMode: false,
                            loop: true,
                            grabCursor: true,
                            effect: "creative",
                            creativeEffect: {
                                prev: {
                                    shadow: false,
                                    translate: ["-120%", 0, -500],
                                },
                                next: {
                                    shadow: false,
                                    translate: ["120%", 0, -500],
                                },
                            },
                            autoplay: {
                                delay: 60000,
                                disableOnInteraction: false
                            },
                            controller: {
                                control: contentSwiper,
                            },
                            navigation: {
                                nextEl: ".twm-slider1-wrap .swiper-button-next",
                                prevEl: ".twm-slider1-wrap .swiper-button-prev",
                            },
                            scrollbar: {
                                el: ".twm-slider1-wrap .swiper-scrollbar",
                                hide: false,
                            },
                            pagination: {
                                el: ".twm-slider1-wrap .swiper-pagination",
                                type: "fraction",
                            },
                        });
                        (imageSliderContainer as any).swiper = imageSwiper;

                        // Sync content slider to follow image slider
                        contentSwiper.controller.control = imageSwiper;
                    } catch (error) {
                        console.error('Slider initialization error:', error);
                    }
                }, 100);
            }
        };

        // Start initialization
        const timeoutId = setTimeout(initHeroSliders, 100);

        // Cleanup function
        return () => {
            clearTimeout(timeoutId);

            const imageSliderContainer = document.querySelector('.twm-slider1') as HTMLElement;
            if (imageSliderContainer && (imageSliderContainer as any).swiper) {
                (imageSliderContainer as any).swiper.destroy(true, true);
                (imageSliderContainer as any).swiper = null;
            }

            const contentSliderContainer = document.querySelector('.twm-slider1-content') as HTMLElement;
            if (contentSliderContainer && (contentSliderContainer as any).swiper) {
                (contentSliderContainer as any).swiper.destroy(true, true);
                (contentSliderContainer as any).swiper = null;
            }
        };
    }, []);

    // Scroll-based slide-up animation for sections
    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        const elements = Array.from(document.querySelectorAll<HTMLElement>('.scroll-slide-up'));
        if (elements.length === 0) {
            return;
        }

        // Fallback: if IntersectionObserver is not supported, show all sections
        if (!(window as any).IntersectionObserver) {
            elements.forEach((el) => el.classList.add('scroll-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const target = entry.target as HTMLElement;
                    target.classList.add('scroll-visible');
                    obs.unobserve(target);
                }
            });
        }, {
            threshold: 0.2,
        });

        elements.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, []);

    // const clientLogos = [
    //     'images/client-logo/dark/xylem.png',
    //     'images/client-logo/dark/bini.png',
    //     'images/client-logo/dark/fertech.png',
    //     'images/client-logo/dark/vasan.png',
    //     'images/client-logo/dark/kmct2.png',
    //     'images/client-logo/dark/alameen.png',
    //     'images/client-logo/dark/simons.png',
    //     'images/client-logo/dark/xylem.png',
    //     'images/client-logo/dark/bini.png',
    //     'images/client-logo/dark/fertech.png',
    //     'images/client-logo/dark/vasan.png',
    //     'images/client-logo/dark/kmct2.png',
    //     'images/client-logo/dark/alameen.png',
    //     'images/client-logo/dark/simons.png',
    //     'images/client-logo/dark/xylem.png',
    //     'images/client-logo/dark/bini.png',
    //     'images/client-logo/dark/fertech.png',
    //     'images/client-logo/dark/vasan.png',
    //     'images/client-logo/dark/kmct2.png',
    //     'images/client-logo/dark/alameen.png',
    //     'images/client-logo/dark/simons.png',
    //     'images/client-logo/dark/xylem.png',
    //     'images/client-logo/dark/bini.png',
    //     'images/client-logo/dark/fertech.png',
    //     'images/client-logo/dark/vasan.png',
    //     'images/client-logo/dark/kmct2.png',
    //     'images/client-logo/dark/alameen.png',
    //     'images/client-logo/dark/simons.png',
    // ];

    return (
        <>
            <div className="cursor" style={{ display: 'none' }}></div>
            <div className="cursor2" style={{ display: 'none' }}></div>

            {isPageLoading && (
                <div className="duxbed-splash-screen">
                    <div className="duxbed-splash-card">
                        <div className="duxbed-splash-card-body">
                            <div className="duxbed-splash-logo-wrap">
                                <img src="/images/logo-light1.png" alt="Duxbed" className="duxbed-splash-logo" />
                            </div>
                            <div className="duxbed-splash-spinner"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-wraper">
                <Header />

                <div className="page-content">
                    <div className="twm-slider1-wrap slider-circle-pic-wrap" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="slider2-left-sidebar">
                            <div className="slider2-left-sidebar-position">
                                <div className="slider2-l-social">
                                    <ul className="social2-icons">
                                        <li>
                                            <a
                                                className="bg-twitter-clr"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="WhatsApp Channel"
                                            >
                                                whatsapp<i className="bi bi-whatsapp"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="bg-twitter-clr"
                                                href="https://www.facebook.com/share/1B5PnPGbyH/?mibextid=wwXIfr"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Facebook"
                                            >
                                                facebook<i className="bi bi-facebook"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="bg-twitter-clr"
                                                href="https://www.instagram.com/duxbed"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Instagram"
                                            >
                                                Instagram<i className="bi bi-instagram"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="swiper twm-slider1">
                            <div className="swiper-wrapper twm-slider1-slides">
                                <div className="swiper-slide">
                                    <div
                                        style={{
                                            position: 'relative',
                                            paddingBottom: '56.25%',
                                            height: 0,
                                            overflow: 'hidden',
                                            width: '100%',
                                            backgroundColor: '#000000'
                                        }}
                                    >
                                        {(() => {
                                            const uploadsBase = API_BASE_URL.replace(/api\/?$/, '');
                                            const heroVideoSrc = heroVideo?.video_url ||
                                                (import.meta.env.DEV
                                                    ? 'http://localhost:8000/backend/uploads/videos/homepage/699ec7be24e3f_1772013502.mp4'
                                                    : `${uploadsBase}uploads/videos/homepage/699ec7be24e3f_1772013502.mp4`);

                                            if (!heroVideoSrc) {
                                                return null;
                                            }

                                            const normalizedHeroSrc = normalizeVideoUrl(heroVideoSrc);
                                            const normalizedPoster = heroVideo?.thumbnail_url
                                                ? normalizeVideoUrl(heroVideo.thumbnail_url)
                                                : undefined;

                                            return (
                                                <video
                                                    key={normalizedHeroSrc || heroVideoSrc}
                                                    ref={heroVideoRef}
                                                    src={normalizedHeroSrc}
                                                    poster={normalizedPoster}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        border: 'none',
                                                        backgroundColor: '#000000'
                                                    }}
                                                    autoPlay
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    controls
                                                    loop
                                                    onError={() => {
                                                        console.error(
                                                            'Hero video failed to load',
                                                            heroVideo?.video_url || 'fallback MP4'
                                                        );
                                                    }}
                                                />
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90 about-section-one-wrap scroll-slide-up" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="about-section-one">
                            <div className="container">
                                <div className="section-content">
                                    <div className="row">
                                        <div className="col-lg-5 col-md-12 m-b30">
                                            <div className="company-exp-full-info">
                                                <div className="section-head left wt-small-separator-outer">
                                                    <div className="wt-small-separator">
                                                        <i className="bi bi-house"></i>
                                                        <div>Welcome to Duxbed</div>
                                                    </div>
                                                    <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Enhancing the Beauty of Your Home</h2>
                                                    <p>
                                                        Duxbed is a premium furniture brand specializing in innovative,spacesaving designs that blend style and functionality. Our products include foldable cots, modular storage systems, sofa beds, and more,catering to compact living spaces without compromising on quality or affordability. They aim to redefine living spaces with eco-conscious and superior-quality furniture
                                                    </p>
                                                    <p>
                                                        At Duxbed, we redefine living spaces with innovative, space-saving furniture solutions. Our mission is to blend functionality with style, offering products that maximize space without compromising on quality or affordability.
                                                    </p>
                                                </div>
                                                <NavLink to="/about-us" className="site-button" style={{ color: '#E69B0A', backgroundColor: 'transparent', borderColor: '#E69B0A' }}>Read more</NavLink>
                                            </div>
                                        </div>
                                        <div className="col-lg-7 col-md-12 m-b30 company-exp-position">
                                            <div className="company-exp">
                                                <div className="company-exp-media">
                                                    <img src="images/about2/about-section.png" alt="Duxbed Kerala office reception and customer support interior design" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90 premium-projects-wrap scroll-slide-up" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator" style={{ color: '#A6A6A6' }}>
                                    <i className="bi bi-house"></i>
                                    <div>Premium Projects</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Featured Projects</h2>
                                <p style={{ color: '#666', maxWidth: '800px', margin: '20px auto' }}>
                                    Explore our premium project showcases featuring stunning interiors designed with Duxbed furniture. Click on any project to view the complete gallery or video walkthrough.
                                </p>
                            </div>

                            <div className="section-content mt-5">
                                <div className="row">
                                    {premiumProjects.length > 0 ? (
                                        premiumProjects.map((project) => (
                                            <div key={project.id} className="col-lg-4 col-md-6 m-b30">
                                                <div className="premium-project-card" style={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderRadius: '10px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.3s ease',
                                                    height: '100%'
                                                }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                    onClick={() => {
                                                        if (project.type === 'video') {
                                                            window.open(project.videoUrl || project.video_url, '_blank');
                                                        } else if (project.type === 'gallery' && project.images && project.images.length > 0) {
                                                            setGalleryModal({
                                                                isOpen: true,
                                                                images: project.images,
                                                                currentIndex: 0,
                                                                title: project.title
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <div className="project-thumbnail" style={{
                                                        width: '100%',
                                                        height: '250px',
                                                        overflow: 'hidden',
                                                        position: 'relative'
                                                    }}>
                                                        <img
                                                            src={project.thumbnail || project.thumbnail_url}
                                                            alt={project.title}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        <div className="project-overlay" style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            backgroundColor: 'rgba(0,0,0,0.4)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease'
                                                        }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.opacity = '1';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.opacity = '0';
                                                            }}
                                                        >
                                                            <i className={`bi ${project.type === 'video' ? 'bi-play-circle-fill' : 'bi-images'}`}
                                                                style={{
                                                                    fontSize: '48px',
                                                                    color: '#FFFFFF'
                                                                }}
                                                            ></i>
                                                        </div>
                                                        <span style={{
                                                            position: 'absolute',
                                                            top: '15px',
                                                            left: '15px',
                                                            padding: '5px 15px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            backgroundColor: '#E69B0A',
                                                            color: '#FFFFFF'
                                                        }}>
                                                            {project.category}
                                                        </span>
                                                    </div>
                                                    <div className="project-info" style={{ padding: '25px' }}>
                                                        <h4 style={{ color: '#010101', marginBottom: '10px', fontSize: '20px' }}>
                                                            {project.title}
                                                        </h4>
                                                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                                                            {project.type === 'video' ? 'Click to watch video walkthrough' : `View ${project.images?.length || 0} images in gallery`}
                                                        </p>
                                                        <a
                                                            href="#!"
                                                            className="site-button-link"
                                                            style={{ color: '#E69B0A' }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (project.type === 'video') {
                                                                    window.open(project.videoUrl || project.video_url, '_blank');
                                                                } else if (project.type === 'gallery' && project.images && project.images.length > 0) {
                                                                    setGalleryModal({
                                                                        isOpen: true,
                                                                        images: project.images,
                                                                        currentIndex: 0,
                                                                        title: project.title
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            {project.type === 'video' ? 'Watch Video' : 'View Gallery'}
                                                            <i className="bi bi-arrow-right ms-1"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center py-5">
                                            <p style={{ color: '#666' }}>No featured projects available. Add projects from the admin panel.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90 scroll-slide-up" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="section-head center wt-small-separator-outer">
                            <div className="wt-small-separator" style={{ color: '#010101' }}>
                                <i className="bi bi-house"></i>
                                <div>What You Prefer!</div>
                            </div>
                            <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>What We Offer</h2>
                        </div>
                        <div className="container">
                            <div className="row g-4">
                                {/* Space saving furniture */}
                                <div className="col-lg-6 col-md-6">
                                    <div className="modern-offer-card" style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-10px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 155, 10, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                        }}
                                        onClick={() => window.location.href = '/space-saving-furniture'}
                                    >
                                        <div style={{
                                            position: 'relative',
                                            height: '200px',
                                            backgroundColor: '#f7f7f7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(230, 155, 10, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.4s ease'
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(230, 155, 10, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(230, 155, 10, 0.1)';
                                                }}
                                            >
                                                <img src="images/icons/furniture-2.png" alt="Space saving furniture" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                                            </div>
                                        </div>
                                        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{
                                                color: '#010101',
                                                fontSize: '24px',
                                                fontWeight: '600',
                                                marginBottom: '15px',
                                                transition: 'color 0.3s ease'
                                            }}>Space saving furniture</h3>
                                            <p style={{
                                                color: '#666',
                                                fontSize: '15px',
                                                lineHeight: '1.6',
                                                marginBottom: '20px',
                                                flex: 1
                                            }}>Space-saving furniture maximizes utility in compact living areas by combining multiple functions into single pieces or using clever mechanisms like folding, stacking, or vertical mounting.
                                                These designs address urban space constraints, particularly relevant for homes in populated area, where apartments and modular furniture production is common. They promote organization, reduce clutter, and enhance room flow without sacrificing style or comfort.</p>
                                            <NavLink
                                                to="/space-saving-furniture"
                                                className="site-button-link"
                                                style={{
                                                    color: '#E69B0A',
                                                    fontWeight: '600',
                                                    fontSize: '16px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.gap = '12px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.gap = '8px';
                                                }}
                                            >
                                                Explore <i className="bi bi-arrow-right" style={{ transition: 'transform 0.3s ease' }}></i>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>

                                {/* Duxpod */}
                                <div className="col-lg-6 col-md-6">
                                    <div className="modern-offer-card" style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-10px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 155, 10, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                        }}
                                        onClick={() => window.location.href = '/duxpod-experience'}
                                    >
                                        <div style={{
                                            position: 'relative',
                                            height: '200px',
                                            backgroundColor: '#f7f7f7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(230, 155, 10, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.4s ease'
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(230, 155, 10, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(230, 155, 10, 0.1)';
                                                }}
                                            >
                                                <img src="images/icons/kitchen-icon1.png" alt="Duxpod" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                                            </div>
                                        </div>
                                        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{
                                                color: '#010101',
                                                fontSize: '24px',
                                                fontWeight: '600',
                                                marginBottom: '15px',
                                                transition: 'color 0.3s ease'
                                            }}>Duxpod</h3>
                                            <p style={{
                                                color: '#666',
                                                fontSize: '15px',
                                                lineHeight: '1.6',
                                                marginBottom: '20px',
                                                flex: 1
                                            }}>Duxpods are portable resort units developed by Duxbed that combine modular architecture, luxury interiors, and mobility to create a complete
                                                plug‑and‑play hospitality space. Each unit functions as a self-contained premium room or mini-suite that can be
                                                transported, installed, and relocated with minimal site work, making it ideal for resorts, eco-stays, and boutique properties looking to expand quickly or seasonally.</p>
                                            <NavLink
                                                to="/duxpod-experience"
                                                className="site-button-link"
                                                style={{
                                                    color: '#E69B0A',
                                                    fontWeight: '600',
                                                    fontSize: '16px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.gap = '12px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.gap = '8px';
                                                }}
                                            >
                                                Explore <i className="bi bi-arrow-right" style={{ transition: 'transform 0.3s ease' }}></i>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>

                                {/* Interior designing */}
                                <div className="col-lg-6 col-md-6">
                                    <div className="modern-offer-card" style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-10px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 155, 10, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                        }}
                                        onClick={() => window.location.href = '/interior-designing'}
                                    >
                                        <div style={{
                                            position: 'relative',
                                            height: '200px',
                                            backgroundColor: '#f7f7f7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(230, 155, 10, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.4s ease'
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(230, 155, 10, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(230, 155, 10, 0.1)';
                                                }}
                                            >
                                                <img src="images/icons/curtain.png" alt="Interior designing" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                                            </div>
                                        </div>
                                        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{
                                                color: '#010101',
                                                fontSize: '24px',
                                                fontWeight: '600',
                                                marginBottom: '15px',
                                                transition: 'color 0.3s ease'
                                            }}>Interior designing</h3>
                                            <p style={{
                                                color: '#666',
                                                fontSize: '15px',
                                                lineHeight: '1.6',
                                                marginBottom: '20px',
                                                flex: 1
                                            }}>We transforms living spaces into functional, aesthetically pleasing environments by blending creativity, architecture, and user needs
                                                through careful planning of layouts, materials, colors, and furnishings. It encompasses everything from conceptualizing
                                                room flows to selecting finishes, ensuring harmony between form and utility. Personalized interior design stands out as a core
                                                strength here, tailoring every element to individual lifestyles for truly unique, resonant home.</p>
                                            <NavLink
                                                to="/interior-designing"
                                                className="site-button-link"
                                                style={{
                                                    color: '#E69B0A',
                                                    fontWeight: '600',
                                                    fontSize: '16px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.gap = '12px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.gap = '8px';
                                                }}
                                            >
                                                Explore <i className="bi bi-arrow-right" style={{ transition: 'transform 0.3s ease' }}></i>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>

                                {/* Modular kitchen */}
                                <div className="col-lg-6 col-md-6">
                                    <div className="modern-offer-card" style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-10px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 155, 10, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                        }}
                                        onClick={() => window.location.href = '/modular-kitchen'}
                                    >
                                        <div style={{
                                            position: 'relative',
                                            height: '200px',
                                            backgroundColor: '#f7f7f7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(230, 155, 10, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.4s ease'
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(230, 155, 10, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(230, 155, 10, 0.1)';
                                                }}
                                            >
                                                <img src="images/icons/Modular-Kitchen.png" alt="Modular kitchen" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                                            </div>
                                        </div>
                                        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{
                                                color: '#010101',
                                                fontSize: '24px',
                                                fontWeight: '600',
                                                marginBottom: '15px',
                                                transition: 'color 0.3s ease'
                                            }}>Modular kitchen</h3>
                                            <p style={{
                                                color: '#666',
                                                fontSize: '15px',
                                                lineHeight: '1.6',
                                                marginBottom: '20px',
                                                flex: 1
                                            }}>Modular furniture consists of interchangeable, standardized components that assemble into customizable configurations,
                                                allowing easy reconfiguration, expansion, or disassembly for versatile use in homes and offices. This design excels in space
                                                optimization, aligning perfectly with space-saving needs in compact Kerala residences, and supports modern, personalized
                                                interior schemes through adaptable layouts. At Duxbed, we lead the industry by designing and constructing these pieces at
                                                the cheapest rates with unmatched quality, using a durable steel-wood combination for strength and elegance.</p>
                                            <NavLink
                                                to="/modular-kitchen"
                                                className="site-button-link"
                                                style={{
                                                    color: '#E69B0A',
                                                    fontWeight: '600',
                                                    fontSize: '16px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.gap = '12px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.gap = '8px';
                                                }}
                                            >
                                                Explore <i className="bi bi-arrow-right" style={{ transition: 'transform 0.3s ease' }}></i>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90 pro-filtr-cate-wrap scroll-slide-up" style={{ background: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator" style={{ color: '#A6A6A6' }}>
                                    <i className="bi bi-house"></i>
                                    <div>Explore Recent Work</div>
                                </div>
                                <h2 className="wt-title  title_split_anim" style={{ color: '#010101' }}>Our Collections</h2>
                            </div>
                        </div>
                        <div className="pro-filtr-cate-carousal-wrap">
                            <div className="project-filter-wrap pro-filtr-cate-carousal text-center">
                                <span
                                    data-filter="all"
                                    onClick={() => handleFilterClick('all')}
                                    className={activeFilter === 'all' ? 'active' : ''}
                                    style={{
                                        cursor: 'pointer',
                                        color: activeFilter === 'all' ? 'rgb(255 255 255)' : '#A6A6A6',
                                        backgroundColor: activeFilter === 'all' ? 'rgb(230, 155, 10)' : 'transparent'
                                    }}
                                >
                                    All
                                </span>
                                <span
                                    data-filter="filter1"
                                    onClick={() => handleFilterClick('filter1')}
                                    className={activeFilter === 'filter1' ? 'active' : ''}
                                    style={{
                                        cursor: 'pointer',
                                        color: activeFilter === 'filter1' ? 'rgb(255 255 255)' : '#A6A6A6',
                                        backgroundColor: activeFilter === 'filter1' ? 'rgb(230, 155, 10)' : 'transparent'
                                    }}
                                >
                                    Space saving furniture
                                </span>
                                <span
                                    data-filter="filter2"
                                    onClick={() => handleFilterClick('filter2')}
                                    className={activeFilter === 'filter2' ? 'active' : ''}
                                    style={{
                                        cursor: 'pointer',
                                        color: activeFilter === 'filter2' ? 'rgb(255 255 255)' : '#A6A6A6',
                                        backgroundColor: activeFilter === 'filter2' ? 'rgb(230, 155, 10)' : 'transparent'
                                    }}
                                >
                                    Duxpod
                                </span>
                                <span
                                    data-filter="filter3"
                                    onClick={() => handleFilterClick('filter3')}
                                    className={activeFilter === 'filter3' ? 'active' : ''}
                                    style={{
                                        cursor: 'pointer',
                                        color: activeFilter === 'filter3' ? 'rgb(255 255 255)' : '#A6A6A6',
                                        backgroundColor: activeFilter === 'filter3' ? 'rgb(230, 155, 10)' : 'transparent'
                                    }}
                                >
                                    Interior designing
                                </span>
                                <span
                                    data-filter="filter4"
                                    onClick={() => handleFilterClick('filter4')}
                                    className={activeFilter === 'filter4' ? 'active' : ''}
                                    style={{
                                        cursor: 'pointer',
                                        color: activeFilter === 'filter4' ? 'rgb(255 255 255)' : '#A6A6A6',
                                        backgroundColor: activeFilter === 'filter4' ? 'rgb(230, 155, 10)' : 'transparent'
                                    }}
                                >
                                    Modular kitchen
                                </span>
                            </div>
                            {displayCollections.length === 0 ? (
                                <div className="text-center p-5">
                                    <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#A6A6A6', marginBottom: '20px' }}></i>
                                    <h4 style={{ color: '#666', marginBottom: '10px' }}>No collections available</h4>
                                    <p style={{ color: '#A6A6A6' }}>No products found. Please add products from the admin panel.</p>
                                </div>
                            ) : (
                                <div className="swiper-container pro-filtr-cate-bx">
                                    <div className="swiper-wrapper">
                                        {displayCollections.map((item, index) => {
                                            const isVisible = activeFilter === 'all' || item.filter === activeFilter;
                                            return (
                                                <div
                                                    key={(item as { id?: number }).id ?? `collection-${index}`}
                                                    className={isVisible ? "swiper-slide" : "swiper-slide non-swiper-slide"}
                                                    data-filter={item.filter}
                                                    style={isVisible ? {} : { display: 'none' }}
                                                >
                                                    <div className="effect-hvr3 collection-card" style={{ position: 'relative' }}>
                                                        <div className="effect-sarah" style={{ position: 'relative' }}>
                                                            <img
                                                                src={item.image}
                                                                alt={item.title || item.searchTitle}
                                                            // onError={(e) => {
                                                            //     const img = e.target as HTMLImageElement;
                                                            //     img.src = 'images/about2/about-section.png';
                                                            // }}
                                                            />
                                                            <button
                                                                className="elem pic-long project-view-btn"
                                                                type="button"
                                                                title={item.searchTitle || item.title}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setGalleryModal({
                                                                        isOpen: true,
                                                                        images: [(item as { fullImage?: string; image: string }).fullImage || item.image],
                                                                        currentIndex: 0,
                                                                        title: item.searchTitle || item.title
                                                                    });
                                                                }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '10px',
                                                                    left: '10px',
                                                                    width: '30px',  // ✅ SIZE: 30px
                                                                    height: '30px', // ✅ SIZE: 30px
                                                                    background: '#FFD700', // ✅ COLOR: Changed from red (#E69B0A) to yellow (#FFD700)
                                                                    borderRadius: '50%',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: 0,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    zIndex: 10
                                                                }}
                                                            >
                                                                <i className="bi bi-zoom-in" style={{ color: '#fff', fontSize: '18px' }}></i> {/* ✅ ICON SIZE: 18px to fit 30px button */}
                                                            </button>
                                                        </div>
                                                        <div className="effect-hvr3-inner">
                                                            <h3 className="wt-title">
                                                                <Link to={item.link}>{item.title}</Link>
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="swiper-button-prev"></div>
                                    <div className="swiper-button-next"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90 twm-ab2-section-wrap scroll-slide-up" style={{ backgroundImage: 'url("images/main-slider/slider1/living-area3.png")' }}>
                        <div className="container">
                            <div className="section-content">
                                <div className="row">
                                    <div className="col-lg-7 col-md-10">
                                        <div className="twm-ab2-section-bx">
                                            <div className="section-head left wt-small-separator-outer">
                                                <div className="wt-small-separator" style={{ color: '#010101' }}>
                                                    <i className="bi bi-house"></i>
                                                    <div style={{ color: '#A6A6A6' }}>Our Info</div>
                                                </div>
                                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Our primary focus is on crafting high-quality furniture that meets the highest standards.</h2>
                                                <p>At Duxbed, we see a home as more than just walls and structure—it comes alive through the elements within it. Our vision is to enrich living spaces with furniture that is both functional and visually appealing, enhancing the way you live every day. What began as a dream to create beautiful, practical home furniture has now become our reality. Every product we craft reflects our commitment to integrity, skilled craftsmanship, and a deep understanding of what truly turns a house into a home.</p>
                                            </div>
                                            <div className="twm-ab2-quote-section">
                                                <i className="bi bi-quote"></i>
                                                <p style={{ color: '#010101' }}>In building Duxbed, we pursued every step with relentless attention to quality, trust, and design, creating furniture that enhances and elevates every home.</p>
                                            </div>
                                            <div className="twm-ab2-au-name" style={{ marginRight: '21px' }}>
                                                <div className="twm-ab2-au-sign"></div>
                                                <div className="twm-ab2-au-left">
                                                    <h3 className="title">Shafeek Muhammed</h3>
                                                    <span style={{ color: '#E69B0A' }}>CEO</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full video-section2-outer-wrap scroll-slide-up">
                        <div className="video-section2-corner-top"></div>
                        <div className="video-section2-corner-bottom"></div>
                        <div className="watch-video">
                            <span style={{ color: '#E69B0A' }}>Watch Our video</span>
                        </div>
                        <div className="container">
                            <div className="section-content">
                                <div className="row justify-content-center align-items-center">
                                    <div className="col-lg-6 col-md-12">
                                        <div className="video-section2-outer">
                                            <div className="video-section2 parallax-section">
                                                <img
                                                    src={watchVideo?.thumbnail_url || "images/video-tn.png"}
                                                    alt={watchVideo?.title || "Video thumbnail"}
                                                    className="parallax-image"
                                                />
                                                <a
                                                    href={normalizeVideoUrl(watchVideo?.video_url) || `https://www.youtube.com/watch?v=${finalWatchVideoId}`}
                                                    className="mfp-video play-now-video"
                                                    aria-label="Play video"
                                                >
                                                    <i className="icon bi bi-play-circle-fill"></i>
                                                    <span className="ripple"></span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-md-12">
                                        <div className="video-section2-right">
                                            <div className="section-head left wt-small-separator-outer">
                                                <div className="wt-small-separator" style={{ color: '#A6A6A6' }}>
                                                    <i className="bi bi-house"></i>
                                                    <div>Our Info</div>
                                                </div>
                                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Experience Duxbed's reel life</h2>
                                                <p>Visit our youtube channel and get real updates of what we do. Dive into our journey of designing and delivering timeless furniture.</p>
                                            </div>
                                            <NavLink to="https://www.youtube.com/@DUXBEDOFFICIAL" target="_blank" rel="noopener noreferrer" className="site-button" style={{ color: '#E69B0A', backgroundColor: 'transparent', borderColor: '#E69B0A' }}>Visit Our Channel</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="twm-acd-st-1">

                    </div>

                    {/* Our Leaderships preview section */}
                    <div className="section-full p-t120 p-b90 scroll-slide-up" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator" style={{ color: '#010101' }}>
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Our Leaderships</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Leading the Way</h2>
                            </div>

                            <div className="section-content">
                                {(() => {
                                    const leaders = homepageLeadership.length > 0 ? homepageLeadership.slice(0, 4) : [
                                        { name: 'Leadership Member 1', position: 'Chairman', image_url: 'images/testimonials/testi4.png', bio: 'Providing strategic vision and guiding the overall direction of Duxbed.' },
                                        { name: 'Leadership Member 2', position: 'Director', image_url: 'images/testimonials/testi4.png', bio: 'Driving growth and ensuring operational excellence across all departments.' },
                                        { name: 'Leadership Member 3', position: 'CEO', image_url: 'images/testimonials/testi4.png', bio: 'Leading Duxbed with a customer-first mindset and commitment to quality.' }
                                    ];

                                    if (!leaders || leaders.length === 0) {
                                        return null;
                                    }

                                    /* MD card – separate style and CSS */
                                    const leadershipCardStylesMD = {
                                        card: {
                                            borderRadius: '20px',
                                            overflow: 'hidden' as const,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                                            display: 'flex' as const,
                                            flexDirection: 'column' as const,
                                            backgroundColor: '#FFFFFF',
                                            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                                        },
                                        imageSection: {
                                            backgroundColor: '#E69B0A',
                                            padding: '0px 22px 0px 7px',
                                            display: 'flex' as const,
                                            alignItems: 'flex-end' as const,
                                            justifyContent: 'center' as const,
                                            minHeight: '230px',
                                        },
                                        imageWrap: { width: '100%' as const, maxWidth: '310px', lineHeight: 0 },
                                        image: { width: '100%' as const, height: 'auto' as const, display: 'block' as const },
                                        textSection: {
                                            padding: '18px 18px 22px',
                                            textAlign: 'center' as const,
                                            backgroundColor: '#FFFFFF',
                                        },
                                        position: {
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: '#010101',
                                            letterSpacing: '0.18em',
                                            marginBottom: '6px',
                                        },
                                        name: { fontSize: '15px', fontWeight: 500, color: '#111111', marginBottom: '10px' },
                                        line: { width: '40px', height: '2px', backgroundColor: '#111111', margin: '0 auto' },
                                    };

                                    /* Other three (CEO, COO, CFO) – separate style and CSS */
                                    const leadershipCardStylesMember = {
                                        card: {
                                            borderRadius: '20px',
                                            overflow: 'hidden' as const,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                                            display: 'flex' as const,
                                            flexDirection: 'column' as const,
                                            backgroundColor: '#FFFFFF',
                                            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                                        },
                                        imageSection: {
                                            backgroundColor: '#E69B0A',
                                            padding: '28px 22px 0',
                                            display: 'flex' as const,
                                            alignItems: 'flex-end' as const,
                                            justifyContent: 'center' as const,
                                            minHeight: '230px',
                                        },
                                        imageWrap: { width: '100%' as const, maxWidth: '310px', lineHeight: 0 },
                                        image: { width: '100%' as const, height: 'auto' as const, display: 'block' as const },
                                        textSection: {
                                            padding: '18px 18px 22px',
                                            textAlign: 'center' as const,
                                            backgroundColor: '#FFFFFF',
                                        },
                                        position: {
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: '#010101',
                                            letterSpacing: '0.18em',
                                            marginBottom: '6px',
                                        },
                                        name: { fontSize: '15px', fontWeight: 500, color: '#111111', marginBottom: '10px' },
                                        line: { width: '40px', height: '2px', backgroundColor: '#111111', margin: '0 auto' },
                                    };

                                    const renderLeadershipCardMD = (leader: any, index: number) => (
                                        <NavLink
                                            to={`/our-leadership/${getLeaderSlug(leader, index)}`}
                                            className="leadership-card-link"
                                            style={{ display: 'block', textDecoration: 'none', color: 'inherit', height: '100%' }}
                                        >
                                            <div className="leadership-card leadership-card-md-inner" style={leadershipCardStylesMD.card}>
                                                <div style={leadershipCardStylesMD.imageSection}>
                                                    <div style={leadershipCardStylesMD.imageWrap}>
                                                        <img
                                                            src={leader.image_url || leader.image || 'images/testimonials/testi4.png'}
                                                            alt={leader.name || 'Leadership Member'}
                                                            style={leadershipCardStylesMD.image}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={leadershipCardStylesMD.textSection}>
                                                    <div style={leadershipCardStylesMD.position}>{leader.position}</div>
                                                    <div style={leadershipCardStylesMD.name}>{leader.name}</div>
                                                    <div style={leadershipCardStylesMD.line} />
                                                </div>
                                            </div>
                                        </NavLink>
                                    );

                                    const renderLeadershipCardMember = (leader: any, index: number) => (
                                        <NavLink
                                            to={`/our-leadership/${getLeaderSlug(leader, index)}`}
                                            className="leadership-card-link"
                                            style={{ display: 'block', textDecoration: 'none', color: 'inherit', height: '100%' }}
                                        >
                                            <div className="leadership-card leadership-card-member-inner" style={leadershipCardStylesMember.card}>
                                                <div style={leadershipCardStylesMember.imageSection}>
                                                    <div style={leadershipCardStylesMember.imageWrap}>
                                                        <img
                                                            src={leader.image_url || leader.image || 'images/testimonials/testi4.png'}
                                                            alt={leader.name || 'Leadership Member'}
                                                            style={leadershipCardStylesMember.image}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={leadershipCardStylesMember.textSection}>
                                                    <div style={leadershipCardStylesMember.position}>{leader.position}</div>
                                                    <div style={leadershipCardStylesMember.name}>{leader.name}</div>
                                                    <div style={leadershipCardStylesMember.line} />
                                                </div>
                                            </div>
                                        </NavLink>
                                    );

                                    const mdLeader = leaders[0];
                                    const otherLeaders = leaders.slice(1, 4);

                                    return (
                                        <div className="row justify-content-center">
                                            <div
                                                className="col-xl-3 col-lg-3 col-md-6 m-b30 leadership-card-md"
                                                key={(mdLeader as any).id || (mdLeader as any).name || 1}
                                            >
                                                {renderLeadershipCardMD(mdLeader as any, 0)}
                                            </div>
                                            {otherLeaders.map((leader, index) => (
                                                <div
                                                    key={(leader as any).id || (leader as any).name || index + 2}
                                                    className="col-xl-3 col-lg-3 col-md-6 m-b30 leadership-card-member"
                                                >
                                                    {renderLeadershipCardMember(leader as any, index + 1)}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="section-full bg-cover p-t120 p-b90 twm-t-monial-2 scroll-slide-up">
                        <div className="container">
                            <div className="testimonial2-outer">
                                <div className="section-head center wt-small-separator-outer">
                                    <div className="wt-small-separator" style={{ color: '#010101' }}>
                                        <i className="bi bi-house"></i>
                                        <div style={{ color: '#A6A6A6' }}>Testimonials</div>
                                    </div>
                                    <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>What Our Clients Says</h2>
                                </div>

                                <div className="section-content">
                                    {testimonials.length > 0 ? (
                                        <div className="testimonial-1-content owl-carousel m-b30" data-react-carousel="true" key={`testimonials-${testimonials.length}`}>
                                            {testimonials.map((testimonial, index) => {
                                                const rating = testimonial.rating || 5;
                                                return (
                                                    <div key={testimonial.id || index} className="item">
                                                        <div className="testimonial-1">
                                                            <div className="testimonial-content">
                                                                <div className="testimonial-text">
                                                                    <i className="bi bi-chat-right-quote-fill"></i>
                                                                    <p>{testimonial.testimonial_text || testimonial.text}</p>
                                                                </div>
                                                                <div className="testimonial-detail clearfix">
                                                                    <div className="testimonial-pic-block">
                                                                        <div className="testimonial-pic">
                                                                            <img
                                                                                src={testimonial.image_url || testimonial.image || 'images/testimonials/testi1.png'}
                                                                                alt={testimonial.client_name || testimonial.name}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="testimonial-info">
                                                                        <span className="testimonial-name">{testimonial.client_name || testimonial.name}</span>
                                                                        <span className="testimonial-position">{testimonial.location || ''}</span>
                                                                        <div className="testimonial-rating">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <i
                                                                                    key={i}
                                                                                    className={`bi bi-star${i < rating ? '-fill' : ''}`}
                                                                                    style={{ color: i < rating ? '#E69B0A' : '#ddd' }}
                                                                                ></i>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div style={{
                                                backgroundColor: '#f7f7f7',
                                                padding: '40px',
                                                borderRadius: '10px',
                                                maxWidth: '600px',
                                                margin: '0 auto'
                                            }}>
                                                <i className="bi bi-chat-left-quote" style={{ fontSize: '48px', color: '#A6A6A6', marginBottom: '20px' }}></i>
                                                <h3 style={{ color: '#010101', marginBottom: '10px' }}>No Testimonials Available</h3>
                                                <p style={{ color: '#666', fontSize: '16px' }}>
                                                    There are no testimonials to display at this time. Check back later for customer feedback.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full get-intouch-style-2-wrap parallax-section scroll-slide-up">
                        <div className="video-background">
                            {backgroundVideo ? (
                                backgroundVideoId ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${backgroundVideoId}?autoplay=1&mute=1&loop=1&playlist=${backgroundVideoId}&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1`}
                                        frameBorder="0"
                                        allow="autoplay; fullscreen"
                                        allowFullScreen
                                        title={backgroundVideo?.title || "Duxbed Video"}
                                    ></iframe>
                                ) : backgroundVideo.video_url ? (
                                    <video
                                        src={normalizeVideoUrl(backgroundVideo.video_url)}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000000' }}
                                    />
                                ) : null
                            ) : finalBackgroundVideoId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${finalBackgroundVideoId}?autoplay=1&mute=1&loop=1&playlist=${finalBackgroundVideoId}&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1`}
                                    frameBorder="0"
                                    allow="autoplay; fullscreen"
                                    allowFullScreen
                                    title="Duxbed Video"
                                ></iframe>
                            ) : null}
                        </div>
                        <div className="video-overlay"></div>
                        <div className="get-intouch-style-2-inner" style={{ color: '#FFFFFF' }}>
                            <span>Locations</span>
                            <h2 className="wt-title title_split_anim" style={{ color: '#FFFFFF' }}>Visit your nearest stores</h2>
                            <div className="site-center-btn text-center">
                                <NavLink to="/locate-us" className="site-button" style={{ color: '#FFFFFF', backgroundColor: '#E69B0A', borderColor: '#E69B0A' }} >Our Stores</NavLink>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className="section-full p-t120 p-b90 twm-home-client-carousel-wrap scroll-slide-up">
                    <div className="container">
                        <div className="section-content">
                            <div className="home-client-carousel1-wrap">
                                <div className="section-head center wt-small-separator-outer">
                                    <div className="wt-small-separator" style={{ color: '#010101' }}>
                                        <i className="bi bi-house"></i>
                                        <div style={{ color: '#A6A6A6' }}>Meet Our Client</div>
                                    </div>
                                    <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Our Clients</h2>
                                </div>

                                <div className="swiper home-client-carousel" data-react-carousel="true">
                                    <div className="swiper-wrapper">
                                        {clientLogos.map((logo, index) => (
                                            <div key={index} className="swiper-slide">
                                                <div className="ow-client-logo">
                                                    <div className="client-logo client-logo-media">
                                                        <a href="#!" aria-label={`Client logo ${index + 1}`}>
                                                            <img src={logo} alt={`Client ${index + 1}`} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}

                <Footer />

                <button className="scroltop" aria-label="Scroll to top">
                    <span className="bi bi-chevron-up relative" id="btn-vibrate"></span>
                </button>

                {galleryModal.isOpen && (
                    <div
                        className="gallery-modal-overlay"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            animation: 'fadeIn 0.3s ease-in-out'
                        }}
                        onClick={() => setGalleryModal({ ...galleryModal, isOpen: false })}
                    >
                        <div
                            className="gallery-modal-content"
                            style={{
                                position: 'relative',
                                maxWidth: '95vw',
                                maxHeight: '95vh',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                                borderRadius: '20px',
                                border: '1px solid rgba(230, 155, 10, 0.3)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(230, 155, 10, 0.1)',
                                padding: '40px',
                                animation: 'slideUp 0.4s ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Top Bar */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #E69B0A 0%, #D48909 50%, #E69B0A 100%)',
                                borderRadius: '20px 20px 0 0'
                            }}></div>

                            {/* Close Button - Enhanced Design */}
                            <button
                                onClick={() => setGalleryModal({ ...galleryModal, isOpen: false })}
                                style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    background: 'linear-gradient(135deg, rgba(230, 155, 10, 0.9) 0%, rgba(212, 137, 9, 0.9) 100%)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '45px',
                                    height: '45px',
                                    color: '#FFFFFF',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    zIndex: 10000,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(230, 155, 10, 0.4)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 137, 9, 0.95) 0%, rgba(230, 155, 10, 0.95) 100%)';
                                    e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 155, 10, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 155, 10, 0.9) 0%, rgba(212, 137, 9, 0.9) 100%)';
                                    e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 155, 10, 0.4)';
                                }}
                                aria-label="Close gallery"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                            {/* Title Section - Enhanced */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                left: '40px',
                                right: '80px',
                                zIndex: 10000
                            }}>
                                <h3
                                    style={{
                                        color: '#FFFFFF',
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        margin: 0,
                                        marginBottom: '8px',
                                        textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
                                        background: 'linear-gradient(135deg, #FFFFFF 0%, #E69B0A 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {galleryModal.title}
                                </h3>
                                {galleryModal.images.length > 1 && (
                                    <div
                                        style={{
                                            color: '#E69B0A',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i className="bi bi-images"></i>
                                        <span>Image {galleryModal.currentIndex + 1} of {galleryModal.images.length}</span>
                                    </div>
                                )}
                            </div>

                            {/* Main Image Container - Enhanced */}
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '60px',
                                marginBottom: galleryModal.images.length > 1 ? '120px' : '20px'
                            }}>
                                <img
                                    src={galleryModal.images[galleryModal.currentIndex]}
                                    alt={`${galleryModal.title} - Image ${galleryModal.currentIndex + 1}`}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '75vh',
                                        objectFit: 'contain',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(230, 155, 10, 0.2)',
                                        border: '2px solid rgba(230, 155, 10, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onLoad={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                />
                            </div>

                            {/* Navigation Buttons - Enhanced Design */}
                            {galleryModal.images.length > 1 && (
                                <>
                                    {/* Previous Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setGalleryModal({
                                                ...galleryModal,
                                                currentIndex: galleryModal.currentIndex > 0
                                                    ? galleryModal.currentIndex - 1
                                                    : galleryModal.images.length - 1
                                            });
                                        }}
                                        style={{
                                            position: 'absolute',
                                            left: '20px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'linear-gradient(135deg, rgba(230, 155, 10, 0.9) 0%, rgba(212, 137, 9, 0.9) 100%)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '60px',
                                            height: '60px',
                                            color: '#FFFFFF',
                                            fontSize: '28px',
                                            cursor: 'pointer',
                                            zIndex: 10000,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(230, 155, 10, 0.4)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 137, 9, 0.95) 0%, rgba(230, 155, 10, 0.95) 100%)';
                                            e.currentTarget.style.transform = 'translateY(-50%) translateX(-5px) scale(1.1)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 155, 10, 0.6)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 155, 10, 0.9) 0%, rgba(212, 137, 9, 0.9) 100%)';
                                            e.currentTarget.style.transform = 'translateY(-50%) translateX(0) scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 155, 10, 0.4)';
                                        }}
                                        aria-label="Previous image"
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>

                                    {/* Next Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setGalleryModal({
                                                ...galleryModal,
                                                currentIndex: galleryModal.currentIndex < galleryModal.images.length - 1
                                                    ? galleryModal.currentIndex + 1
                                                    : 0
                                            });
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '20px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'linear-gradient(135deg, rgba(230, 155, 10, 0.9) 0%, rgba(212, 137, 9, 0.9) 100%)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '60px',
                                            height: '60px',
                                            color: '#FFFFFF',
                                            fontSize: '28px',
                                            cursor: 'pointer',
                                            zIndex: 10000,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(230, 155, 10, 0.4)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 137, 9, 0.95) 0%, rgba(230, 155, 10, 0.95) 100%)';
                                            e.currentTarget.style.transform = 'translateY(-50%) translateX(5px) scale(1.1)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 155, 10, 0.6)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 155, 10, 0.9) 0%, rgba(212, 137, 9, 0.9) 100%)';
                                            e.currentTarget.style.transform = 'translateY(-50%) translateX(0) scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 155, 10, 0.4)';
                                        }}
                                        aria-label="Next image"
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </>
                            )}

                            {/* Thumbnail Navigation - Enhanced Design */}
                            {galleryModal.images.length > 1 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        gap: '12px',
                                        zIndex: 10000,
                                        maxWidth: '90%',
                                        overflowX: 'auto',
                                        padding: '15px 20px',
                                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(20, 20, 20, 0.8) 100%)',
                                        borderRadius: '15px',
                                        border: '1px solid rgba(230, 155, 10, 0.3)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#E69B0A transparent'
                                    }}
                                >
                                    {galleryModal.images.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setGalleryModal({ ...galleryModal, currentIndex: index });
                                            }}
                                            style={{
                                                position: 'relative',
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: index === galleryModal.currentIndex
                                                    ? '3px solid #E69B0A'
                                                    : '3px solid transparent',
                                                opacity: index === galleryModal.currentIndex ? 1 : 0.7,
                                                transition: 'all 0.3s ease',
                                                boxShadow: index === galleryModal.currentIndex
                                                    ? '0 4px 15px rgba(230, 155, 10, 0.5)'
                                                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                                                transform: index === galleryModal.currentIndex ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (index !== galleryModal.currentIndex) {
                                                    e.currentTarget.style.opacity = '1';
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (index !== galleryModal.currentIndex) {
                                                    e.currentTarget.style.opacity = '0.7';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                style={{
                                                    width: '90px',
                                                    height: '90px',
                                                    objectFit: 'cover',
                                                    display: 'block'
                                                }}
                                            />
                                            {index === galleryModal.currentIndex && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '4px',
                                                    background: 'linear-gradient(90deg, #E69B0A 0%, #D48909 100%)'
                                                }}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <style>{`
                    /* Splash loader for initial page load – Bootstrap-style card */
                    .duxbed-splash-screen {
                        position: fixed;
                        inset: 0;
                        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        z-index: 9999;
                    }

                    .duxbed-splash-card {
                        background: #fff;
                        border-radius: 1rem;
                        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08), 0 0.25rem 0.5rem rgba(0, 0, 0, 0.04);
                        border: 1px solid rgba(0, 0, 0, 0.06);
                        overflow: hidden;
                    }

                    .duxbed-splash-card-body {
                        padding: 2.5rem 3rem;
                        text-align: center;
                    }

                    .duxbed-splash-logo-wrap {
                        position: relative;
                        display: inline-block;
                        margin-bottom: 1rem;
                        overflow: hidden;
                        border-radius: 8px;
                    }
                    .duxbed-splash-logo-wrap::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        border-radius: 8px;
                        background: radial-gradient(circle at 30% 30%, rgba(230, 155, 10, 0.2) 0%, transparent 60%);
                        animation: duxbed-sparkle 10.5s ease-in-out infinite;
                        pointer-events: none;
                    }
                    .duxbed-splash-logo-wrap::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 60%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
                        animation: duxbed-shimmer 2s ease-in-out infinite;
                        pointer-events: none;
                    }
                    .duxbed-splash-logo {
                        width: 160px;
                        height: auto;
                        display: block;
                        margin-left: auto;
                        margin-right: auto;
                        animation: duxbed-twinkle 2s ease-in-out infinite;
                    }
                    @keyframes duxbed-twinkle {
                        0%, 100% { opacity: 1; filter: brightness(1); }
                        50% { opacity: 0.92; filter: brightness(1.12); }
                    }
                    @keyframes duxbed-sparkle {
                        0%, 100% { opacity: 10.6; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.08); }
                    }
                    @keyframes duxbed-shimmer {
                        0% { left: -100%; }
                        100% { left: 150%; }
                    }

                    .duxbed-splash-tagline {
                        font-size: 0.9rem;
                        color: #6c757d;
                        margin-bottom: 1.5rem;
                        font-weight: 500;
                        letter-spacing: 0.02em;
                    }

                    .duxbed-splash-spinner {
                        width: 2.5rem;
                        height: 2.5rem;
                        border-radius: 50%;
                        border: 3px solid #e9ecef;
                        border-top-color: #E69B0A;
                        animation: duxbed-spin 0.9s linear infinite;
                        margin: 0 auto;
                    }

                    @keyframes duxbed-spin {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    .gallery-modal-overlay {
                        animation: fadeIn 0.3s ease-in-out;
                    }

                    .gallery-modal-content {
                        animation: slideUp 0.4s ease-out;
                    }

                    /* Custom scrollbar for thumbnail navigation */
                    .gallery-modal-content div::-webkit-scrollbar {
                        height: 6px;
                    }

                    .gallery-modal-content div::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                    }

                    .gallery-modal-content div::-webkit-scrollbar-thumb {
                        background: linear-gradient(90deg, #E69B0A 0%, #D48909 100%);
                        border-radius: 10px;
                    }

                    .gallery-modal-content div::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(90deg, #D48909 0%, #E69B0A 100%);
                    }

                    /* Zoom button positioning - Top left on hover */
                    .effect-hvr3 .project-view-btn {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 30px !important;
                        height: 30px !important;
                        background-color: #E69B0A !important;
                        border-radius: 50% !important;
                        opacity: 0;
                        transform: translate3d(-100%, 0, 0);
                        transition: opacity 0.35s, transform 0.8s;
                    }

                    .effect-hvr3:hover .project-view-btn {
                        opacity: 1 !important;
                        transform: translate3d(0, 0, 0) !important;
                    }

                    /* Clean, modern layout for collections carousel */
                    .pro-filtr-cate-bx {
                        position: relative;
                        padding: 32px 18px 40px;
                        border-radius: 24px;
                        background: linear-gradient(135deg, #f6f6f6 0%, #ffffff 40%, #f6f7fb 100%);
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                    }

                    .collection-card {
                        position: relative;
                        border-radius: 22px;
                        overflow: hidden;
                        background-color: #ffffff;
                        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
                        transition: transform 0.25s ease, box-shadow 0.25s ease;
                    }

                    .collection-card .effect-sarah {
                        border-radius: 22px;
                        overflow: hidden;
                    }

                    .collection-card .effect-sarah img {
                        display: block;
                        width: 100%;
                        height: auto;
                        transform-origin: center;
                        transition: transform 0.45s ease;
                    }

                    .collection-card:hover {
                        transform: translateY(-6px);
                        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.12);
                    }

                    .collection-card:hover .effect-sarah img {
                        transform: scale(1.04);
                    }

                    .collection-card .effect-hvr3-inner {
                        position: absolute;
                        left: 16px;
                        right: 16px;
                        bottom: 14px;
                        padding: 10px 14px;
                        border-radius: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        background: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.15));
                        color: #ffffff;
                    }

                    .collection-card .wt-title {
                        margin: 0;
                        font-size: 14px;
                        font-weight: 600;
                        color: #ffffff;
                        text-transform: capitalize;
                    }

                    .collection-card .wt-title a {
                        color: inherit;
                        text-decoration: none;
                    }
                    .collection-card .wt-title a:hover {
                        color: #c48408;
                    }

                    .collection-card .site-button-icon {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        background-color: #ffffff;
                        color: #E69B0A;
                    }

                    @media (max-width: 767.98px) {
                        .pro-filtr-cate-bx {
                            padding: 20px 12px 28px;
                            border-radius: 20px;
                        }

                        .collection-card {
                            border-radius: 18px;
                        }

                        .collection-card .effect-hvr3-inner {
                            left: 10px;
                            right: 10px;
                            bottom: 10px;
                            padding: 8px 12px;
                            border-radius: 12px;
                        }
                    }

                    /* Leadership cards: whole card clickable, hover polish */
                    .leadership-card-link {
                        cursor: pointer;
                        outline: none;
                    }
                    /* MD card – separate CSS */
                    .leadership-card-md .leadership-card-md-inner {
                        /* MD-specific overrides go here */
                    }
                    .leadership-card-md .leadership-card-link:hover .leadership-card-md-inner,
                    .leadership-card-md .leadership-card-link:focus-visible .leadership-card-md-inner {
                        box-shadow: 0 16px 40px rgba(0,0,0,0.12);
                        transform: translateY(-4px);
                    }
                    /* Other three (CEO, COO, CFO) – separate CSS */
                    .leadership-card-member .leadership-card-member-inner {
                        /* Member-specific overrides go here */
                    }
                    .leadership-card-member .leadership-card-link:hover .leadership-card-member-inner,
                    .leadership-card-member .leadership-card-link:focus-visible .leadership-card-member-inner {
                        box-shadow: 0 16px 40px rgba(0,0,0,0.12);
                        transform: translateY(-4px);
                    }

                    .effect-hvr3 .project-view-btn i,
                    .effect-hvr3 .project-view-btn .bi {
                        color: #fff !important;
                        font-size: 18px !important; /* ✅ ICON SIZE: 18px to fit 30px button */
                    }

                    /* Fix Swiper navigation buttons - Ensure they are clickable */
                    .pro-filtr-cate-bx .swiper-button-next,
                    .pro-filtr-cate-bx .swiper-button-prev {
                        position: absolute !important;
                        z-index: 1000 !important;
                        cursor: pointer !important;
                        pointer-events: auto !important;
                        user-select: none !important;
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        touch-action: manipulation !important;
                        -webkit-tap-highlight-color: transparent !important;
                    }

                    .pro-filtr-cate-bx .swiper-button-next {
                        right: 0 !important;
                    }

                    .pro-filtr-cate-bx .swiper-button-prev {
                        left: 0 !important;
                    }

                    /* Only disable when truly disabled (at loop boundaries) */
                    .pro-filtr-cate-bx .swiper-button-next.swiper-button-disabled,
                    .pro-filtr-cate-bx .swiper-button-prev.swiper-button-disabled {
                        opacity: 0.35 !important;
                        cursor: not-allowed !important;
                        pointer-events: none !important;
                    }

                    /* Ensure buttons are always clickable when not disabled */
                    .pro-filtr-cate-bx .swiper-button-next:not(.swiper-button-disabled),
                    .pro-filtr-cate-bx .swiper-button-prev:not(.swiper-button-disabled) {
                        pointer-events: auto !important;
                        cursor: pointer !important;
                        opacity: 1 !important;
                    }
                `}</style>
            </div>
        </>
    );
}