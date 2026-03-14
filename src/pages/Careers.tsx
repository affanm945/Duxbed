import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NavLink } from 'react-router-dom';
import { publicApiCall, API_ENDPOINTS, API_BASE_URL } from '../config/api';

interface JobListing {
    id: number;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    skills_required: string[];
}

const employeeTestimonialsCarouselInitialized = { current: false };

export default function Careers() {
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [jobListings, setJobListings] = useState<JobListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [employeeTestimonials, setEmployeeTestimonials] = useState<any[]>([]);
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        resume: null as File | null,
        coverLetter: ''
    });

    // Fetch job listings from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await publicApiCall(API_ENDPOINTS.careers.jobs, 'GET');
                if (response.success) {
                    const jobs = response.data.map((job: any) => ({
                        ...job,
                        requirements: job.requirements ? job.requirements.split(', ') : [],
                        skills_required: job.skills_required ? job.skills_required.split(', ') : [],
                    }));
                    setJobListings(jobs);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Fetch employee testimonials from API (type_id=2)
    useEffect(() => {
        const fetchEmployeeTestimonials = async () => {
            try {
                const endpoint = API_ENDPOINTS.testimonials.list + '?type_id=2';
                const response = await publicApiCall(endpoint, 'GET');

                if (response && response.success !== false) {
                    const testimonialsData = response.data || response;
                    if (Array.isArray(testimonialsData)) {
                        setEmployeeTestimonials(testimonialsData);
                    } else if (testimonialsData && Array.isArray(testimonialsData.testimonials)) {
                        setEmployeeTestimonials(testimonialsData.testimonials);
                    } else {
                        setEmployeeTestimonials([]);
                    }
                } else {
                    setEmployeeTestimonials([]);
                }
            } catch (error) {
                console.error('Error fetching employee testimonials:', error);
                setEmployeeTestimonials([]);
            }
        };

        fetchEmployeeTestimonials();
    }, []);

    // Initialize employee testimonials carousel after testimonials are loaded
    useEffect(() => {
        console.log('Employee Testimonials useEffect triggered, employeeTestimonials.length:', employeeTestimonials.length);
        if (employeeTestimonials.length === 0) {
            console.log('No employee testimonials, skipping carousel init');
            return;
        }

        let carouselInstance: any = null;
        let timeoutId: ReturnType<typeof setTimeout>;
        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 10;

        const initEmployeeTestimonialCarousel = () => {
            if (!isMounted) return;

            if (typeof window === 'undefined' || !(window as any).jQuery || !(window as any).jQuery.fn.owlCarousel) {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutId = setTimeout(initEmployeeTestimonialCarousel, 100);
                } else {
                    console.error('jQuery or OwlCarousel not available after max retries');
                }
                return;
            }

            const $ = (window as any).jQuery;
            // Find the employee testimonials carousel element
            let carouselElement = $('.employee-testimonial-carousel[data-react-carousel="true"]');
            if (!carouselElement.length) {
                carouselElement = $('.employee-testimonial-carousel');
            }

            console.log('Employee testimonial carousel element found:', carouselElement.length, 'elements');
            if (!isMounted || !carouselElement.length) {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutId = setTimeout(initEmployeeTestimonialCarousel, 100);
                }
                return;
            }

            // Mark this element as React-managed to prevent custom.js from initializing it
            carouselElement.attr('data-react-carousel', 'true');

            // Check if carousel is already initialized - if so, destroy and reinitialize
            if (carouselElement.data('owl.carousel')) {
                console.log('Carousel already initialized, destroying and reinitializing');
                carouselElement.trigger('destroy.owl.carousel');
                carouselElement.removeClass('owl-carousel owl-loaded');
                carouselElement.find('.owl-stage-outer').children().unwrap();
            }

            try {
                console.log('Initializing OwlCarousel for employee testimonials with', employeeTestimonials.length, 'testimonials');
                carouselInstance = carouselElement.owlCarousel({
                    loop: employeeTestimonials.length > 2,
                    margin: 30,
                    nav: true,
                    dots: false,
                    autoplay: employeeTestimonials.length > 2,
                    autoplayTimeout: 3000,
                    autoplayHoverPause: true,
                    navText: ['<i class="bi bi-chevron-left"></i>', '<i class="bi bi-chevron-right"></i>'],
                    responsive: {
                        0: { items: 1 },
                        768: { items: 1 },
                        992: { items: 2 },
                        1200: { items: 2 }
                    }
                });
                employeeTestimonialsCarouselInitialized.current = true;
                console.log('Employee testimonials OwlCarousel initialized successfully');
            } catch (error) {
                console.error('Error initializing employee testimonial carousel:', error);
            }
        };

        // Wait a bit for DOM to be ready and after custom.js has run
        timeoutId = setTimeout(initEmployeeTestimonialCarousel, 300);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            // Cleanup carousel on unmount
            if (typeof window !== 'undefined' && (window as any).jQuery) {
                const $ = (window as any).jQuery;
                const carouselElement = $('.employee-testimonial-carousel');
                if (carouselElement.data('owl.carousel')) {
                    carouselElement.trigger('destroy.owl.carousel');
                }
            }
        };
    }, [employeeTestimonials.length]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({
                ...formData,
                resume: e.target.files[0]
            });
        }
    };

    const handleApply = (job: JobListing) => {
        setSelectedJob(job);
        setFormData({
            ...formData,
            position: job.title
        });
        window.scrollTo({ top: document.getElementById('application-form')?.offsetTop || 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.resume) {
            alert('Please upload your resume');
            return;
        }

        try {
            // Submit application (resume will be uploaded as part of the form submission)
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('name', formData.name);
            formDataToSubmit.append('email', formData.email);
            formDataToSubmit.append('phone', formData.phone);
            formDataToSubmit.append('position', formData.position);
            formDataToSubmit.append('resume', formData.resume);
            formDataToSubmit.append('coverLetter', formData.coverLetter);

            const response = await fetch(API_BASE_URL + API_ENDPOINTS.careers.submit, {
                method: 'POST',
                body: formDataToSubmit,
                credentials: 'include',
            });

            const result = await response.json();

            if (result.success) {
                alert('Application submitted successfully! Our HR team will contact you soon.');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    position: '',
                    resume: null,
                    coverLetter: ''
                });
                // Clear file input
                if (resumeInputRef.current) {
                    resumeInputRef.current.value = '';
                }
                setSelectedJob(null);
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Application submission error:', error);
            alert('Failed to submit application. Please try again.');
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
                                    <h2 className="wt-title" style={{ color: '#010101' }}>Careers</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Join Our Team</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Explore Careers</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    Be part of a dynamic team that's transforming homes and creating exceptional experiences. Explore opportunities to grow and innovate with Duxbed.
                                </p>
                            </div>

                            <div className="section-content mt-5">
                                <div className="row">
                                    {jobListings.map(job => (
                                        <div key={job.id} className="col-lg-6 col-md-6 m-b30">
                                            <div className="job-card" style={{
                                                backgroundColor: '#f7f7f7',
                                                padding: '30px',
                                                borderRadius: '10px',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                height: '100%'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '20px'
                                                }}>
                                                    <div>
                                                        <h4 style={{ color: '#010101', marginBottom: '10px', fontSize: '22px' }}>
                                                            {job.title}
                                                        </h4>
                                                        <span style={{
                                                            padding: '5px 15px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            backgroundColor: '#E69B0A',
                                                            color: '#FFFFFF',
                                                            display: 'inline-block',
                                                            marginBottom: '10px'
                                                        }}>
                                                            {job.department}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.8' }}>
                                                    <p style={{ marginBottom: '8px' }}>
                                                        <i className="bi bi-geo-alt-fill me-2" style={{ color: '#E69B0A' }}></i>
                                                        {job.location}
                                                    </p>
                                                    <p style={{ marginBottom: '8px' }}>
                                                        <i className="bi bi-briefcase-fill me-2" style={{ color: '#E69B0A' }}></i>
                                                        {job.type}
                                                    </p>
                                                </div>
                                                <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#010101', marginBottom: '8px' }}>
                                                    Description
                                                </h5>
                                                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                                                    {job.description}
                                                </p>

                                                {(job.requirements?.length || job.skills_required?.length) && (
                                                    <div style={{ marginBottom: '22px' }}>
                                                        {job.requirements && job.requirements.length > 0 && (
                                                            <div style={{ marginBottom: job.skills_required && job.skills_required.length > 0 ? '14px' : 0 }}>
                                                                <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#010101', marginBottom: '8px' }}>
                                                                    Requirements
                                                                </h5>
                                                                <ul style={{ paddingLeft: '18px', margin: 0, color: '#666', fontSize: '13px', lineHeight: 1.6 }}>
                                                                    {job.requirements.map((req, idx) => (
                                                                        <li key={idx}>{req}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {job.skills_required && job.skills_required.length > 0 && (
                                                            <div>
                                                                <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#010101', marginBottom: '8px' }}>
                                                                    Skills Required
                                                                </h5>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                    {job.skills_required.map((skill, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            style={{
                                                                                display: 'inline-block',
                                                                                padding: '4px 10px',
                                                                                borderRadius: '999px',
                                                                                backgroundColor: '#fff',
                                                                                border: '1px solid #E69B0A33',
                                                                                color: '#443935',
                                                                                fontSize: '12px',
                                                                                fontWeight: 500,
                                                                            }}
                                                                        >
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <button
                                                        onClick={() => handleApply(job)}
                                                        className="site-button"
                                                        style={{
                                                            color: '#FFFFFF',
                                                            background: 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)',
                                                            border: 'none',
                                                            width: 'auto',
                                                            minWidth: '250px',
                                                            height: '50px',
                                                            padding: '12px 75px',
                                                            borderRadius: '8px',
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '1px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 4px 15px rgba(230, 155, 10, 0.3)',
                                                            position: 'relative',
                                                            overflow: 'hidden',
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
                                                        Apply Now
                                                        <i className="bi bi-arrow-right"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="hr-contact mt-5 text-center" style={{
                                padding: '30px',
                                backgroundColor: '#f7f7f7',
                                borderRadius: '10px'
                            }}>
                                <h4 style={{ color: '#010101', marginBottom: '15px' }}>General Inquiries</h4>
                                <p style={{ color: '#666', marginBottom: '10px' }}>
                                    For general career inquiries, please email us at:
                                </p>
                                <a href="mailto:hr@duxbed.com" style={{ color: '#E69B0A', fontSize: '18px', fontWeight: 'bold' }}>
                                    hr@duxbed.com
                                </a>
                                <div style={{ marginTop: '20px' }}>
                                    <NavLink
                                        to="/contact"
                                        className="site-button"
                                        style={{
                                            color: '#FFFFFF',
                                            background: 'linear-gradient(135deg, #E69B0A 0%, #D48909 100%)',
                                            border: 'none',
                                            minWidth: '220px',
                                            height: '46px',
                                            padding: '10px 26px',
                                            fontSize: '15px',
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
                                        Contact HR Team
                                        <i className="bi bi-arrow-right" />
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="application-form" className="section-full p-t120 p-b90" style={{ backgroundColor: '#f7f7f7' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Application Form</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>
                                    {selectedJob ? `Apply for ${selectedJob.title}` : 'Job Application'}
                                </h2>
                            </div>

                            <div className="section-content mt-5">
                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        <form onSubmit={handleSubmit} style={{
                                            backgroundColor: '#FFFFFF',
                                            padding: '40px',
                                            borderRadius: '10px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}>
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
                                                        onChange={handleInputChange}
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
                                                        onChange={handleInputChange}
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
                                                        onChange={handleInputChange}
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
                                                    <label htmlFor="position" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                        Position Applied For *
                                                    </label>
                                                    <input
                                                        id="position"
                                                        type="text"
                                                        name="position"
                                                        className="form-control"
                                                        value={formData.position}
                                                        onChange={handleInputChange}
                                                        required
                                                        readOnly={!!selectedJob}
                                                        placeholder="Enter position title"
                                                        style={{
                                                            height: '50px',
                                                            borderColor: '#E69B0A',
                                                            borderRadius: '5px',
                                                            backgroundColor: selectedJob ? '#f5f5f5' : '#FFFFFF'
                                                        }}
                                                    />
                                                </div>

                                                <div className="col-md-12 m-b30">
                                                    <label htmlFor="resume" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                        Resume/CV *
                                                    </label>
                                                    <input
                                                        id="resume"
                                                        ref={resumeInputRef}
                                                        type="file"
                                                        name="resume"
                                                        className="form-control"
                                                        onChange={handleFileChange}
                                                        accept=".pdf,.doc,.docx"
                                                        required
                                                        title="Upload your resume or CV (PDF, DOC, or DOCX)"
                                                        style={{
                                                            height: '50px',
                                                            borderColor: '#E69B0A',
                                                            borderRadius: '5px',
                                                            paddingTop: '10px'
                                                        }}
                                                    />
                                                </div>

                                                <div className="col-md-12 m-b30">
                                                    <label htmlFor="coverLetter" style={{ color: '#010101', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                        Cover Letter
                                                    </label>
                                                    <textarea
                                                        id="coverLetter"
                                                        name="coverLetter"
                                                        className="form-control"
                                                        value={formData.coverLetter}
                                                        onChange={handleInputChange}
                                                        rows={5}
                                                        placeholder="Enter your cover letter (optional)"
                                                        style={{
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
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-full p-t120 p-b90" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="container">
                            <div className="section-head center wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <i className="bi bi-house"></i>
                                    <div style={{ color: '#A6A6A6' }}>Workplace Culture</div>
                                </div>
                                <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>Life at Duxbed</h2>
                                <p style={{ color: '#A6A6A6', maxWidth: '800px', margin: '20px auto' }}>
                                    Experience a vibrant workplace culture where innovation meets collaboration, and every team member contributes to our shared success.
                                </p>
                            </div>

                            <div className="section-content mt-5">
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 m-b30">
                                        <div className="culture-item text-center" style={{
                                            padding: '30px',
                                            backgroundColor: '#f7f7f7',
                                            borderRadius: '10px',
                                            height: '100%'
                                        }}>
                                            <div className="icon-lg mb-3">
                                                <i className="bi bi-people-fill" style={{ fontSize: '48px', color: '#E69B0A' }}></i>
                                            </div>
                                            <h4 style={{ color: '#010101', marginBottom: '15px' }}>Team Events</h4>
                                            <p style={{ color: '#666' }}>
                                                Regular team building activities, celebrations, and events that bring our team together.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-lg-4 col-md-6 m-b30">
                                        <div className="culture-item text-center" style={{
                                            padding: '30px',
                                            backgroundColor: '#f7f7f7',
                                            borderRadius: '10px',
                                            height: '100%'
                                        }}>
                                            <div className="icon-lg mb-3">
                                                <i className="bi bi-trophy-fill" style={{ fontSize: '48px', color: '#E69B0A' }}></i>
                                            </div>
                                            <h4 style={{ color: '#010101', marginBottom: '15px' }}>Recognition</h4>
                                            <p style={{ color: '#666' }}>
                                                We celebrate achievements and recognize outstanding contributions from our team members.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-lg-4 col-md-6 m-b30">
                                        <div className="culture-item text-center" style={{
                                            padding: '30px',
                                            backgroundColor: '#f7f7f7',
                                            borderRadius: '10px',
                                            height: '100%'
                                        }}>
                                            <div className="icon-lg mb-3">
                                                <i className="bi bi-graph-up-arrow" style={{ fontSize: '48px', color: '#E69B0A' }}></i>
                                            </div>
                                            <h4 style={{ color: '#010101', marginBottom: '15px' }}>Growth Opportunities</h4>
                                            <p style={{ color: '#666' }}>
                                                Continuous learning and career development programs to help you grow professionally.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="testimonials-section mt-5">
                                <div className="section-head center mb-4">
                                    <h3 style={{ color: '#010101' }}>Employee Testimonials</h3>
                                </div>
                                {employeeTestimonials.length > 0 ? (
                                    <div className="employee-testimonial-carousel owl-carousel owl-btn-bottom-center m-b30" data-react-carousel="true" key={`employee-testimonials-${employeeTestimonials.length}`}>
                                        {employeeTestimonials.map((testimonial, index) => {
                                            const rating = testimonial.rating || 5;
                                            return (
                                                <div key={testimonial.id || index} className="item">
                                                    <div className="testimonial-box" style={{
                                                        padding: '30px',
                                                        backgroundColor: '#f7f7f7',
                                                        borderRadius: '10px',
                                                        height: '100%',
                                                        margin: '0 15px'
                                                    }}>
                                                        <div className="testimonial-content">
                                                            <i className="bi bi-quote" style={{ fontSize: '32px', color: '#E69B0A', marginBottom: '15px' }}></i>
                                                            <p style={{ color: '#666', fontStyle: 'italic', margin: '20px 0', lineHeight: '1.8' }}>
                                                                "{testimonial.testimonial_text || testimonial.text}"
                                                            </p>
                                                            <div className="testimonial-author" style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                                                                {testimonial.image_url && (
                                                                    <img
                                                                        src={testimonial.image_url}
                                                                        alt={testimonial.client_name || testimonial.name}
                                                                        style={{
                                                                            width: '60px',
                                                                            height: '60px',
                                                                            borderRadius: '50%',
                                                                            objectFit: 'cover',
                                                                            marginRight: '15px',
                                                                            flexShrink: 0
                                                                        }}
                                                                    />
                                                                )}
                                                                <div style={{ flex: 1 }}>
                                                                    <strong style={{ color: '#010101', display: 'block', fontSize: '16px', marginBottom: '5px' }}>
                                                                        {testimonial.client_name || testimonial.name}
                                                                    </strong>
                                                                    <span style={{ color: '#E69B0A', display: 'block', fontSize: '14px', marginBottom: '8px' }}>
                                                                        {testimonial.location || ''}
                                                                    </span>
                                                                    <div className="testimonial-rating" style={{ display: 'flex', gap: '3px' }}>
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <i
                                                                                key={i}
                                                                                className={`bi bi-star${i < rating ? '-fill' : ''}`}
                                                                                style={{ color: i < rating ? '#E69B0A' : '#ddd', fontSize: '16px' }}
                                                                            ></i>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div style={{
                                            backgroundColor: '#f7f7f7',
                                            padding: '40px',
                                            borderRadius: '10px',
                                            maxWidth: '600px',
                                            margin: '0 auto'
                                        }}>
                                            <i className="bi bi-people" style={{ fontSize: '48px', color: '#A6A6A6', marginBottom: '20px' }}></i>
                                            <h4 style={{ color: '#010101', marginBottom: '10px' }}>No Employee Testimonials Available</h4>
                                            <p style={{ color: '#666', fontSize: '16px' }}>
                                                Employee testimonials will appear here once they are added through the admin panel.
                                            </p>
                                        </div>
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

            <style>{`
                .employee-testimonial-carousel .owl-nav {
                    text-align: center;
                    margin-top: 30px;
                }

                .employee-testimonial-carousel .owl-nav button {
                    background: linear-gradient(135deg, #E69B0A 0%, #D48909 100%) !important;
                    color: #FFFFFF !important;
                    border: none !important;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    margin: 0 10px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(230, 155, 10, 0.3);
                }

                .employee-testimonial-carousel .owl-nav button:hover {
                    background: linear-gradient(135deg, #D48909 0%, #E69B0A 100%) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(230, 155, 10, 0.4);
                }

                .employee-testimonial-carousel .owl-nav button.owl-prev,
                .employee-testimonial-carousel .owl-nav button.owl-next {
                    position: relative;
                }

                .employee-testimonial-carousel .owl-nav button.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .employee-testimonial-carousel .item {
                    padding: 0 15px;
                }

                @media (max-width: 768px) {
                    .employee-testimonial-carousel .owl-nav button {
                        width: 40px;
                        height: 40px;
                        font-size: 16px;
                        margin: 0 5px;
                    }
                }
            `}</style>
        </>
    );
}