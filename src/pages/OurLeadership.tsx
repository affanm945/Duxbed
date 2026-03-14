import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

export default function OurLeadership() {
    const [leadership, setLeadership] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeadership = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.content.leadership);
                if (response && response.success && response.data) {
                    setLeadership(response.data);
                } else {
                    // Fallback to default leadership
                    setLeadership([
                        {
                            name: 'Mohan Kumar',
                            position: 'CEO',
                            image_url: 'images/testimonials/testi4.png',
                            bio: 'Leading Duxbed with a vision to transform homes through quality furniture and exceptional service.'
                        },
                        {
                            name: 'Mohan Kumar',
                            position: 'Vice Chairman',
                            image_url: 'images/testimonials/testi4.png',
                            bio: 'Driving strategic growth and expansion initiatives across all business segments.'
                        },
                        {
                            name: 'Mohan Kumar',
                            position: 'Director',
                            image_url: 'images/testimonials/testi4.png',
                            bio: 'Overseeing operations and ensuring excellence in product quality and customer experience.'
                        },
                        {
                            name: 'Mohan Kumar',
                            position: 'Director',
                            image_url: 'images/testimonials/testi4.png',
                            bio: 'Managing design innovation and maintaining our commitment to aesthetic excellence.'
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching leadership:', error);
                // Use fallback on error
                setLeadership([
                    {
                        name: 'Mohan Kumar',
                        position: 'CEO',
                        image_url: 'images/testimonials/testi4.png',
                        bio: 'Leading Duxbed with a vision to transform homes through quality furniture and exceptional service.'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchLeadership();
    }, []);

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
                                    <h2 className="wt-title" style={{ color: '#010101' }}>Our Leadership</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b0" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Leadership Philosophy</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Guiding Principles</h2>
                                <div className="row justify-content-center mt-5">
                                    <div className="col-lg-10">
                                        <div className="row">
                                            <div className="col-md-4 m-b30">
                                                <div className="text-center">
                                                    <div className="icon-lg mb-3">
                                                        <span className="icon-cell" style={{ color: '#E69B0A', fontSize: '48px' }}>
                                                            <i className="bi bi-lightbulb-fill"></i>
                                                        </span>
                                                    </div>
                                                    <h4 style={{ color: '#010101' }}>Innovation</h4>
                                                    <p style={{ color: '#666' }}>Constantly exploring new designs and technologies to enhance our products.</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4 m-b30">
                                                <div className="text-center">
                                                    <div className="icon-lg mb-3">
                                                        <span className="icon-cell" style={{ color: '#E69B0A', fontSize: '48px' }}>
                                                            <i className="bi bi-people-fill"></i>
                                                        </span>
                                                    </div>
                                                    <h4 style={{ color: '#010101' }}>Customer Focus</h4>
                                                    <p style={{ color: '#666' }}>Putting our customers at the heart of every decision we make.</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4 m-b30">
                                                <div className="text-center">
                                                    <div className="icon-lg mb-3">
                                                        <span className="icon-cell" style={{ color: '#E69B0A', fontSize: '48px' }}>
                                                            <i className="bi bi-award-fill"></i>
                                                        </span>
                                                    </div>
                                                    <h4 style={{ color: '#010101' }}>Excellence</h4>
                                                    <p style={{ color: '#666' }}>Striving for excellence in quality, service, and customer satisfaction.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b0" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Our Leadership</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Leading the Way</h2>
                            </div>
                            <div className="section-content">
                                {(() => {
                                    const leaders = leadership.length > 0 ? leadership.slice(0, 4) : [
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
                        <style>{`
                            .leadership-card-link { cursor: pointer; outline: none; }
                            .leadership-card-link:hover .leadership-card,
                            .leadership-card-link:focus-visible .leadership-card {
                                box-shadow: 0 16px 40px rgba(0,0,0,0.12);
                                transform: translateY(-4px);
                            }
                        `}</style>
                    </div>

                    {/* Our Navigators - same Leading the Way card style */}
                    <div className="section-full p-t120 p-b0" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Our Navigators</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Our Navigators</h2>
                            </div>
                            <div className="section-content">
                                <div className="row justify-content-center">
                                    {[
                                        { title: 'R&D Head', name: 'Mr. Muhammed Shibil', image: 'images/testimonials/7.png' },
                                        { title: 'Marketing Head', name: 'Mr. Hamza Fahiz', image: 'images/testimonials/8.png' },
                                        { title: 'HR Head', name: 'Mrs. Risa Rahman', image: 'images/testimonials/9.png' },
                                    ].map((nav, idx) => (
                                        <div key={idx} className="col-xl-4 col-lg-4 col-md-6 m-b30">
                                            <div
                                                className="text-center"
                                                style={{
                                                    borderRadius: '20px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    backgroundColor: '#FFFFFF',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor: '#E69B0A',
                                                        padding: '28px 22px 0',
                                                        display: 'flex',
                                                        alignItems: 'flex-end',
                                                        justifyContent: 'center',
                                                        minHeight: '230px',
                                                    }}
                                                >
                                                    <div style={{ width: '100%', maxWidth: '210px', lineHeight: 0 }}>
                                                        <img
                                                            src={nav.image}
                                                            alt={nav.name}
                                                            style={{ width: '100%', height: 'auto', display: 'block' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        padding: '18px 18px 22px',
                                                        textAlign: 'center',
                                                        backgroundColor: '#FFFFFF',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: '14px',
                                                            fontWeight: 700,
                                                            color: '#010101',
                                                            letterSpacing: '0.18em',
                                                            marginBottom: '6px',
                                                        }}
                                                    >
                                                        {nav.title}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '15px',
                                                            fontWeight: 500,
                                                            color: '#111111',
                                                            marginBottom: '10px',
                                                        }}
                                                    >
                                                        {nav.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            width: '40px',
                                                            height: '2px',
                                                            backgroundColor: '#111111',
                                                            margin: '0 auto',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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