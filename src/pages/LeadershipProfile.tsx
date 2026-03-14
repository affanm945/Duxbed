import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { publicApiCall, API_ENDPOINTS } from '../config/api';

function slugFromName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const LeadershipProfile: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [leader, setLeader] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchAndResolve = async () => {
      if (!idOrSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const response = await publicApiCall(API_ENDPOINTS.content.leadership);
        const list: any[] = response?.success && response?.data ? response.data : [];
        const param = idOrSlug;
        const found =
          list.find((l: any) => l.id != null && String(l.id) === param) ??
          list.find((l: any) => slugFromName(l.name) === param) ??
          (/\d+/.test(param) ? list[parseInt(param, 10)] : null);
        if (found) {
          setLeader(found);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        console.error('Error fetching leadership:', e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAndResolve();
  }, [idOrSlug]);

  if (loading) {
    return (
      <>
        <div className="page-wraper leadership-profile-page">
          <Header />
          <div className="page-content" style={{ paddingTop: '100px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#666' }}>Loading...</div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (notFound || !leader) {
    return (
      <>
        <div className="page-wraper leadership-profile-page">
          <Header />
          <div className="page-content" style={{ paddingTop: '100px', padding: '100px 20px 80px', textAlign: 'center' }}>
            <h1 style={{ color: '#010101', marginBottom: '16px' }}>Leader not found</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>The requested leadership profile could not be found.</p>
            <NavLink to="/our-leadership" className="site-button" style={{ color: '#E69B0A', fontWeight: 600 }}>
              Back to Our Leadership
            </NavLink>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-wraper leadership-profile-page">
        <Header />

        <div
          className="page-content"
          style={{
            paddingTop: '100px',
            minHeight: '100vh',
          }}
        >
          {/* Breadcrumb / back link - stays below header */}
          <div
            className="leadership-profile-breadcrumb"
            style={{
              borderBottom: '1px solid #eee',
              padding: '12px 0',
              backgroundColor: '#fff',
            }}
          >
            <div className="container" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <nav style={{ fontSize: '14px' }}>
                <NavLink
                  to="/our-leadership"
                  style={{
                    color: '#010101',
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="bi bi-chevron-left" aria-hidden="true"></i>
                  Back to Leadership
                </NavLink>
              </nav>
            </div>
          </div>

          {/* Main profile section - scroll-margin so header doesn't cover when scrolling */}
          <section
            className="leadership-profile-main"
            style={{
              paddingTop: '2rem',
              paddingBottom: '3rem',
              backgroundColor: '#fff',
              scrollMarginTop: '100px',
            }}
          >
            <div className="container">
              <div
                className="leadership-profile-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(320px, 460px) 1fr',
                  gap: '2.5rem',
                  alignItems: 'start',
                  maxWidth: '1200px',
                  margin: '0 auto',
                }}
              >
                {/* Profile image - larger card, fixed aspect ratio */}
                <div
                  className="leadership-profile-image-wrap"
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                    aspectRatio: '3 / 4',
                    maxHeight: '640px',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <img
                    src={leader.image_url || leader.image || 'images/testimonials/testi4.png'}
                    alt={leader.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      display: 'block',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'images/testimonials/testi4.png';
                    }}
                  />
                </div>

                {/* Content - readable width, full content visible */}
                <div
                  className="leadership-profile-content"
                  style={{
                    paddingTop: '0.5rem',
                    minWidth: 0,
                  }}
                >
                  <h1
                    style={{
                      color: '#010101',
                      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {leader.name}
                  </h1>
                  <p
                    style={{
                      color: '#E69B0A',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1.5rem',
                    }}
                  >
                    {leader.position}
                  </p>
                  <div
                    className="leadership-profile-bio"
                    style={{
                      color: '#444',
                      fontSize: '1rem',
                      lineHeight: 1.8,
                      maxWidth: '56ch',
                      maxHeight: '420px',
                      overflowY: 'auto',
                      paddingRight: '8px',
                    }}
                  >
                    {(leader.bio || 'No bio available.').split(/\n\n+/).map((para: string, i: number) => (
                      <p key={i} style={{ marginBottom: '1.25em' }}>
                        {para}
                      </p>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {leader.email && (
                      <p style={{ fontSize: '0.9375rem', margin: 0 }}>
                        <a
                          href={`mailto:${leader.email}`}
                          style={{ color: '#E69B0A', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {leader.email}
                        </a>
                      </p>
                    )}
                    {leader.linkedin_url && (
                      <p style={{ margin: 0 }}>
                        <a
                          href={leader.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#E69B0A', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}
                        >
                          LinkedIn profile
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>

      <style>{`
        .leadership-profile-page .page-content {
          padding-top: 100px;
        }
        .leadership-profile-bio::-webkit-scrollbar {
          width: 6px;
        }
        .leadership-profile-bio::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 3px;
        }
        .leadership-profile-bio::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        @media (max-width: 768px) {
          .leadership-profile-card {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .leadership-profile-image-wrap {
            max-height: 420px !important;
            aspect-ratio: 4 / 5 !important;
          }
          .leadership-profile-bio {
            max-height: 320px !important;
          }
          .leadership-profile-page .page-content {
            padding-top: 90px;
          }
        }
      `}</style>
    </>
  );
};

export default LeadershipProfile;