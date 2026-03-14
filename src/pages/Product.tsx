import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, NavLink } from "react-router-dom";

export default function Product() {
    return (
        <>
            {/* Curser Pointer */}
            <div className="cursor" style={{ display: 'none' }}></div>
            <div className="cursor2" style={{ display: 'none' }}></div>

            <div className="page-wraper">
                {/* HEADER START */}
                <Header />
                {/* HEADER END */}

                {/* CONTENT START */}
                <div className="page-content">
                    {/* INNER PAGE BANNER */}
                    <div className="wt-bnr-inr overlay-wraper bg-center">
                        <div className="overlay-main innr-bnr-olay"></div>
                        <div className="wt-bnr-inr-entry">
                            <div className="banner-title-outer">
                                <div className="banner-title-name">
                                    <h2 className="wt-title">Products</h2>
                                </div>
                                {/* BREADCRUMB ROW */}
                                {/* <div>
                                    <ul className="wt-breadcrumb breadcrumb-style-2">
                                        <li><a href="index.html">Home</a></li>
                                        <li>About Us</li>
                                    </ul>
                                </div>
                            </div> */}
                                {/* BREADCRUMB ROW END */}
                            </div>
                        </div>
                    </div>
                    {/* INNER PAGE BANNER END */}

                    {/* WHAT WE DO SECTION START */}
                    <div className="section-full p-t120 p-b90" style={{ background: '#f3f3f3' }}>
                        <div className="container custom-container">
                            {/* TITLE START */}
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div>Innovation in every detail</div>
                                </div>
                                <h2 className="wt-title title_split_anim">Our exclusive collection</h2>
                            </div>
                            {/* TITLE END */}

                            <div className="s-section">
                                <div className="row d-flex justify-content-center">

                                    {/* COLUMNS 1 */}
                                    <div className="col-lg-6 col-md-6  col-sm-12 m-b30  ">
                                        <div className="icon-box-style-one-wrap">
                                            <div className="icon-box-style-one">
                                                <NavLink to="/space-saving-furniture">
                                                    <div className="icon-box-style-one-media">
                                                        <img src="images/whatwe/pro-living.png" alt="Space saving furniture" />
                                                    </div>

                                                    <div className="icon-box-one-title">
                                                        <h3 className="wt-title">Space saving furniture</h3>
                                                    </div>

                                                    <div className="icon-box-one-content">
                                                        <p>Space-saving furniture maximizes utility in compact living areas by combining multiple functions into single pieces or using clever mechanisms like folding, stacking, or vertical mounting.
                                                            These designs address urban space constraints, particularly relevant for homes in populated area, where apartments and modular furniture production is common. They promote organization, reduce clutter, and enhance room flow without sacrificing style or comfort.</p>
                                                        <span className="site-button-link site-text-primary" style={{ color: '#E69B0A' }}>Explore</span>
                                                    </div>

                                                    <div className="icon-box-one-alpha">
                                                        <span>I</span>
                                                    </div>
                                                </NavLink>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLUMNS 2 */}
                                    <div className="col-lg-6 col-md-6  col-sm-12 m-b30  ">
                                        <div className="icon-box-style-one-wrap">
                                            <div className="icon-box-style-one">
                                                <NavLink to="/duxpod-experience">
                                                    <div className="icon-box-style-one-media">
                                                        <img src="images/whatwe/pro-modular.png" alt="Duxpod" />
                                                    </div>

                                                    <div className="icon-box-one-title">
                                                        <h3 className="wt-title">Duxpod</h3>
                                                    </div>

                                                    <div className="icon-box-one-content">
                                                        Duxpods are portable resort units developed by Duxbed that combine modular architecture, luxury interiors, and mobility to create a complete
                                                        plug‑and‑play hospitality space. Each unit functions as a self-contained premium room or mini-suite that can be
                                                        transported, installed, and relocated with minimal site work, making it ideal for resorts, eco-stays, and boutique properties looking to expand quickly or seasonally.
                                                        <span className="site-button-link site-text-primary" style={{ color: '#E69B0A' }}>Explore</span>
                                                    </div>

                                                    <div className="icon-box-one-alpha">
                                                        <span>F</span>
                                                    </div>
                                                </NavLink>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLUMNS 3 - Interior designing */}
                                    <div className="col-lg-6 col-md-6  col-sm-12 m-b30 ">
                                        <div className="icon-box-style-one-wrap">
                                            <div className="icon-box-style-one">
                                                <NavLink to="/interior-designing">
                                                    <div className="icon-box-style-one-media">
                                                        <img src="images/whatwe/pro-bedroom.png" alt="Interior designing" />
                                                    </div>

                                                    <div className="icon-box-one-title">
                                                        <h3 className="wt-title">Interior designing</h3>
                                                    </div>

                                                    <div className="icon-box-one-content">
                                                        <p>We transforms living spaces into functional, aesthetically pleasing environments by blending creativity, architecture, and user needs
                                                            through careful planning of layouts, materials, colors, and furnishings. It encompasses everything from conceptualizing
                                                            room flows to selecting finishes, ensuring harmony between form and utility. Personalized interior design stands out as a core
                                                            strength here, tailoring every element to individual lifestyles for truly unique, resonant home.</p>
                                                        <span className="site-button-link site-text-primary" style={{ color: '#E69B0A' }}>Explore</span>
                                                    </div>

                                                    <div className="icon-box-one-alpha">
                                                        <span>A</span>
                                                    </div>
                                                </NavLink>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLUMNS 4 - Modular kitchen */}
                                    <div className="col-lg-6 col-md-6  col-sm-12 m-b30">
                                        <div className="icon-box-style-one-wrap">
                                            <div className="icon-box-style-one">
                                                <NavLink to="/modular-kitchen">
                                                    <div className="icon-box-style-one-media">
                                                        <img src="images/whatwe/pro-modular.png" alt="Modular kitchen" />
                                                    </div>

                                                    <div className="icon-box-one-title">
                                                        <h3 className="wt-title">Modular kitchen</h3>
                                                    </div>

                                                    <div className="icon-box-one-content">
                                                        <p>Modular furniture consists of interchangeable, standardized components that assemble into customizable configurations,
                                                            allowing easy reconfiguration, expansion, or disassembly for versatile use in homes and offices. This design excels in space
                                                            optimization, aligning perfectly with space-saving needs in compact Kerala residences, and supports modern, personalized
                                                            interior schemes through adaptable layouts. At Duxbed, we lead the industry by designing and constructing these pieces at
                                                            the cheapest rates with unmatched quality, using a durable steel-wood combination for strength and elegance.</p>
                                                        <span className="site-button-link site-text-primary" style={{ color: '#E69B0A' }}>Explore</span>
                                                    </div>

                                                    <div className="icon-box-one-alpha">
                                                        <span>I</span>
                                                    </div>
                                                </NavLink>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                    {/* WHAT WE DO SECTION END */}

                    {/* category Section */}
                    <div className="section-full twm-category-carousal2-area">
                        <div className="owl-carousel twm-category-carousal-slider">
                            {/* COLUMN 1 */}
                            <div className="item">
                                <div className="twm_category_bx cursor-scale wow fadeInDown" data-wow-duration="1000ms">
                                    <span className="ao-our-categori-icon">
                                        <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="spin2" cx="400" cy="400" fill="none"
                                                r="200" strokeWidth="50" stroke="#E387FF"
                                                strokeDasharray="700 1400"
                                                strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <div className="twm-category-name">Space saving furniture</div>
                                </div>
                            </div>
                            {/* COLUMN 2 */}
                            <div className="item">
                                <div className="twm_category_bx cursor-scale wow fadeInDown" data-wow-duration="1000ms">
                                    <span className="ao-our-categori-icon">
                                        <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="spin2" cx="400" cy="400" fill="none"
                                                r="200" strokeWidth="50" stroke="#E387FF"
                                                strokeDasharray="700 1400"
                                                strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <div className="twm-category-name">Duxpod</div>
                                </div>
                            </div>
                            {/* COLUMN 3 */}
                            <div className="item">
                                <div className="twm_category_bx cursor-scale wow fadeInDown" data-wow-duration="1000ms">
                                    <span className="ao-our-categori-icon">
                                        <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="spin2" cx="400" cy="400" fill="none"
                                                r="200" strokeWidth="50" stroke="#E387FF"
                                                strokeDasharray="700 1400"
                                                strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <div className="twm-category-name">Interior designing</div>
                                </div>
                            </div>
                            {/* COLUMN 4 */}
                            <div className="item">
                                <div className="twm_category_bx cursor-scale wow fadeInDown" data-wow-duration="1000ms">
                                    <span className="ao-our-categori-icon">
                                        <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="spin2" cx="400" cy="400" fill="none"
                                                r="200" strokeWidth="50" stroke="#E387FF"
                                                strokeDasharray="700 1400"
                                                strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <div className="twm-category-name">Modular kitchen</div>
                                </div>
                            </div>
                        </div>
                        {/* category End */}
                    </div>
                    {/* CONTENT END */}

                    {/* FOOTER START */}
                    <Footer />
                    {/* FOOTER END */}

                    {/* BUTTON TOP START */}
                    <button className="scroltop" aria-label="Scroll to top">
                        <span className="bi bi-chevron-up relative" id="btn-vibrate"></span>
                    </button>
                </div >
            </div >
        </>
    );
}
