import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NavLink } from "react-router-dom";
import { publicApiCall, API_ENDPOINTS } from '../config/api';

export default function OurStory() {
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.content.storyTimeline);
                if (response && response.success && response.data) {
                    setTimeline(response.data);
                }
            } catch (error) {
                console.error('Error fetching timeline:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, []);

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
                                    <h2 className="wt-title" style={{ color: '#010101' }}>Our Story</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full twm-product-v-scroll-wrap">
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer" style={{ marginTop: '60px', marginBottom: '40px' }}>
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Timeline</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Our Journey</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    From humble beginnings to becoming a trusted name in furniture and interior solutions, discover the milestones that shaped Duxbed into what it is today.
                                </p>
                            </div>

                            <div className="locker">
                                <div className="locker__image">
                                    {timeline.length > 0 ? timeline.map((event, index) => (
                                        <div key={event.id} className="locker__container">
                                            {/* <div className="locker-title" style={index >= 2 ? { lineHeight: '55pt', marginLeft: '120px' } : {}}>
                                                {event.title}
                                            </div> */}
                                            <img 
                                                className={`image image--${index + 1}`} 
                                                src={event.image_url || `images/scroll${index + 1}.png`} 
                                                alt={event.title} 
                                            />
                                        </div>
                                    )) : (
                                        <>
                                            <div className="locker__container">
                                                <div className="locker-title">Foundation</div>
                                                <img className="image image--1" src="images/scroll1.png" alt="Foundation" />
                                            </div>
                                            <div className="locker__container">
                                                <div className="locker-title">Transformation</div>
                                                <img className="image image--2" src="images/scroll1.png" alt="Transformation" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="locker__content">
                                    {timeline.length > 0 ? timeline.map((event, index) => (
                                        <div
                                            key={event.id}
                                            className={`locker__section locker__section--${index + 1} cb`}
                                            data-swap={`image--${index + 1}`}
                                        >
                                            <div className="twm-product-v-scroll-bx">
                                                <div className="twm-product-v-image-on-responsive">
                                                    <img src={event.image_url || `images/scroll${index + 1}.png`} alt={event.title} />
                                                </div>
                                                <h3
                                                    className="twm-product-v-scroll-title"
                                                    style={{
                                                        fontSize: '26px',
                                                        fontWeight: 700,
                                                        color: '#010101',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    <a href="#!" style={{ color: '#010101', textDecoration: 'none' }}>
                                                        {event.title || event.year}
                                                    </a>
                                                </h3>
                                                <div
                                                    className="twm-product-v-scroll-count"
                                                    style={{
                                                        fontSize: '60px',
                                                        fontWeight: 700,
                                                        color: '#E69B0A',
                                                        marginBottom: '12px',
                                                    }}
                                                >
                                                    {event.year}
                                                </div>
                                                <div className="twm-product-v-scroll-content">
                                                    <p style={{ margin: 0 }}>
                                                        {event.description || 'No description available.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        // Fallback content with same layout
                                        <div className="locker__section locker__section--1 cb" data-swap="image--1">
                                            <div className="twm-product-v-scroll-bx">
                                                <div className="twm-product-v-image-on-responsive">
                                                    <img src="images/scroll1.png" alt="Foundation" />
                                                </div>
                                                <h3
                                                    className="twm-product-v-scroll-title"
                                                    style={{
                                                        fontSize: '26px',
                                                        fontWeight: 700,
                                                        color: '#010101',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    <a href="#!" style={{ color: '#010101', textDecoration: 'none' }}>
                                                        The Foundation
                                                    </a>
                                                </h3>
                                                <div
                                                    className="twm-product-v-scroll-count"
                                                    style={{
                                                        fontSize: '60px',
                                                        fontWeight: 700,
                                                        color: '#E69B0A',
                                                        marginBottom: '12px',
                                                    }}
                                                >
                                                    2009
                                                </div>
                                                <div className="twm-product-v-scroll-content">
                                                    <p style={{ margin: 0 }}>
                                                        Duxbed was founded in 2009 with a vision to transform houses into dream homes.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Looking Forward</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Our Future Vision</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    As we look ahead, Duxbed remains committed to innovation, quality, and customer satisfaction. We envision becoming a leading name in the furniture industry, continuing to transform spaces and enrich lives through beautiful, functional furniture solutions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />

                <button className="scroltop" aria-label="Scroll to top">
                    <span className="bi bi-chevron-up relative" id="btn-vibrate"></span>
                </button>
            </div>
        </>
    );
}