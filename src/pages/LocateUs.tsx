import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NavLink } from 'react-router-dom';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

interface FranchiseeLocation {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    mapQuery: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export default function LocateUs() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState<FranchiseeLocation | null>(null);
    const [locations, setLocations] = useState<FranchiseeLocation[]>([]);
    const [cities, setCities] = useState<string[]>(['all']);
    const [loading, setLoading] = useState(true);

    // Fetch locations from API
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const params = new URLSearchParams();
                if (selectedCity && selectedCity !== 'all') {
                    params.append('city', selectedCity);
                }
                if (searchQuery) {
                    params.append('search', searchQuery);
                }
                
                const response = await publicApiCall(`${API_ENDPOINTS.locations.list}?${params.toString()}`, 'GET');
                if (response.success) {
                    const locs = response.data.map((loc: any) => {
                        const lat = parseFloat(loc.latitude) || 0;
                        const lng = parseFloat(loc.longitude) || 0;
                        const rawMapQuery = loc.map_query || '';

                        return {
                            ...loc,
                            // Normalized field used by frontend
                            mapQuery: rawMapQuery,
                            coordinates: {
                                lat,
                                lng,
                            },
                        } as FranchiseeLocation;
                    });
                    setLocations(locs);
                    setCities(['all', ...(response.cities || [])]);
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchLocations();
    }, [selectedCity, searchQuery]);

    const filteredLocations = locations.filter(location => {
        const matchesSearch = searchQuery === '' || 
            location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.city.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCity = selectedCity === 'all' || location.city === selectedCity;
        
        return matchesSearch && matchesCity;
    });

    const handleLocationClick = (location: FranchiseeLocation) => {
        setSelectedLocation(location);
    };

    const isFullGoogleMapsUrl = (value?: string | null) => {
        if (!value) return false;
        const trimmed = value.trim();
        return /^https?:\/\//i.test(trimmed) && trimmed.includes('google.com/maps');
    };

    const getMapSearchQuery = (location: FranchiseeLocation) => {
        const mq = location.mapQuery?.trim();

        // If admin entered a full Google Maps URL, don't treat it as a query string
        if (mq && !isFullGoogleMapsUrl(mq)) {
            return mq;
        }

        if (location.coordinates?.lat && location.coordinates?.lng) {
            return `${location.coordinates.lat},${location.coordinates.lng}`;
        }

        return location.city || location.name;
    };

    const getDirectionsHref = (location: FranchiseeLocation) => {
        if (isFullGoogleMapsUrl(location.mapQuery)) {
            return (location.mapQuery as string).trim();
        }
        const q = encodeURIComponent(getMapSearchQuery(location));
        return `https://www.google.com/maps/search/?api=1&query=${q}`;
    };

    /** In-page embed: use OpenStreetMap (allows iframes). Google Maps often blocks embed with "refused to connect". */
    const getEmbedMapUrl = (location: FranchiseeLocation): string | null => {
        const lat = location.coordinates?.lat;
        const lng = location.coordinates?.lng;
        if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
        }
        const delta = 0.015;
        const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',');
        const marker = `${lat},${lng}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;
    };

    const hasActiveFilters = searchQuery.trim() !== '' || selectedCity !== 'all';

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCity('all');
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
                                    <h2 className="wt-title" style={{ color: '#010101' }}>Locate Us</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Find Our Stores</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Our Franchisee Locations</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    Find your nearest Duxbed showroom. Visit us to experience our premium furniture collections and expert consultation services.
                                </p>
                            </div>

                            <div className="location-filters mt-5 mb-5">
                                <div className="row">
                                    <div className="col-md-6 m-b20">
                                        <label htmlFor="searchLocation" className="visually-hidden">Search Location</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                id="searchLocation"
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by location, city, or address..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                style={{
                                                    height: '50px',
                                                    borderColor: '#E69B0A',
                                                    borderWidth: searchQuery.trim() !== '' ? '3px' : '1px',
                                                    borderStyle: 'solid',
                                                    borderRadius: '5px',
                                                    fontSize: '16px',
                                                    paddingRight: searchQuery.trim() !== '' ? '40px' : '12px',
                                                    transition: 'border-width 0.2s ease'
                                                }}
                                            />
                                            {searchQuery.trim() !== '' && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
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
                                                    aria-label="Clear search"
                                                >
                                                    <i className="bi bi-x-circle"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6 m-b20">
                                        <label htmlFor="cityFilter" className="visually-hidden">Filter by City</label>
                                        <select
                                            id="cityFilter"
                                            className="form-control"
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            style={{
                                                height: '50px',
                                                borderColor: '#E69B0A',
                                                borderWidth: selectedCity !== 'all' ? '3px' : '1px',
                                                borderStyle: 'solid',
                                                borderRadius: '5px',
                                                fontSize: '16px',
                                                transition: 'border-width 0.2s ease'
                                            }}
                                        >
                                            {cities.map(city => (
                                                <option key={city} value={city}>
                                                    {city === 'all' ? 'All Cities' : city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                {(hasActiveFilters || filteredLocations.length !== locations.length) && (
                                    <div className="active-filters-row mt-3" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>
                                            {filteredLocations.length} {filteredLocations.length === 1 ? 'location' : 'locations'} found
                                            {hasActiveFilters && ' (filtered)'}
                                        </div>
                                        
                                        {hasActiveFilters && (
                                            <>
                                                <div style={{ height: '20px', width: '1px', backgroundColor: '#ddd' }}></div>
                                                
                                                {searchQuery.trim() !== '' && (
                                                    <div className="filter-badge" style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        backgroundColor: '#E69B0A',
                                                        color: '#fff',
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '14px'
                                                    }}>
                                                        <span>Search: "{searchQuery}"</span>
                                                        <button
                                                            onClick={() => setSearchQuery('')}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#fff',
                                                                cursor: 'pointer',
                                                                padding: '0',
                                                                fontSize: '16px',
                                                                lineHeight: '1'
                                                            }}
                                                            aria-label="Remove search filter"
                                                        >
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {selectedCity !== 'all' && (
                                                    <div className="filter-badge" style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        backgroundColor: '#E69B0A',
                                                        color: '#fff',
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '14px'
                                                    }}>
                                                        <span>City: {selectedCity}</span>
                                                        <button
                                                            onClick={() => setSelectedCity('all')}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#fff',
                                                                cursor: 'pointer',
                                                                padding: '0',
                                                                fontSize: '16px',
                                                                lineHeight: '1'
                                                            }}
                                                            aria-label="Remove city filter"
                                                        >
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                <button
                                                    onClick={clearFilters}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #E69B0A',
                                                        color: '#E69B0A',
                                                        padding: '6px 16px',
                                                        borderRadius: '5px',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        marginLeft: 'auto'
                                                    }}
                                                >
                                                    Clear All Filters
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="locations-list mb-5">
                                <div className="row">
                                    {filteredLocations.map(location => (
                                        <div key={location.id} className="col-lg-6 col-md-6 m-b30">
                                            <div 
                                                className="location-card" 
                                                style={{
                                                    backgroundColor: '#f7f7f7',
                                                    padding: '25px',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    border: selectedLocation?.id === location.id ? '2px solid #E69B0A' : '1px solid #e0e0e0',
                                                    transition: 'all 0.3s ease',
                                                    height: '100%'
                                                }}
                                                onClick={() => handleLocationClick(location)}
                                                onMouseEnter={(e) => {
                                                    if (selectedLocation?.id !== location.id) {
                                                        e.currentTarget.style.borderColor = '#E69B0A';
                                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedLocation?.id !== location.id) {
                                                        e.currentTarget.style.borderColor = '#e0e0e0';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }
                                                }}
                                            >
                                                <h4 style={{ color: '#010101', marginBottom: '15px', fontSize: '20px' }}>
                                                    {location.name}
                                                </h4>
                                                <div className="location-details" style={{ color: '#666', fontSize: '14px', lineHeight: '1.8' }}>
                                                    <p style={{ marginBottom: '8px' }}>
                                                        <i className="bi bi-geo-alt-fill me-2" style={{ color: '#E69B0A' }}></i>
                                                        {location.address}, {location.city}, {location.state} - {location.pincode}
                                                    </p>
                                                    <p style={{ marginBottom: '8px' }}>
                                                        <i className="bi bi-telephone-fill me-2" style={{ color: '#E69B0A' }}></i>
                                                        <a href={`tel:${location.phone}`} style={{ color: '#666', textDecoration: 'none' }}>
                                                            {location.phone}
                                                        </a>
                                                    </p>
                                                    <p style={{ marginBottom: '8px' }}>
                                                        <i className="bi bi-envelope-fill me-2" style={{ color: '#E69B0A' }}></i>
                                                        <a href={`mailto:${location.email}`} style={{ color: '#666', textDecoration: 'none' }}>
                                                            {location.email}
                                                        </a>
                                                    </p>
                                                </div>
                                                <a
                                                    href={getDirectionsHref(location)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="site-button-link mt-3"
                                                    style={{ color: '#E69B0A' }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Get Directions <i className="bi bi-arrow-right ms-1"></i>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {filteredLocations.length === 0 && (
                                <div className="text-center" style={{ padding: '40px', color: '#666' }}>
                                    <i className="bi bi-search" style={{ fontSize: '48px', marginBottom: '20px' }}></i>
                                    <h4>No locations found</h4>
                                    <p>Try adjusting your search criteria or filter options.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedLocation && (
                        <div className="map-section" style={{ backgroundColor: '#f7f7f7' }}>
                            <div className="container">
                                <div className="section-head center mb-4" style={{ position: 'relative' }}>
                                    <h3 style={{ color: '#010101' }}>{selectedLocation.name}</h3>
                                    <button
                                        onClick={() => setSelectedLocation(null)}
                                        style={{
                                            position: 'absolute',
                                            right: '0',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)',
                                            border: 'none',
                                            color: '#FFFFFF',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 15px rgba(230, 155, 10, 0.3)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #D48909 0%, #E69B0A 100%)';
                                            e.currentTarget.style.transform = 'translateY(-50%) translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 155, 10, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)';
                                            e.currentTarget.style.transform = 'translateY(-50%)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 155, 10, 0.3)';
                                        }}
                                        aria-label="Clear map and select another location"
                                    >
                                        <i className="bi bi-x-circle"></i>
                                        Clear Map
                                    </button>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 p-0">
                                        {getEmbedMapUrl(selectedLocation) ? (
                                            <div className="map-responsive">
                                                <iframe
                                                    key={selectedLocation.id}
                                                    src={getEmbedMapUrl(selectedLocation)!}
                                                    width="1920"
                                                    height="520"
                                                    title={`${selectedLocation.name} - Map`}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    style={{ border: 'none' }}
                                                />
                                                <p className="map-attribution" style={{ margin: '8px 0 0', fontSize: '12px', color: '#666' }}>
                                                    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: '#666' }}>© OpenStreetMap</a> · <a href={getDirectionsHref(selectedLocation)} target="_blank" rel="noopener noreferrer" style={{ color: '#E69B0A', fontWeight: 600 }}>Get directions (Google Maps)</a>
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="map-fallback" style={{
                                                padding: '60px 24px',
                                                textAlign: 'center',
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: '10px',
                                                border: '1px dashed #ccc'
                                            }}>
                                                <i className="bi bi-geo-alt" style={{ fontSize: '48px', color: '#E69B0A', marginBottom: '16px', display: 'block' }} />
                                                <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
                                                    Map preview is available when coordinates are set. Open in Google Maps for directions.
                                                </p>
                                                <a
                                                    href={getDirectionsHref(selectedLocation)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="site-button"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#FFFFFF',
                                                        background: 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)',
                                                        border: 'none',
                                                        padding: '12px 24px',
                                                        borderRadius: '8px',
                                                        fontSize: '16px',
                                                        fontWeight: 600,
                                                        textDecoration: 'none',
                                                        boxShadow: '0 4px 15px rgba(230, 155, 10, 0.3)'
                                                    }}
                                                >
                                                    View on Google Maps <i className="bi bi-box-arrow-up-right" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                    <div className="section-full p-b120" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-chat-dots" />
                                    <div style={{ color: '#A6A6A6' }}>Still need help?</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Talk to our team</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '700px', margin: '20px auto' }}>
                                    If you couldn&apos;t find a nearby showroom or have specific questions, reach out and we&apos;ll be happy to assist.
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
                    )}
                </div>

                <Footer />

                <button className="scroltop" aria-label="Scroll to top">
                    <span className="bi bi-chevron-up relative" id="btn-vibrate"></span>
                </button>
            </div>

            <style>{`
                .map-responsive {
                    position: relative;
                    width: 100%;
                    padding-bottom: 56.25%;
                    height: 0;
                    overflow: hidden;
                    border-radius: 10px;
                }

                .map-responsive iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 0;
                }

                .map-section {
                    padding: 60px 0 110px;
                }

                @media (max-width: 768px) {
                    .section-head {
                        position: relative !important;
                    }
                    
                    .section-head button {
                        position: relative !important;
                        right: auto !important;
                        top: auto !important;
                        transform: none !important;
                        margin-top: 15px;
                        width: 100%;
                    }
                }

                .location-card {
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                @media (max-width: 768px) {
                    .location-card {
                        margin-bottom: 20px;
                    }
                }
            `}</style>
        </>
    );
}

