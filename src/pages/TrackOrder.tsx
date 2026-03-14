import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

export default function TrackOrder() {
    const [orderNumber, setOrderNumber] = useState('');
    const [orderStatus, setOrderStatus] = useState<number | null>(null);
    const [orderFound, setOrderFound] = useState(false);

    const stages = [
        { id: 1, name: 'Order Placed', icon: '📦' },
        { id: 2, name: 'Order Confirmed', icon: '✓' },
        { id: 3, name: 'Processing', icon: '⚙️' },
        { id: 4, name: 'Shipped', icon: '🚚' },
        { id: 5, name: 'In Transit', icon: '🚛' },
        { id: 6, name: 'Delivered', icon: '✅' }
    ];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (orderNumber.trim()) {
            try {
                const response = await publicApiCall(`${API_ENDPOINTS.orders.track}?order_number=${encodeURIComponent(orderNumber)}`, 'GET');
                if (response.success) {
                    // Map order status to stage number
                    const statusMap: { [key: string]: number } = {
                        'placed': 1,
                        'confirmed': 2,
                        'processing': 3,
                        'shipped': 4,
                        'in_transit': 5,
                        'delivered': 6,
                        'cancelled': 0
                    };
                    const statusNum = statusMap[response.order.order_status] || 1;
                    setOrderStatus(statusNum);
                    setOrderFound(true);
                } else {
                    setOrderFound(false);
                    setOrderStatus(null);
                }
            } catch (error) {
                console.error('Order tracking error:', error);
                setOrderFound(false);
                setOrderStatus(null);
            }
        }
    };

    const handleClear = () => {
        setOrderNumber('');
        setOrderStatus(null);
        setOrderFound(false);
    };

    return (
        <>
            <div className="cursor" style={{ display: 'none' }}></div>
            <div className="cursor2" style={{ display: 'none' }}></div>

            <div className="page-wraper">
                <Header />

                <div className="page-content track-order-page">
                    <div className="wt-bnr-inr overlay-wraper bg-center track-order-banner">
                        <div className="overlay-main innr-bnr-olay"></div>
                        <div className="wt-bnr-inr-entry">
                            <div className="banner-title-outer">
                                <div className="banner-title-name">
                                    <h2 className="wt-title track-order-banner-title" style={{ color: '#010101' }}>Track Your Order</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90 track-order-section" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-lg-8 col-md-10">
                                    <div className="section-head center mb-4 mb-md-5">
                                        <h2 className="wt-title track-order-heading" style={{ color: '#010101' }}>Enter Your Order Number</h2>
                                        <p className="track-order-subtitle" style={{ color: '#666' }}>Track the status of your order in real-time</p>
                                    </div>

                                    <form onSubmit={handleSearch} className="mb-5 track-order-form">
                                        <div className="row g-3">
                                            <div className="col-12 col-md-8">
                                                <label htmlFor="orderNumber" className="visually-hidden">Order Number</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        id="orderNumber"
                                                        type="text"
                                                        className="form-control track-order-input"
                                                        placeholder="Enter Order Number"
                                                        value={orderNumber}
                                                        onChange={(e) => setOrderNumber(e.target.value)}
                                                        required
                                                        style={{
                                                            height: '50px',
                                                            borderColor: '#E69B0A',
                                                            borderWidth: orderNumber.trim() !== '' ? '2px' : '1px',
                                                            borderStyle: 'solid',
                                                            fontSize: '16px',
                                                            borderRadius: '5px',
                                                            paddingRight: orderNumber.trim() !== '' ? '45px' : '12px',
                                                            transition: 'border-width 0.2s ease'
                                                        }}
                                                    />
                                                    {orderNumber.trim() !== '' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setOrderNumber('')}
                                                            className="track-order-clear-btn"
                                                            style={{
                                                                position: 'absolute',
                                                                right: '10px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#E69B0A',
                                                                fontSize: '18px',
                                                                cursor: 'pointer',
                                                                padding: '5px'
                                                            }}
                                                            aria-label="Clear order number"
                                                        >
                                                            <i className="bi bi-x-circle"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <button
                                                    type="submit"
                                                    className="site-button w-100 track-order-submit-btn"
                                                    style={{
                                                        height: '50px',
                                                        backgroundColor: '#E69B0A',
                                                        borderColor: '#E69B0A',
                                                        color: '#fff',
                                                        borderRadius: '5px',
                                                        fontSize: '16px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    <i className="bi bi-search me-2"></i>
                                                    Track Order
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    {orderFound && orderStatus && (
                                        <div className="order-tracking-section">
                                            <div className="card" style={{ 
                                                border: 'none', 
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                borderRadius: '10px',
                                                overflow: 'hidden'
                                            }}>
                                                <div className="card-body p-4">
                                                    <div className="d-flex justify-content-between align-items-center mb-4" style={{
                                                        paddingBottom: '20px',
                                                        borderBottom: '2px solid #f0f0f0'
                                                    }}>
                                                        <h4 className="mb-0" style={{ color: '#010101', fontSize: '24px', fontWeight: '600' }}>
                                                            Order #{orderNumber}
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={handleClear}
                                                            className="btn btn-sm"
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                borderColor: '#E69B0A',
                                                                color: '#E69B0A',
                                                                borderWidth: '1px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            <i className="bi bi-x-lg me-1"></i>
                                                            Clear
                                                        </button>
                                                    </div>

                                                    <div className="tracking-timeline">
                                                        {stages.map((stage, index) => {
                                                            const isActive = stage.id <= orderStatus;
                                                            const isCurrent = stage.id === orderStatus;

                                                            return (
                                                                <div key={stage.id} className="timeline-item mb-4">
                                                                    <div className="d-flex align-items-start">
                                                                        <div
                                                                            className="timeline-icon"
                                                                            style={{
                                                                                width: '50px',
                                                                                height: '50px',
                                                                                borderRadius: '50%',
                                                                                backgroundColor: isActive ? '#E69B0A' : '#e0e0e0',
                                                                                color: isActive ? '#fff' : '#999',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                fontSize: '20px',
                                                                                fontWeight: 'bold',
                                                                                marginRight: '20px',
                                                                                flexShrink: 0,
                                                                                border: isCurrent ? '3px solid #E69B0A' : 'none',
                                                                                boxShadow: isCurrent ? '0 0 0 3px rgba(230, 155, 10, 0.2)' : 'none'
                                                                            }}
                                                                        >
                                                                            {stage.icon}
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h5
                                                                                className="mb-1"
                                                                                style={{
                                                                                    color: isActive ? '#010101' : '#999',
                                                                                    fontWeight: isCurrent ? 'bold' : 'normal'
                                                                                }}
                                                                            >
                                                                                {stage.name}
                                                                            </h5>
                                                                            {isCurrent && (
                                                                                <span
                                                                                    className="badge"
                                                                                    style={{
                                                                                        backgroundColor: '#E69B0A',
                                                                                        color: '#fff',
                                                                                        padding: '5px 10px',
                                                                                        borderRadius: '4px',
                                                                                        fontSize: '12px'
                                                                                    }}
                                                                                >
                                                                                    Current Status
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {index < stages.length - 1 && (
                                                                        <div
                                                                            className="timeline-line"
                                                                            style={{
                                                                                width: '2px',
                                                                                height: '30px',
                                                                                backgroundColor: isActive ? '#E69B0A' : '#e0e0e0',
                                                                                marginLeft: '25px',
                                                                                marginTop: '-10px'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {orderFound && !orderStatus && (
                                        <div className="alert alert-warning" style={{ 
                                            backgroundColor: '#fff3cd', 
                                            borderColor: '#E69B0A', 
                                            color: '#010101',
                                            borderRadius: '8px',
                                            padding: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div>
                                                <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#E69B0A' }}></i>
                                                <strong>Order not found.</strong> Please check your order number and try again.
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleClear}
                                                className="btn btn-sm"
                                                style={{
                                                    backgroundColor: '#E69B0A',
                                                    borderColor: '#E69B0A',
                                                    color: '#fff',
                                                    marginLeft: '15px'
                                                }}
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}
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

            <style>{`
                /* Track Order – mobile-first overrides */
                @media (max-width: 767px) {
                    .track-order-page .track-order-banner {
                        min-height: 140px !important;
                        padding: 24px 0 !important;
                    }
                    .track-order-page .track-order-banner .wt-bnr-inr-entry {
                        padding: 0 15px;
                    }
                    .track-order-page .track-order-banner-title {
                        font-size: 1.5rem !important;
                        line-height: 1.3;
                        margin-bottom: 0;
                    }
                    .track-order-section {
                        padding-top: 2.5rem !important;
                        padding-bottom: 2.5rem !important;
                    }
                    .track-order-section .container {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                    .track-order-page .track-order-heading {
                        font-size: 1.35rem !important;
                        line-height: 1.35;
                        margin-bottom: 0.5rem;
                    }
                    .track-order-page .track-order-subtitle {
                        font-size: 0.95rem;
                        margin-bottom: 0;
                    }
                    .track-order-form .track-order-input {
                        height: 48px !important;
                        font-size: 16px !important;
                    }
                    .track-order-form .track-order-submit-btn {
                        height: 48px !important;
                        width: 100%;
                    }
                    .track-order-form .col-12.col-md-4 {
                        margin-top: 0.25rem;
                    }
                    .track-order-page .order-tracking-section .card-body {
                        padding: 1.25rem !important;
                    }
                    .track-order-page .timeline-item .timeline-icon {
                        width: 44px !important;
                        height: 44px !important;
                        font-size: 18px !important;
                        margin-right: 14px !important;
                    }
                    .track-order-page .alert {
                        flex-direction: column;
                        align-items: stretch;
                        text-align: center;
                        gap: 12px;
                    }
                    .track-order-page .alert .btn {
                        margin-left: 0 !important;
                    }
                }
            `}</style>
        </>
    );
}

