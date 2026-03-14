import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NavLink } from "react-router-dom";
import { publicApiCall, API_ENDPOINTS } from '../config/api';

interface Brochure {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_size: number;
    file_type: string;
    sector: string;
    download_count: number;
    download_url: string;
    created_at: string;
}

export default function WhatWeDo() {
    const [brochures, setBrochures] = useState<Brochure[]>([]);
    const [loading, setLoading] = useState(true);

    const sectors = [
        {
            title: 'Space saving furniture',
            description: 'Space-saving furniture maximizes utility in compact living areas by combining multiple functions into single pieces or using clever mechanisms like folding, stacking, or vertical mounting.These designs address urban space constraints, particularly relevant for homes in populated area, where apartments and modular furniture production is common. They promote organization, reduce clutter, and enhance room flow without sacrificing style or comfort.',
            image: 'images/icons/furniture-2.png',
            link: '/space-saving-furniture'
        },
        {
            title: 'Duxpod',
            description: 'Duxpods are portable resort units developed by Duxbed that combine modular architecture, luxury interiors, and mobility to create a complete plug‑and‑play hospitality space. Each unit functions as a self-contained premium room or mini-suite that can be transported, installed, and relocated with minimal site work, making it ideal for resorts, eco-stays, and boutique properties looking to expand quickly or seasonally.',
            image: 'images/icons/kitchen-icon1.png',
            link: '/duxpod-experience'
        },
        {
            title: 'Interior designing',
            description: 'We transforms living spaces into functional, aesthetically pleasing environments by blending creativity, architecture, and user needs through careful planning of layouts, materials, colors, and furnishings. It encompasses everything from conceptualizing room flows to selecting finishes, ensuring harmony between form and utility. Personalized interior design stands out as a core strength here, tailoring every element to individual lifestyles for truly unique, resonant home.',
            image: 'images/icons/curtain.png',
            link: '/interior-designing'
        },
        {
            title: 'Modular kitchen',
            description: 'Modular furniture consists of interchangeable, standardized components that assemble into customizable configurations,allowing easy reconfiguration, expansion, or disassembly for versatile use in homes and offices. This design excels in space optimization, aligning perfectly with space-saving needs in compact Kerala residences, and supports modern, personalized interior schemes through adaptable layouts. At Duxbed, we lead the industry by designing and constructing these pieces at the cheapest rates with unmatched quality, using a durable steel-wood combination for strength and elegance.',
            image: 'images/icons/Modular-Kitchen.png',
            link: '/modular-kitchen'
        }
    ];

    // Fetch brochures from API
    useEffect(() => {
        const fetchBrochures = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.brochures.list);

                if (response && response.success && response.data) {
                    setBrochures(response.data);
                } else {
                    console.warn('No brochures found or API error:', response);
                }
            } catch (error) {
                console.error('Error fetching brochures:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrochures();
    }, []);

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Handle brochure download
    const handleDownload = (brochure: Brochure) => {
        window.open(brochure.download_url, '_blank');
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
                                    <h2 className="wt-title" style={{ color: '#010101' }}>What We Do</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Our Business Domains</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Our Sectors</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    At Duxbed, we design, manufacture, and deliver innovative space-saving and multi-utility furniture solutions that help people make better use of their living spaces. We specialize in foldable and muliti-functional beds that combine comfort, durability, and smart design, making them ideal for modern homes, apartments, and compact spaces.
                                </p>
                            </div>

                            <div className="section-content mt-5">
                                <div className="row g-4">
                                    {sectors.map((sector, index) => (
                                        <div key={index} className="col-lg-6 col-md-6">
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
                                                onClick={() => window.location.href = sector.link}
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
                                                        <img src={sector.image} alt={sector.title} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                                                    </div>
                                                </div>
                                                <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <h3 style={{
                                                        color: '#010101',
                                                        fontSize: '24px',
                                                        fontWeight: '600',
                                                        marginBottom: '15px',
                                                        transition: 'color 0.3s ease'
                                                    }}>{sector.title}</h3>
                                                    <p style={{
                                                        color: '#666',
                                                        fontSize: '15px',
                                                        lineHeight: '1.6',
                                                        marginBottom: '20px',
                                                        flex: 1
                                                    }}>{sector.description}</p>
                                                    <NavLink
                                                        to={sector.link}
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
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Brochures</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Download Our Brochures</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    Get detailed information about our products and services through our downloadable brochures.
                                </p>
                            </div>

                            <div className="section-content mt-5">
                                {loading ? (
                                    <div className="text-center" style={{ padding: '40px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p style={{ color: '#666', marginTop: '20px' }}>Loading brochures...</p>
                                    </div>
                                ) : brochures.length > 0 ? (
                                    <div className="row justify-content-center">
                                        {brochures.map((brochure) => (
                                            <div key={brochure.id} className="col-lg-4 col-md-6 m-b30">
                                                <div className="brochure-download-section" style={{
                                                    backgroundColor: '#FFFFFF',
                                                    padding: '30px',
                                                    borderRadius: '10px',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                    textAlign: 'center',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'transform 0.3s ease',
                                                    cursor: 'pointer'
                                                }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                    onClick={() => handleDownload(brochure)}
                                                >
                                                    <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: '64px', color: '#E69B0A', marginBottom: '20px' }}></i>
                                                    <h4 style={{ color: '#010101', marginBottom: '15px', fontSize: '20px' }}>
                                                        {brochure.title}
                                                    </h4>
                                                    {brochure.description && (
                                                        <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px', flexGrow: 1 }}>
                                                            {brochure.description}
                                                        </p>
                                                    )}
                                                    <div style={{ marginBottom: '20px' }}>
                                                        <span style={{
                                                            padding: '5px 15px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            backgroundColor: '#f7f7f7',
                                                            color: '#666',
                                                            display: 'inline-block',
                                                            marginRight: '10px'
                                                        }}>
                                                            {formatFileSize(brochure.file_size)}
                                                        </span>
                                                        {brochure.sector && (
                                                            <span style={{
                                                                padding: '5px 15px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                backgroundColor: '#E69B0A',
                                                                color: '#FFFFFF',
                                                                display: 'inline-block'
                                                            }}>
                                                                {brochure.sector}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="site-button"
                                                        style={{
                                                            color: '#FFFFFF',
                                                            backgroundColor: '#E69B0A',
                                                            borderColor: '#E69B0A',
                                                            width: '100%'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownload(brochure);
                                                        }}
                                                    >
                                                        <i className="bi bi-download me-2"></i>
                                                        Download PDF
                                                    </button>
                                                    {brochure.download_count > 0 && (
                                                        <p style={{ color: '#A6A6A6', fontSize: '12px', marginTop: '10px', marginBottom: '0' }}>
                                                            {brochure.download_count} download{brochure.download_count !== 1 ? 's' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center" style={{ padding: '40px' }}>
                                        <i className="bi bi-file-earmark-pdf" style={{ fontSize: '64px', color: '#A6A6A6', marginBottom: '20px' }}></i>
                                        <h4 style={{ color: '#010101', marginBottom: '15px' }}>No Brochures Available</h4>
                                        <p style={{ color: '#666' }}>
                                            Brochures will be available soon. Please check back later.
                                        </p>
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
        </>
    );
}