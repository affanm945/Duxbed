import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

type ContactDetails = {
    address_line1: string;
    address_line2: string;
    phone: string;
    email: string;
    whatsapp_number?: string;
};

export default function Footer() {
    const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);

    useEffect(() => {
        const fetchContactDetails = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.contactDetails.list);
                if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
                    setContactDetails(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching contact details for footer:', error);
            }
        };

        fetchContactDetails();
    }, []);

    const footerAddressLine1 = contactDetails?.address_line1 || 'ISC KSUM, Kinfra Hi-Tech Park Main Rd,';
    const footerAddressLine2 = contactDetails?.address_line2 || 'HMT-Colony, North Kalamassery, Kochi, Kerala 683503';
    const footerEmail = contactDetails?.email || 'info@duxbed.in';
    const footerPhone = contactDetails?.phone || '+91 7591 947 574';
    const footerWhatsapp = contactDetails?.whatsapp_number || '+919188915976';
    const footerWhatsappLink = `https://wa.me/${footerWhatsapp.replace(/[^0-9]/g, '')}`;

    return (
        <>
            <footer className="site-footer footer-dark">
                <a
                    target="_blank"
                    href={footerWhatsappLink}
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="scrollup1 whtslivea"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        color: '#fff',
                        fontSize: '28px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        textDecoration: 'none',
                    }}
                >
                    <i className="bi bi-whatsapp" aria-hidden="true"></i>
                </a>

                <div className="footer-top">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-4 col-md-12">
                                <div className="widget widget_about">
                                    <div className="logo-footer clearfix">
                                        <Link to="/">
                                            <img src="images/logo-dark1.png" alt="" />
                                        </Link>
                                    </div>
                                    <p>Duxbed is a leading provider form home furniture and interior solutions. We deliver high quality and functional furniture solutions that improves your home aesthetics.</p>
                                    <ul className="social-icons">
                                        <li>
                                            <a aria-label="facebook" href="https://www.facebook.com/share/1B5PnPGbyH/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                                                <svg viewBox="0 0 38 38">
                                                    <g id="facebook" transform="translate(0.452 0.063)">
                                                        <circle id="Ellipse_33" data-name="Ellipse 33" cx="19" cy="19" r="19" transform="translate(-0.452 -0.063)" fill="#1976d2"></circle>
                                                        <path id="Path_193" data-name="Path 193" d="M46.4,31.448H43.745v9.722H39.724V31.448H37.812V28.031h1.912V25.82a3.77,3.77,0,0,1,4.056-4.057l2.978.012v3.316H44.6a.818.818,0,0,0-.853.931v2.011h3Z" transform="translate(-23.721 -13.08)" fill="#fff"></path>
                                                    </g>
                                                </svg>
                                            </a>
                                        </li>
                                        <li>
                                            <a aria-label="instagram" href="https://www.instagram.com/duxbed" target="_blank" rel="noopener noreferrer">
                                                <svg viewBox="0 0 38 38">
                                                    <defs>
                                                        <linearGradient id="linear-gradient" x1="0.119" y1="0.881" x2="0.83" y2="0.17" gradientUnits="objectBoundingBox">
                                                            <stop offset="0" stopColor="#fee411"></stop>
                                                            <stop offset="0.052" stopColor="#fedb16"></stop>
                                                            <stop offset="0.138" stopColor="#fec125"></stop>
                                                            <stop offset="0.248" stopColor="#fe983d"></stop>
                                                            <stop offset="0.376" stopColor="#fe5f5e"></stop>
                                                            <stop offset="0.5" stopColor="#fe2181"></stop>
                                                            <stop offset="1" stopColor="#9000dc"></stop>
                                                        </linearGradient>
                                                    </defs>
                                                    <g id="instagram" transform="translate(0.051 0.063)">
                                                        <circle id="Ellipse_36" data-name="Ellipse 36" cx="19" cy="19" r="19" transform="translate(-0.05 -0.063)" fill="url(#linear-gradient)"></circle>
                                                        <g id="Group_364" data-name="Group 364" transform="translate(8.089 8.366)">
                                                            <path id="Path_196" data-name="Path 196" d="M145.456,131h-7.939a6.421,6.421,0,0,0-6.417,6.417v7.939a6.421,6.421,0,0,0,6.417,6.417h7.939a6.421,6.421,0,0,0,6.417-6.417v-7.939A6.421,6.421,0,0,0,145.456,131Zm4.1,14.364a4.11,4.11,0,0,1-4.106,4.106h-7.939a4.11,4.11,0,0,1-4.106-4.106v-7.939a4.11,4.11,0,0,1,4.106-4.106h7.939a4.11,4.11,0,0,1,4.106,4.106Z" transform="translate(-131.1 -131)" fill="#fff"></path>
                                                            <path id="Path_197" data-name="Path 197" d="M197.412,192.1a5.312,5.312,0,1,0,5.312,5.312A5.321,5.321,0,0,0,197.412,192.1Zm0,8.537a3.225,3.225,0,1,1,3.225-3.225A3.228,3.228,0,0,1,197.412,200.637Z" transform="translate(-187.029 -187.021)" fill="#fff"></path>
                                                            <circle id="Ellipse_37" data-name="Ellipse 37" cx="0.898" cy="0.898" r="0.898" transform="matrix(0.987, -0.16, 0.16, 0.987, 14.925, 4.033)" fill="#fff"></circle>
                                                        </g>
                                                    </g>
                                                </svg>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="widget f-top-space recent-posts-entry">
                                    <h3 className="widget-title">Quick Links</h3>
                                    <div className="section-content">
                                        <div className="widget-post-bx">
                                            <div className="widget-post clearfix">
                                                <ul style={{ listStyle: 'none' }}>
                                                    <li className="post-comment">
                                                        <NavLink to="/space-saving-furniture">Space saving furniture</NavLink>
                                                    </li>
                                                    <li className="post-comment">
                                                        <NavLink to="/duxpod-experience">Duxpod</NavLink>
                                                    </li>
                                                    <li className="post-comment">
                                                        <NavLink to="/interior-designing">Interior designing</NavLink>
                                                    </li>
                                                    <li className="post-comment">
                                                        <NavLink to="/modular-kitchen">Modular kitchen</NavLink>
                                                    </li>
                                                    <li className="post-comment">
                                                        <NavLink to="/careers">Careers</NavLink>
                                                    </li>
                                                    <li className="post-comment">
                                                        <NavLink to="/contact">Contact Us</NavLink>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="widget f-top-space">
                                    <h3 className="widget-title">Address</h3>
                                    <ul className="widget_address">
                                        <li>
                                            <i className="bi bi-geo-alt"></i>
                                            <span>{footerAddressLine1} </span>
                                            {footerAddressLine2}
                                        </li>
                                        <li>
                                            <i className="bi bi-envelope"></i>{footerEmail}
                                        </li>
                                        <li>
                                            <i className="bi bi-phone"></i>
                                            <a href={`tel:${footerPhone}`} style={{ color: '#bdb7b7' }}>{footerPhone}</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="container">
                        <div className="container">
                            <div className="footer-bottom-info d-flex justify-content-between">
                                <div className="wt-footer-bot-left">
                                    <span className="copyrights-text">© 2025 Duxbed Home | All rights reserved</span>
                                </div>
                                <div className="wt-footer-bot-right">
                                    <ul className="copyrights-nav">
                                        <li>
                                            <a href="https://google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ffff' }}>Site by AR</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <button type="button" className="scroltop" aria-label="Scroll to top">
                <span className="bi bi-chevron-up relative" id="btn-vibrate"></span>
            </button>
        </>
    );
}
