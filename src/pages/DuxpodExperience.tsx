import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NavLink } from 'react-router-dom';

export default function DuxpodExperience() {
    const [logoError, setLogoError] = useState(false);

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
                                    <h2
                                        className="wt-title d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 gap-md-3"
                                        style={{ background: 'transparent', fontSize: '1.5rem', color: '#010101' }}
                                    >
                                        {!logoError ? (
                                            <img
                                                src="/images/pode logo1.png"
                                                alt="Duxpod - Modular Resort Pods"
                                                style={{
                                                    height: '1.75em',
                                                    minHeight: 28,
                                                    width: 'auto',
                                                    objectFit: 'contain',
                                                    display: 'inline-block',
                                                    verticalAlign: 'middle'
                                                }}
                                                className="duxpod-banner-logo"
                                                onError={() => setLogoError(true)}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 700 }}>
                                                Duxpod
                                            </span>
                                        )}
                                        <span style={{ fontWeight: 450 }}>
                                            – Modular Resort Pods
                                        </span>
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="section-full p-t120 p-b60" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Duxpod</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>
                                    Key Features
                                </h2>
                            </div>

                            <div className="row justify-content-center">
                                <div className="col-lg-3 col-md-6 m-b30">
                                    <div style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 16,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                                        padding: '24px 20px',
                                        height: '100%'
                                    }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#010101' }}>
                                            Mobility & Setup
                                        </h3>
                                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                            Factory-built for easy transport and plug-and-play installation, with no heavy construction required.
                                        </p>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-md-6 m-b30">
                                    <div style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 16,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                                        padding: '24px 20px',
                                        height: '100%'
                                    }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#010101' }}>
                                            Ambient Interiors
                                        </h3>
                                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                            Sleek, modern furnishings with panoramic glass views, premium bedding, and customizable modular elements from Duxbed.
                                        </p>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-md-6 m-b30">
                                    <div style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 16,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                                        padding: '24px 20px',
                                        height: '100%'
                                    }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#010101' }}>
                                            Four Color Variants
                                        </h3>
                                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                            Choose from four signature color options to perfectly match your resort or site aesthetic.
                                        </p>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-md-6 m-b30">
                                    <div style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 16,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                                        padding: '24px 20px',
                                        height: '100%'
                                    }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#010101' }}>
                                            Weather-Resistant Design
                                        </h3>
                                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                            Durable outer shell with insulation engineered for all-season comfort and performance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resort Amenities */}
                    <div className="section-full p-t20 p-b90" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6 col-md-12 m-b30">
                                    <div style={{
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        boxShadow: '0 12px 35px rgba(0,0,0,0.12)'
                                    }}>
                                        <img
                                            src="images/project-3/duxpod-hero.png"
                                            alt="Duxpod pod exterior"
                                            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>

                                <div className="col-lg-6 col-md-12">
                                    <div className="section-head left wt-small-separator-outer">
                                        <div className="wt-small-separator" style={{ color: '#A6A6A6' }}>
                                            <i className="bi bi-house"></i>
                                            <div>Resort Amenities</div>
                                        </div>
                                        <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>
                                            4–5 Star Comfort in a Compact Pod
                                        </h2>
                                        <p style={{ color: '#666666', marginBottom: 20 }}>
                                            Duxpod provides complete facilities mirroring a 4–5 star resort experience inside a single, self-contained module.
                                        </p>
                                    </div>
                                    <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, color: '#666666', fontSize: 14, lineHeight: 1.7 }}>
                                        <li style={{ marginBottom: 8 }}>• En-suite bathroom with shower, sink, and toilet.</li>
                                        <li style={{ marginBottom: 8 }}>• Compact kitchenette with dining.</li>
                                        <li style={{ marginBottom: 8 }}>• Lounge area with comfortable seating.</li>
                                        <li style={{ marginBottom: 8 }}>• Outdoor deck for open-air relaxation.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ideal Applications */}
                    <div className="section-full p-t20 p-b90" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Ideal Applications</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>
                                    Where Duxpod Works Best
                                </h2>
                                <p style={{ color: '#666666', maxWidth: 800, margin: '20px auto' }}>
                                    Perfect for resort owners expanding capacity quickly with low ROI timelines.
                                </p>
                            </div>

                            <div className="row justify-content-center">
                                <div className="col-lg-4 col-md-6 m-b30">
                                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: '24px 22px', height: '100%' }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#010101' }}>
                                            Luxury Glamping & Eco‑Tourism
                                        </h3>
                                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                            Create premium glamping clusters or eco‑friendly stays in scenic locations with minimal site disturbance.
                                        </p>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-md-6 m-b30">
                                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: '24px 22px', height: '100%' }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#010101' }}>
                                            Farm Stays & Corporate Retreats
                                        </h3>
                                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                            Add high-end rooms to farms, estates, or retreat venues without long construction timelines.
                                        </p>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-md-6 m-b30">
                                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: '24px 22px', height: '100%' }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#010101' }}>
                                            Boutique Homestays
                                        </h3>
                                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                            Scale premium rooms for boutique homestays while keeping a consistent, design‑forward guest experience.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center m-t20">
                                <NavLink to="/duxpod" className="site-button" style={{ color: '#FFFFFF', backgroundColor: '#E69B0A', borderColor: '#E69B0A' }}>
                                    View Duxpod Products
                                </NavLink>
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

