import React, { useState } from 'react';
import { Link, NavLink } from "react-router-dom";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className={`sticky-header site-header header-style-2 mobile-sider-drawer-menu ${isMenuOpen ? 'active' : ''}`}>
            <style>{`
                .site-header.header-style-2 .main-bar { 
                    position: relative; 
                }
                .site-header .header-yellow-accent {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 10px;
                    height: 3px;
                    background: #E69B0A;
                    z-index: 1;
                    pointer-events: none;
                }
                .site-header.header-style-2 .logo-header {
                    z-index: 0;
                }
            `}</style>
            <div className="main-bar-wraper navbar-expand-lg">
                <div className="main-bar">
                    <div className="container-fluid clearfix">
                        <div className="logo-header">
                            <div className="logo-header-inner logo-header-one">
                                <Link to="/">
                                    <img src="/images/logo-light1.png" alt="Duxbed" />
                                </Link>
                            </div>
                        </div>

                        <button
                            id="mobile-side-drawer"
                            type="button"
                            className={`navbar-toggler ${isMenuOpen ? '' : 'collapsed'}`}
                            onClick={toggleMenu}
                            aria-label="Toggle navigation"
                            {...(isMenuOpen ? { 'aria-expanded': true } : { 'aria-expanded': false })}
                        >
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar icon-bar-first"></span>
                            <span className="icon-bar icon-bar-two"></span>
                            <span className="icon-bar icon-bar-three"></span>
                        </button>

                        <div className="nav-animation header-nav navbar-collapse collapse d-flex justify-content-end">
                            <ul className="nav navbar-nav">
                                <li>
                                    <NavLink to="/" onClick={closeMenu}>Home</NavLink>
                                </li>
                                <li className="has-child">
                                    <NavLink to="/about-us" onClick={closeMenu}>Who We Are</NavLink>
                                    <span className="submenu-toogle bi bi-chevron-down" aria-hidden />
                                    <ul className="sub-menu">
                                        <li>
                                            <NavLink to="/about-us" onClick={closeMenu}>About Us</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/our-story" onClick={closeMenu}>Our Story</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/our-leadership" onClick={closeMenu}>Our Leadership</NavLink>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <NavLink to="/why-duxbed" onClick={closeMenu}>Why Duxbed</NavLink>
                                </li>
                                <li className="has-child">
                                    <NavLink to="/what-we-do" onClick={closeMenu}>What We Do</NavLink>
                                    <span className="submenu-toogle bi bi-chevron-down" aria-hidden />
                                    <ul className="sub-menu">
                                        <li>
                                            <NavLink to="/space-saving-furniture" onClick={closeMenu}>Space saving furniture</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/duxpod-experience" onClick={closeMenu}>Duxpod</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/interior-designing" onClick={closeMenu}>Interior designing</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/modular-kitchen" onClick={closeMenu}>Modular kitchen</NavLink>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <NavLink to="/careers" onClick={closeMenu}>Career</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/media" onClick={closeMenu}>Media</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/locate-us" onClick={closeMenu}>Locate Us</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/partner-with-us" onClick={closeMenu}>Partner With Us</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/track-order" onClick={closeMenu}>Track Order</NavLink>
                                </li>
                            </ul>
                        </div>
                        <div className="header-yellow-accent" aria-hidden />
                    </div>
                </div>
            </div>
        </header>
    );
}
