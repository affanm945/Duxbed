import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NavLink } from "react-router-dom";
import { publicApiCall, API_ENDPOINTS } from '../config/api';

export default function WhyDuxbed() {
    const [usps, setUsps] = useState<any[]>([]);
    const [awards, setAwards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch USPs
                const uspResponse = await publicApiCall(API_ENDPOINTS.content.whyDuxbed);
                if (uspResponse && uspResponse.success && uspResponse.data) {
                    setUsps(uspResponse.data);
                } else {
                    // Fallback to default USPs
                    setUsps([
                        {
                            icon: 'bi-tools',
                            title: 'Superior Craftsmanship',
                            description: 'Every piece is meticulously crafted by skilled artisans using premium materials and time-tested techniques.'
                        },
                        {
                            icon: 'bi-lightbulb',
                            title: 'Innovation',
                            description: 'We continuously innovate with new designs, materials, and manufacturing processes to stay ahead of trends.'
                        },
                        {
                            icon: 'bi-shield-check',
                            title: 'Premium Materials',
                            description: 'We use only the finest materials, ensuring durability and long-lasting beauty in every product.'
                        },
                        {
                            icon: 'bi-person-heart',
                            title: 'Service Excellence',
                            description: 'Our dedicated team provides exceptional customer service from consultation to after-sales support.'
                        },
                        {
                            icon: 'bi-trophy',
                            title: 'Awards & Recognition',
                            description: 'Our commitment to excellence has earned us numerous industry awards and customer satisfaction accolades.'
                        },
                        {
                            icon: 'bi-emoji-smile',
                            title: 'Customer Satisfaction',
                            description: 'Thousands of satisfied customers trust Duxbed for their furniture and interior needs.'
                        }
                    ]);
                }

                // Fetch Awards from Media API
                const awardResponse = await publicApiCall(`${API_ENDPOINTS.media.list}?type=award`);
                if (awardResponse && awardResponse.success && awardResponse.data) {
                    setAwards(awardResponse.data.map((award: any) => ({
                        title: award.title,
                        year: award.event_date ? new Date(award.event_date).getFullYear().toString() : award.created_at ? new Date(award.created_at).getFullYear().toString() : '2024',
                        description: award.description,
                        image_url: award.image_url
                    })));
                } else {
                    // Fallback to default awards
                    setAwards([
                        { title: 'Amma Official Furniture Partner Award', year: '2023' },
                        { title: 'MAA Recognition Award 2025', year: '2025' },
                        { title: 'Eagle Bizcon Award', year: '2024' },
                        { title: 'FIFEX Best Organiser Award', year: '2023' },
                        { title: 'Millionaire Kerala Mister Entrepreneur Award', year: '2024' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching Why Duxbed data:', error);
                // Use fallback data on error
                setUsps([
                    {
                        icon: 'bi-tools',
                        title: 'Superior Craftsmanship',
                        description: 'Every piece is meticulously crafted by skilled artisans using premium materials and time-tested techniques.'
                    },
                    {
                        icon: 'bi-lightbulb',
                        title: 'Innovation',
                        description: 'We continuously innovate with new designs, materials, and manufacturing processes to stay ahead of trends.'
                    },
                    {
                        icon: 'bi-shield-check',
                        title: 'Premium Materials',
                        description: 'We use only the finest materials, ensuring durability and long-lasting beauty in every product.'
                    },
                    {
                        icon: 'bi-person-heart',
                        title: 'Service Excellence',
                        description: 'Our dedicated team provides exceptional customer service from consultation to after-sales support.'
                    },
                    {
                        icon: 'bi-trophy',
                        title: 'Awards & Recognition',
                        description: 'Our commitment to excellence has earned us numerous industry awards and customer satisfaction accolades.'
                    },
                    {
                        icon: 'bi-emoji-smile',
                        title: 'Customer Satisfaction',
                        description: 'Thousands of satisfied customers trust Duxbed for their furniture and interior needs.'
                    }
                ]);
                setAwards([
                    { title: 'Amma Official Furniture Partner Award', year: '2023' },
                    { title: 'MAA Recognition Award 2025', year: '2025' },
                    { title: 'Eagle Bizcon Award', year: '2024' },
                    { title: 'FIFEX Best Organiser Award', year: '2023' },
                    { title: 'Millionaire Kerala Mister Entrepreneur Award', year: '2024' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                                    <h2 className="wt-title" style={{ color: '#010101' }}>Why Duxbed</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Our Advantages</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>What Makes Us Different</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    Discover the unique selling propositions that set Duxbed apart in the furniture industry.
                                </p>
                            </div>

                            <div className="section-content mt-5">
                                <div className="row">
                                    {usps.map((usp, index) => (
                                        <div key={usp.id || index} className="col-lg-4 col-md-6 m-b30">
                                            <div className="icon-box-style-three-wrap">
                                                <div className="icon-box-style-three">
                                                    <div className="wt-icon-box-wraper">
                                                        <div className="icon-lg">
                                                            <span className="icon-cell" style={{ color: '#E69B0A', fontSize: '48px' }}>
                                                                <i className={`bi ${usp.icon || 'bi-star'}`}></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="icon-box-three-title">
                                                        <h3 className="wt-title" style={{ color: '#010101' }}>{usp.title}</h3>
                                                    </div>
                                                    <div className="icon-box-three-content">
                                                        <p style={{ color: '#666' }}>{usp.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Recognition</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Awards & Achievements</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    Our commitment to excellence has been recognized through various industry awards and accolades.
                                </p>
                            </div>

                            <div className="section-content mt-5">
                                <div className="row justify-content-center">
                                    {awards.map((award, index) => (
                                        <div key={award.id || index} className="col-lg-4 col-md-6 m-b30">
                                            <div className="twm-acd-st-1-item" style={{
                                                backgroundColor: '#FFFFFF',
                                                padding: '30px',
                                                borderRadius: '10px',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                textAlign: 'center',
                                                minHeight: '200px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            }}>
                                                {award.image_url ? (
                                                    <div className="award-image mb-3">
                                                        <img src={award.image_url} alt={award.title} style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                                    </div>
                                                ) : (
                                                    <div className="award-icon mb-3">
                                                        <i className="bi bi-trophy-fill" style={{ fontSize: '48px', color: '#E69B0A' }}></i>
                                                    </div>
                                                )}
                                                <h4 style={{ color: '#010101', marginBottom: '10px' }}>{award.title}</h4>
                                                <span style={{ color: '#E69B0A', fontWeight: 'bold' }}>{award.year}</span>
                                                {award.description && (
                                                    <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>{award.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div> */}

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6 col-md-12 m-b30">
                                    <div className="section-head left wt-small-separator-outer">
                                        <div className="wt-small-separator site-text-primary">
                                            <i className="bi bi-house"></i>
                                            <div style={{ color: '#A6A6A6' }}>Customer Promise</div>
                                        </div>
                                        <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Our Commitment to You</h2>
                                        <p style={{ color: '#666' }}>
                                            At Duxbed, we don't just sell furniture – we create experiences. Our commitment to quality, innovation, and customer satisfaction drives everything we do. We promise to deliver:
                                        </p>
                                        <ul style={{ color: '#666', paddingLeft: '20px', marginTop: '20px' }}>
                                            <li style={{ marginBottom: '10px' }}>Premium quality products crafted with attention to detail</li>
                                            <li style={{ marginBottom: '10px' }}>Innovative designs that reflect contemporary trends</li>
                                            <li style={{ marginBottom: '10px' }}>Durable materials that stand the test of time</li>
                                            <li style={{ marginBottom: '10px' }}>Exceptional customer service at every step</li>
                                            <li style={{ marginBottom: '10px' }}>Competitive pricing without compromising on quality</li>
                                        </ul>
                                        <NavLink to="/what-we-do" className="site-button mt-4" style={{ 
                                            color: '#FFFFFF', 
                                            backgroundColor: '#E69B0A', 
                                            borderColor: '#E69B0A' 
                                        }}>
                                            Explore Our Products
                                        </NavLink>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 m-b30">
                                    <div className="company-exp">
                                        <div className="company-exp-media">
                                            <img src="images/about2/about-section.png" alt="Duxbed Quality" />
                                        </div>
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
        </>
    );
}