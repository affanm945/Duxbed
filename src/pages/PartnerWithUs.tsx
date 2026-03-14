import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NavLink } from 'react-router-dom';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

export default function PartnerWithUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        district: '',
        pincode: '',
        spaceAvailability: ''
    });
    const [eligibilityStatus, setEligibilityStatus] = useState<'pending' | 'eligible' | 'not-eligible' | 'checking'>('pending');
    const [eligibilityMessage, setEligibilityMessage] = useState<string>('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [eligibleDistricts, setEligibleDistricts] = useState<{ district: string; state: string }[]>([]);

    React.useEffect(() => {
        publicApiCall(API_ENDPOINTS.partnership.eligibleDistricts, 'GET')
            .then((res) => {
                if (res.success && Array.isArray(res.districts)) setEligibleDistricts(res.districts);
            })
            .catch(() => setEligibleDistricts([]));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const checkEligibility = async () => {
        if (!formData.location || !formData.district || !formData.pincode || !formData.spaceAvailability) {
            alert('Please fill in Location, District, Pincode, and Space Availability to check eligibility.');
            return;
        }
        if (!/^[0-9]{6}$/.test(formData.pincode)) {
            alert('Please enter a valid 6-digit pincode.');
            return;
        }

        setEligibilityStatus('checking');

        try {
            const response = await publicApiCall(API_ENDPOINTS.partnership.checkEligibility, 'POST', {
                district: formData.district,
                state: 'Kerala',
                space_availability: formData.spaceAvailability
            });
            
            if (response.success) {
                setEligibilityStatus(response.eligible ? 'eligible' : 'not-eligible');
                setEligibilityMessage(response.message || '');
            } else {
                setEligibilityStatus('not-eligible');
                setEligibilityMessage(response.message || 'Your location or space does not meet our requirements.');
            }
        } catch (error) {
            console.error('Eligibility check error:', error);
            setEligibilityStatus('not-eligible');
            setEligibilityMessage('Unable to check eligibility. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (eligibilityStatus !== 'eligible') {
            alert('Please ensure your location is eligible before submitting.');
            return;
        }

        try {
            const response = await publicApiCall(API_ENDPOINTS.partnership.submit, 'POST', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                district: formData.district,
                state: 'Kerala',
                pincode: formData.pincode,
                space_availability: formData.spaceAvailability
            });
            
            if (response.success) {
                setSubmitSuccess(true);
                
                // Reset form after 5 seconds
                setTimeout(() => {
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        location: '',
                        district: '',
                        pincode: '',
                        spaceAvailability: ''
                    });
                    setEligibilityStatus('pending');
                    setEligibilityMessage('');
                    setSubmitSuccess(false);
                }, 5000);
            } else {
                alert('Error: ' + response.message);
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit. Please try again.');
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
                                    <h2 className="wt-title" style={{ color: '#010101' }}>Partner With Us</h2>
                                </div>
                            </div>
                        </div>

                <div className="section-full p-b120" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="container">
                        <div className="section-head center wt-small-separator-outer">
                            <div className="wt-small-separator site-text-primary">
                                <i className="bi bi-envelope" style={{ padding: '2px 0px 6px 6px' }}></i>
                                <div style={{ color: '#A6A6A6' }}>Need more details?</div>
                            </div>
                            <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Talk to our Partnership Team</h2>
                            <p style={{ color: '#A6A6A6', maxWidth: '700px', margin: '20px auto' }}>
                                If you have questions about requirements, investment, or the onboarding process, our team is happy to guide you.
                            </p>
                        </div>
                        <div className="text-center">
                            <NavLink
                                to="/contact"
                                className="site-button"
                                style={{
                                    color: '#FFFFFF',
                                    background: 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)',
                                    border: 'none',
                                    minWidth: '240px',
                                    height: '50px',
                                    padding: '12px 30px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(230, 155, 10, 0.3)'
                                }}
                            >
                                Contact Us
                                <i className="bi bi-arrow-right" />
                            </NavLink>
                        </div>
                    </div>
                </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Franchise Opportunity</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Wish to Partner With Us?</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    Join the Duxbed family and become part of our growing network. Fill out the form below to check your eligibility and start your partnership journey.
                                </p>
                            </div>

                            <div className="section-content mt-5">
                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        <div className="partner-form-wrapper" style={{
                                            backgroundColor: '#f7f7f7',
                                            padding: '40px',
                                            borderRadius: '10px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            {submitSuccess ? (
                                                <div className="success-message text-center" style={{
                                                    padding: '40px',
                                                    backgroundColor: '#d4edda',
                                                    borderRadius: '10px',
                                                    border: '1px solid #c3e6cb'
                                                }}>
                                                    <i className="bi bi-check-circle-fill" style={{ fontSize: '64px', color: '#28a745', marginBottom: '20px' }}></i>
                                                    <h3 style={{ color: '#155724', marginBottom: '15px' }}>Application Submitted Successfully!</h3>
                                                    <p style={{ color: '#155724' }}>
                                                        Thank you for your interest in partnering with Duxbed. Our team will review your application and contact you shortly.
                                                    </p>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleSubmit}>
                                                    <div className="row">
                                                        <div className="col-md-6 m-b30">
                                                            <label htmlFor="name" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                                Full Name *
                                                            </label>
                                                            <input
                                                                id="name"
                                                                type="text"
                                                                name="name"
                                                                className="form-control"
                                                                value={formData.name}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder="Enter your full name"
                                                                style={{
                                                                    height: '50px',
                                                                    borderColor: '#E69B0A',
                                                                    borderRadius: '5px'
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-md-6 m-b30">
                                                            <label htmlFor="email" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                                Email Address *
                                                            </label>
                                                            <input
                                                                id="email"
                                                                type="email"
                                                                name="email"
                                                                className="form-control"
                                                                value={formData.email}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder="Enter your email address"
                                                                style={{
                                                                    height: '50px',
                                                                    borderColor: '#E69B0A',
                                                                    borderRadius: '5px'
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-md-6 m-b30">
                                                            <label htmlFor="phone" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                                Phone Number *
                                                            </label>
                                                            <input
                                                                id="phone"
                                                                type="tel"
                                                                name="phone"
                                                                className="form-control"
                                                                value={formData.phone}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder="Enter your phone number"
                                                                style={{
                                                                    height: '50px',
                                                                    borderColor: '#E69B0A',
                                                                    borderRadius: '5px'
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-md-6 m-b30">
                                                            <label htmlFor="location" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                                Location *
                                                            </label>
                                                            <input
                                                                id="location"
                                                                type="text"
                                                                name="location"
                                                                className="form-control"
                                                                value={formData.location}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder="Enter your location"
                                                                style={{
                                                                    height: '50px',
                                                                    borderColor: '#E69B0A',
                                                                    borderRadius: '5px'
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-md-6 m-b30">
                                                            <label htmlFor="district" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                                District (where our team is available) *
                                                            </label>
                                                            <select
                                                                id="district"
                                                                name="district"
                                                                className="form-control"
                                                                value={formData.district}
                                                                onChange={handleChange}
                                                                required
                                                                style={{
                                                                    height: '50px',
                                                                    borderColor: '#E69B0A',
                                                                    borderRadius: '5px'
                                                                }}
                                                            >
                                                                <option value="">Select your district</option>
                                                                {eligibleDistricts.map((d) => (
                                                                    <option key={`${d.state}-${d.district}`} value={d.district}>{d.district} ({d.state})</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="col-md-6 m-b30">
                                                            <label htmlFor="spaceAvailability" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                                Space Availability (sqft) *
                                                            </label>
                                                            <input
                                                                id="spaceAvailability"
                                                                type="number"
                                                                name="spaceAvailability"
                                                                className="form-control"
                                                                value={formData.spaceAvailability}
                                                                onChange={handleChange}
                                                                required
                                                                min="500"
                                                                placeholder="Minimum 1000 sqft"
                                                                style={{
                                                                    height: '50px',
                                                                    borderColor: '#E69B0A',
                                                                    borderRadius: '5px'
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-md-6 m-b30">
                                                            <label htmlFor="pincode" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                                Pincode *
                                                            </label>
                                                            <input
                                                                id="pincode"
                                                                type="text"
                                                                name="pincode"
                                                                className="form-control"
                                                                value={formData.pincode}
                                                                onChange={handleChange}
                                                                required
                                                                pattern="[0-9]{6}"
                                                                maxLength={6}
                                                                placeholder="Enter 6-digit pincode"
                                                                style={{
                                                                    height: '50px',
                                                                    borderColor: '#E69B0A',
                                                                    borderRadius: '5px'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="button-row mt-4 mb-4">
                                                        <div className="row">
                                                            <div className="col-md-12 m-b20">
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {eligibilityStatus === 'eligible' ? (
                                                                        <button
                                                                            type="submit"
                                                                            className="site-button"
                                                                            style={{
                                                                                color: '#FFFFFF',
                                                                                background: 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)',
                                                                                border: 'none',
                                                                                width: 'auto',
                                                                                minWidth: '250px',
                                                                                height: '50px',
                                                                                padding: '12px 30px',
                                                                                fontSize: '16px',
                                                                                fontWeight: '600',
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '1px',
                                                                                borderRadius: '8px',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.3s ease',
                                                                                boxShadow: '0 4px 15px rgba(230, 155, 10, 0.3)',
                                                                                position: 'relative',
                                                                                overflow: 'hidden',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gap: '8px'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.currentTarget.style.background = 'linear-gradient(135deg, #D48909 0%, #E69B0A 100%)';
                                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 155, 10, 0.4)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.currentTarget.style.background = 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)';
                                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 155, 10, 0.3)';
                                                                            }}
                                                                        >
                                                                            Submit Application
                                                                            <i className="bi bi-arrow-right"></i>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={checkEligibility}
                                                                            className="site-button"
                                                                            style={{
                                                                                color: '#FFFFFF',
                                                                                background: 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)',
                                                                                border: 'none',
                                                                                width: 'auto',
                                                                                minWidth: '250px',
                                                                                height: '50px',
                                                                                padding: '12px 30px',
                                                                                borderRadius: '8px',
                                                                                fontSize: '16px',
                                                                                fontWeight: '600',
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '1px',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.3s ease',
                                                                                boxShadow: '0 4px 15px rgba(230, 155, 10, 0.3)',
                                                                                position: 'relative',
                                                                                overflow: 'hidden'
                                                                            }}
                                                                            disabled={eligibilityStatus === 'checking'}
                                                                            onMouseEnter={(e) => {
                                                                                if (!e.currentTarget.disabled) {
                                                                                    e.currentTarget.style.background = 'linear-gradient(135deg, #D48909 0%, #E69B0A 100%)';
                                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 155, 10, 0.4)';
                                                                                }
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                if (!e.currentTarget.disabled) {
                                                                                    e.currentTarget.style.background = 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)';
                                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 155, 10, 0.3)';
                                                                                }
                                                                            }}
                                                                        >
                                                                            {eligibilityStatus === 'checking' ? (
                                                                                <>
                                                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                                    Checking Eligibility...
                                                                                </>
                                                                            ) : (
                                                                                'Check Eligibility'
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="eligibility-status-section mt-3 mb-3">
                                                        {eligibilityStatus === 'eligible' && (
                                                            <div style={{
                                                                padding: '15px',
                                                                backgroundColor: '#d4edda',
                                                                borderRadius: '5px',
                                                                border: '1px solid #c3e6cb'
                                                            }}>
                                                                <i className="bi bi-check-circle-fill me-2" style={{ color: '#28a745' }}></i>
                                                                <strong style={{ color: '#155724' }}>Great! Your location is eligible.</strong>
                                                                <p style={{ color: '#155724', marginTop: '10px', marginBottom: '0' }}>
                                                                    Please proceed to submit your application. Our team will contact you with the next steps.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {eligibilityStatus === 'not-eligible' && (
                                                            <div style={{
                                                                padding: '15px',
                                                                backgroundColor: '#f8d7da',
                                                                borderRadius: '5px',
                                                                border: '1px solid #f5c6cb'
                                                            }}>
                                                                <i className="bi bi-exclamation-circle-fill me-2" style={{ color: '#dc3545' }}></i>
                                                                <strong style={{ color: '#721c24' }}>Location currently not eligible.</strong>
                                                                <p style={{ color: '#721c24', marginTop: '10px', marginBottom: '0' }}>
                                                                    {eligibilityMessage || 'Your location or space availability doesn\'t meet our current requirements. Please contact our franchise team for more information.'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="form-footer text-center">
                                                        <p style={{ color: '#666', fontSize: '14px', marginTop: '15px' }}>
                                                            For inquiries, please email us at: <a href="mailto:info@duxbed.in" style={{ color: '#E69B0A' }}>info@duxbed.in</a>
                                                        </p>
                                                    </div>
                                                </form>
                                            )}
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

