import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

type ContactDetails = {
    address_line1: string;
    address_line2: string;
    phone: string;
    email: string;
    whatsapp_number?: string;
};

export default function Contact() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);

    useEffect(() => {
        const fetchContactDetails = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.contactDetails.list);
                if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
                    setContactDetails(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching contact details for contact page:', error);
            }
        };

        fetchContactDetails();
    }, []);

    const contactAddress = contactDetails
        ? [contactDetails.address_line1, contactDetails.address_line2].filter(Boolean).join(', ')
        : 'Duxbed innovations Ltd, 2nd floor, Savion mall, Melattur, Malappuram dist-679326';
    const contactPhone = contactDetails?.phone || '+91 9495 097 926';
    const contactEmail = contactDetails?.email || 'info@duxbed.in';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await publicApiCall(API_ENDPOINTS.contact.submit, 'POST', formData);

            if (response?.success) {
                alert('Form submitted successfully. Our Team will contact you soon!');
                setFormData({
                    username: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            } else {
                alert(response?.message || 'Failed to submit your inquiry. Please try again.');
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            alert('Something went wrong while submitting the form. Please try again later.');
        }
    };

    return (
        <>
            <div className="cursor" style={{ display: 'none' }}></div>
            <div className="cursor2" style={{ display: 'none' }}></div>

            <div className="page-wraper">
                <Header />

                <div className="page-content">
                    <div className="wt-bnr-inr overlay-wraper bg-center">
                        <div className="overlay-main innr-bnr-olay"></div>
                        <div className="wt-bnr-inr-entry">
                            <div className="banner-title-outer">
                                <div className="banner-title-name">
                                    <h2 className="wt-title">Contact Us</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b10">
                        <div className="section-content">
                            <div className="container">
                                <div className="contact-one">
                                    <div className="c-info-column-media contact-hero-media">
                                        <img
                                            className="contact-hero-image"
                                            src="images/contact-img2.png"
                                            alt="Duxbed Kerala office reception and customer support interior design"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxWidth: '600px',
                                                display: 'block',
                                                margin: '0 auto 40px',
                                                objectFit: 'cover',
                                                borderRadius: '12px'
                                            }}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-xl-6 col-lg-6 col-md-12">
                                            <div className="c-info-column-wrap">
                                                <div className="section-head left wt-small-separator-outer">
                                                    <div className="wt-small-separator site-text-primary">
                                                        <i className="bi bi-house"></i>
                                                        <div>Contact Info</div>
                                                    </div>
                                                    <h2 className="wt-title title_split_anim">We are always ready to help you.</h2>
                                                </div>

                                                <div className="c-info-column">
                                                    <div className="c-info-icon">
                                                        <i className="bi bi-geo-alt"></i>
                                                    </div>
                                                    <div className="c-info-detail">
                                                        <span className="m-t0">Address info</span>
                                                        <p>{contactAddress}</p>
                                                    </div>
                                                </div>

                                                <div className="c-info-column">
                                                    <div className="c-info-icon">
                                                        <i className="bi bi-telephone"></i>
                                                    </div>
                                                    <div className="c-info-detail">
                                                        <span className="m-t0">Phone number</span>
                                                        <p>{contactPhone}</p>
                                                    </div>
                                                </div>

                                                <div className="c-info-column">
                                                    <div className="c-info-icon">
                                                        <i className="bi bi-envelope"></i>
                                                    </div>
                                                    <div className="c-info-detail">
                                                        <span className="m-t0">Email address</span>
                                                        <p>{contactEmail}</p>
                                                    </div>
                                                </div>

                                                <div className="c-info-column">
                                                    <div className="c-info-icon">
                                                        <i className="bi bi-door-open"></i>
                                                    </div>
                                                    <div className="c-info-detail">
                                                        <span className="m-t0">Open Hour</span>
                                                        <p>Mon - Sun (09.00 AM to 06.00 PM)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-xl-6 col-lg-6 col-md-12">
                                            <div className="contact-info-section">
                                                <div className="contact-form-outer">
                                                    <h3 className="wt-title">Get in touch !</h3>
                                                    <p>
                                                        Let's connect and make our process seamless. Our team is always ready and happy to help you with all your queries and needs.
                                                    </p>

                                                    <form className="cons-contact-form" onSubmit={handleSubmit}>
                                                        <div className="row">
                                                            <div className="col-lg-12 col-md-12">
                                                                <div className="form-group">
                                                                    <label htmlFor="username" className="visually-hidden">Name</label>
                                                                    <input
                                                                        id="username"
                                                                        name="username"
                                                                        type="text"
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="Name"
                                                                        value={formData.username}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-lg-6 col-md-12">
                                                                <div className="form-group">
                                                                    <label htmlFor="email" className="visually-hidden">Email</label>
                                                                    <input
                                                                        id="email"
                                                                        name="email"
                                                                        type="email"
                                                                        className="form-control"
                                                                        required
                                                                        placeholder="Email"
                                                                        value={formData.email}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-lg-6 col-md-12">
                                                                <div className="form-group">
                                                                    <label htmlFor="phone" className="visually-hidden">Phone</label>
                                                                    <input
                                                                        id="phone"
                                                                        name="phone"
                                                                        type="tel"
                                                                        className="form-control"
                                                                        required
                                                                        placeholder="Phone"
                                                                        value={formData.phone}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-lg-12 col-md-12">
                                                                <div className="form-group">
                                                                    <label htmlFor="subject" className="visually-hidden">Subject</label>
                                                                    <input
                                                                        id="subject"
                                                                        name="subject"
                                                                        type="text"
                                                                        className="form-control"
                                                                        required
                                                                        placeholder="Subject"
                                                                        value={formData.subject}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-lg-12">
                                                                <div className="form-group">
                                                                    <label htmlFor="message" className="visually-hidden">Message</label>
                                                                    <textarea
                                                                        id="message"
                                                                        name="message"
                                                                        className="form-control"
                                                                        rows={4}
                                                                        placeholder="Message"
                                                                        value={formData.message}
                                                                        onChange={handleChange}
                                                                    ></textarea>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-12">
                                                                <button type="submit" className="site-button" id="submitBtn" style={{ color: '#FFFFFF', backgroundColor: '#E69B0A', borderColor: '#E69B0A' }}>
                                                                    Submit Now
                                                                </button>
                                                                {/* <NavLink to="/branches" className="site-button" style={{ color: '#FFFFFF', backgroundColor: '#E69B0A', borderColor: '#E69B0A' }} >Our Stores</NavLink> */}
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
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
