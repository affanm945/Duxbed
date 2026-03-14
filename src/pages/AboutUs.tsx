import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, NavLink } from "react-router-dom";
import { publicApiCall, API_ENDPOINTS } from '../config/api';

function AboutPage() {
  const [content, setContent] = useState<any>({});
  const [timeline, setTimeline] = useState<any[]>([]);
  const [leadership, setLeadership] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        const contentResponse = await publicApiCall(API_ENDPOINTS.content.aboutUs);
        if (contentResponse && contentResponse.success && contentResponse.data) {
          const sections: any = {};
          contentResponse.data.forEach((section: any) => {
            sections[section.section_key] = section;
          });
          setContent(sections);
        }

        // Fetch Timeline data
        const timelineResponse = await publicApiCall(API_ENDPOINTS.content.storyTimeline);
        if (timelineResponse && timelineResponse.success && timelineResponse.data) {
          setTimeline(timelineResponse.data);
        }

        // Fetch Leadership data
        const leadershipResponse = await publicApiCall(API_ENDPOINTS.content.leadership);
        if (leadershipResponse && leadershipResponse.success && leadershipResponse.data) {
          setLeadership(leadershipResponse.data);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllContent();
  }, []);

  // Helper to get content with fallback
  const getContent = (key: string, fallback: string) => {
    return content[key]?.content || content[key]?.title || fallback;
  };

  // Get all explicitly used section keys (sections already displayed in JSX)
  const usedSectionKeys = ['welcome', 'core_purpose', 'core_values', 'tagline', 'promise_subtitle', 'promise', 'vision', 'mission', 'journey_subtitle', 'journey', 'team_subtitle', 'team'];

  // Get dynamic sections (sections not explicitly used in JSX), sorted by display_order
  const dynamicSections = Object.keys(content)
    .filter(key => !usedSectionKeys.includes(key) && content[key] && (content[key].is_active === 1 || content[key].is_active === true))
    .sort((a, b) => (content[a].display_order || 0) - (content[b].display_order || 0));

  const getShortLeadershipBio = (bio?: string) => {
    if (!bio) return '';
    const maxLength = 140;
    if (bio.length <= maxLength) return bio;
    return bio.slice(0, maxLength).trimEnd() + '...';
  };

  const getLeaderSlug = (leader: { id?: string | number; name?: string }, index: number) => {
    if (leader.id != null) return String(leader.id);
    const slug = (leader.name || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    return slug || String(index);
  };

  return (
    <>
      <div className="page-wraper">
        <Header />

        {/* CONTENT START */}
        <div className="page-content">
          <div className="wt-bnr-inr overlay-wraper bg-center">
            <div className="overlay-main innr-bnr-olay"></div>
            <div className="wt-bnr-inr-entry">
              <div className="banner-title-outer">
                <div className="banner-title-name">
                  <h2 className="wt-title" style={{ color: '#010101' }}>About Us</h2>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            .leadership-card-link { cursor: pointer; outline: none; }
            .leadership-card-link:hover .leadership-card,
            .leadership-card-link:focus-visible .leadership-card {
              box-shadow: 0 16px 40px rgba(0,0,0,0.12);
              transform: translateY(-4px);
            }
          `}</style>
          <div className="section-full p-t120  p-b30  about-section-one-wrap">
            <div className="about-section-one">
              <div className="container">
                <div className="section-content">
                  <div className="row">

                    <div className="col-lg-7 col-md-12 m-b30 about-max-two-position">
                      <div className="about-max-two">
                        <div className="about-max-two-media"><img src="images/about/l-pic.png" alt="" /></div>
                        <div className="about-max-two-media2-wrap">
                          <div className="about-max-two-media2">
                            <img src="images/about/about-img2.png" alt="" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-5 col-md-12 m-b30">
                      <div className="about-section-two-right">
                        <div className="section-head left wt-small-separator-outer">
                          <div className="wt-small-separator site-text-primary">
                            <i className="bi bi-house"></i>
                            <div style={{ color: '#A6A6A6' }}>{content.welcome?.title || 'Welcome Duxbed Home'}</div>
                          </div>
                          <h2 className="title_split_anim" style={{ color: '#010101' }}>{content.welcome?.title || 'Where Craft and Style Converge'}</h2>
                          <p style={{ color: '#A6A6A6' }}>{getContent('welcome', 'Welcome to Duxbed Furniture, a place where furniture is crafted for comfort. At Duxbed, you get to enjoy a variety of high-quality furnishings in the comfort of your home. With our elegant sofas, ergonomic chairs, stylish dining sets, and spacious wardrobes, every item is specially designed to bring out your lifestyle. Our priorities are top-quality materials, long-lasting durability, and elegant design that transforms your house into a comfortable home. Whether it is an old space that you need to furnish or a new one, Duxbed is your go-to solution for furnishing your living environment with beautiful, comfortable living areas. Go into the mystery of the fine living with us!')}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ABOUT ONE SECTION END */}

          {/* ABOUT ONE SECTION START */}
          <div className="section-full p-t120  p-b30  about-section-one-wrap" style={{ backgroundColor: '#f7f7f7' }}>
            <div className="about-section-one">
              <div className="container">
                <div className="section-content">
                  <div className="row">

                    <div className="col-lg-5 col-md-12 m-b30">
                      <div className="about-section-two-right">
                        {/* TITLE START*/}
                        <div className="section-head left wt-small-separator-outer">
                          <div className="site-text-primary">
                            <div style={{
                              marginBottom: '20px',
                              position: 'relative',
                              display: 'inline-block',
                              fontSize: '16px',
                              lineHeight: '22px',
                              fontWeight: 600,
                              letterSpacing: '2px',
                              color: '#6a6560',
                              textTransform: 'uppercase',
                              zIndex: 1
                            }}><b style={{ color: '#A6A6A6' }}>{content.core_purpose?.title || 'Our core purpose'}</b></div>
                          </div>
                          <h2 className="title_split_anim" style={{ color: '#010101' }}>{getContent('core_purpose', 'To create the updated lifestyle')}</h2>
                          <p></p>
                        </div>
                        {/* TITLE END*/}
                        <div className="our-skills-item-wrap wow">
                          <div className="section-head left wt-small-separator-outer">
                            <div className="site-text-primary">
                              <div style={{
                                marginBottom: '20px',
                                position: 'relative',
                                display: 'inline-block',
                                fontSize: '16px',
                                lineHeight: '22px',
                                fontWeight: 600,
                                letterSpacing: '2px',
                                color: '#6a6560',
                                textTransform: 'uppercase',
                                zIndex: 1
                              }}><b style={{ color: '#A6A6A6' }}>{content.core_values?.title || 'Our core values'}</b></div>
                            </div>
                          </div>
                          <div className="row">

                            <div className="col-md-12 m-b30">
                              <div className="our-skills-item">
                                <span className="progressText">Customer Commitment</span>
                                <div className="progress-box">
                                  <div className="progress">
                                    <div className="progress-bar wow progress-bar-anim site-bg-primary" data-wow-delay="0ms" data-wow-duration="2000ms" role="progressbar" style={{ '--progress-bar-count': '100%', color: '#E69B0A' } as React.CSSProperties}>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-12 m-b30">
                              <div className="our-skills-item">
                                <span className="progressText">Quality Excellence</span>
                                <div className="progress-box">
                                  <div className="progress">
                                    <div className="progress-bar wow progress-bar-anim site-bg-primary" data-wow-delay="0ms" data-wow-duration="2000ms" role="progressbar" style={{ '--progress-bar-count': '100%' } as React.CSSProperties}>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-12 m-b30">
                              <div className="our-skills-item">
                                <span className="progressText">Innovation Mindset</span>
                                <div className="progress-box">
                                  <div className="progress">
                                    <div className="progress-bar wow progress-bar-anim site-bg-primary" data-wow-delay="0ms" data-wow-duration="2000ms" role="progressbar" style={{ '--progress-bar-count': '100%' } as React.CSSProperties}>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                        <div className="section-head left wt-small-separator-outer">
                          <div className="site-text-primary">
                            <div style={{
                              marginBottom: '20px',
                              position: 'relative',
                              display: 'inline-block',
                              fontSize: '16px',
                              lineHeight: '22px',
                              fontWeight: 600,
                              letterSpacing: '2px',
                              color: '#6a6560',
                              textTransform: 'uppercase',
                              zIndex: 1
                            }}><b style={{ color: '#A6A6A6' }}>{content.tagline?.title || 'Our Tagline'}</b></div>
                          </div>
                          <h2 style={{ color: '#010101' }} dangerouslySetInnerHTML={{ __html: content.tagline?.content || content.tagline?.title || 'Your <span class="underline-word" style="color: #E69B0A">Needs.</span>  Our First Priority.' }}></h2>
                          <p></p>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-7 col-md-12 m-b30 about-max-two-position">
                      <div className="about-max">
                        <div className="about-max-two-media"><img src="images/about/core-value3.png" alt="" /></div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ABOUT ONE SECTION END */}

          {/* ABOUT-SECTION-2 SECTION START */}
          <div className="section-full  p-t120 p-b0 twm-ab3-section-wrap" style={{ backgroundImage: 'url(images/background/about-bg2.png)' }}>
            <div className="container">
              <div className="section-content">
                <div className="twm-ab-section-bx" style={{ maxWidth: '750px' }}>
                  {/* TITLE START*/}
                  <div className="section-head left wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                      <i className="bi bi-house"></i>
                      <div style={{ color: '#A6A6A6' }}>{content.promise_subtitle?.title || content.promise_subtitle?.content || 'What we follow'}</div>
                    </div>
                    <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>{content.promise?.title || 'Quality Crafted. Promise Delivered.'}</h2>
                  </div>
                  {/* TITLE END*/}

                  <div className="wt-accordion" id="accordion-two">

                    {/*Two*/}
                    <div className="panel wt-panel">
                      <div className="acod-head" id="headingTwo">
                        <h4 className="acod-title">
                          <a className="collapsed" data-bs-toggle="collapse" href="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                            Vision
                            <span className="indicator"><i className="bi bi-plus"></i></span>
                          </a>
                        </h4>
                      </div>
                      <div id="collapseTwo" className="collapse show" aria-labelledby="headingTwo" data-bs-parent="#accordion-two">
                        <div className="acod-content p-tb15">
                          {getContent('vision', 'To be a major brand name in the furniture business and deliver excellence in whatever we commit. We aim to redefine modern living by innovation, artisanship, and elegance.')}
                        </div>
                      </div>
                    </div>

                    {/*Three*/}
                    <div className="panel wt-panel">
                      <div className="acod-head" id="headingThree">
                        <h4 className="acod-title">
                          <a className="collapsed" data-bs-toggle="collapse" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            Mission
                            <span className="indicator"><i className="bi bi-plus"></i></span>
                          </a>
                        </h4>
                      </div>
                      <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-bs-parent="#accordion-two">
                        <div className="acod-content p-tb15">
                          {getContent('mission', 'To create quality pieces of furniture that are comfortable and stylish and improve the quality of day-to-day lives. At Duxbed, we deliver the best home solutions that are of high quality and a sensational blend of durability, design, and purpose.')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-full twm-product-v-scroll-wrap">
            <div className="container">
              <div className="section-head center wt-small-separator-outer" style={{ marginTop: '60px', marginBottom: '20px !important' }}>
                <div className="wt-small-separator site-text-primary">
                  <i className="bi bi-house"></i>
                  <div style={{ color: '#A6A6A6' }}>{content.journey_subtitle?.title || content.journey_subtitle?.content || 'Go through'}</div>
                </div>
                <h2 className="wt-title  title_split_anim" style={{ color: '#010101' }}>{content.journey?.title || 'Our story'}</h2>
                <p
                  style={{
                    maxWidth: '700px',
                    margin: '10px auto 0',
                    color: '#666666',
                    fontSize: '16px',
                    marginTop: '20px'
                  }}
                >
                  Duxbed Innovations Pvt Ltd has grown steadily from incorporation to nationwide expansion, focusing on innovative
                  furniture and home automation solutions. This timeline highlights key milestones in its journey, reflecting strategic
                  progress in operations, infrastructure, and market presence.
                </p>
              </div>
              {!loading && timeline.length === 0 ? (
                <div className="text-center" style={{ padding: '10px 5px' }}>
                  <div style={{
                    backgroundColor: '#f7f7f7',
                    padding: '40px',
                    borderRadius: '10px',
                    display: 'inline-block',
                    maxWidth: '600px'
                  }}>
                    <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#A6A6A6', marginBottom: '20px', display: 'block' }}></i>
                    <h3 style={{ color: '#010101', marginBottom: '10px' }}>No Timeline Data Found</h3>
                    <p style={{ color: '#666', fontSize: '16px' }}>Timeline information is not available at the moment. Please check back later.</p>
                  </div>
                </div>
              ) : (
                <div className="locker">
                  <div className="locker__image">
                    {timeline.length > 0 ? timeline.map((event, index) => (
                      <div key={event.id} className="locker__container">
                        <img
                          className={`image image--${index + 1}`}
                          src={event.image_url || `images/scroll${index + 1}.png`}
                          alt={event.title}
                        />
                      </div>
                    )) : null}
                  </div>

                  <div className="locker__content">
                    {timeline.length > 0 ? timeline.map((event, index) => (
                      <div
                        key={event.id}
                        className={`locker__section locker__section--${index + 1} cb`}
                        data-swap={`image--${index + 1}`}
                      >
                        <div className="twm-product-v-scroll-bx">
                          <div className="twm-product-v-image-on-responsive">
                            <img
                              src={event.image_url || `images/scroll${index + 1}.png`}
                              alt={event.title}
                            />
                          </div>
                          <h3
                            className="twm-product-v-scroll-title"
                            style={{
                              fontSize: '26px',
                              fontWeight: 700,
                              color: '#010101',
                              marginBottom: '8px',
                            }}
                          >
                            <a href="#!" style={{ color: '#010101', textDecoration: 'none' }}>
                              {event.title || event.year}
                            </a>
                          </h3>
                          <div
                            className="twm-product-v-scroll-count"
                            style={{
                              fontSize: '60px',
                              fontWeight: 700,
                              color: '#E69B0A',
                              marginBottom: '12px',
                            }}
                          >
                            {event.year}
                          </div>
                          <div className="twm-product-v-scroll-content">
                            <p style={{ margin: 0 }}>
                              {event.description || 'No description available.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) : null}
                  </div>

                </div>
              )}
            </div>
          </div>
          {/* PROJECT SECTION  End */}

          {/* GET IN TOUCH */}
          <div className="section-full  get-intouch-style-2-wrap parallax-section">
            <div className="get-intouch-style-2  overlay-wraper p-t120 p-b120 parallax-image" style={{ backgroundImage: 'url(images/background/interior-og.png)' }}></div>
            <div className="get-intouch-style-2-inner site-text-white">
              <span>Duxbed Interiors</span>
              <h2 className="wt-title site-text-white title_split_anim">A new look to your home interiors</h2>
              <div className="site-center-btn text-center">
                <NavLink to="/locate-us" className="site-button" style={{ color: '#FFFFFF', backgroundColor: '#E69B0A', borderColor: '#E69B0A' }} >Visit</NavLink>
              </div>
            </div>
          </div>

          {/* OUR TEAM START */}
          <div className="section-full p-t120 p-b90 twm-team-box1-wraper">
            <div className="container">
              {/* TITLE START*/}
              <div className="section-head center wt-small-separator-outer">
                <div className="wt-small-separator site-text-primary">
                  <i className="bi bi-house"></i>
                  <div>{content.team_subtitle?.title || content.team_subtitle?.content || 'Meet Our Team'}</div>
                </div>
                <h2 className="wt-title  title_split_anim">{content.team?.title || 'Leading the Way'}</h2>
              </div>
            </div>

            <div className="container">
              <div className="section-content">
                {(() => {
                  const leaders = leadership.length > 0 ? leadership.slice(0, 4) : [
                    { name: 'Leadership Member 1', position: 'Chairman', image_url: 'images/testimonials/testi4.png', bio: 'Providing strategic vision and guiding the overall direction of Duxbed.' },
                    { name: 'Leadership Member 2', position: 'Director', image_url: 'images/testimonials/testi4.png', bio: 'Driving growth and ensuring operational excellence across all departments.' },
                    { name: 'Leadership Member 3', position: 'CEO', image_url: 'images/testimonials/testi4.png', bio: 'Leading Duxbed with a customer-first mindset and commitment to quality.' }
                  ];

                  if (!leaders || leaders.length === 0) {
                    return null;
                  }

                  /* MD card – separate style and CSS */
                  const leadershipCardStylesMD = {
                    card: {
                      borderRadius: '20px',
                      overflow: 'hidden' as const,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                      display: 'flex' as const,
                      flexDirection: 'column' as const,
                      backgroundColor: '#FFFFFF',
                      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    },
                    imageSection: {
                      backgroundColor: '#E69B0A',
                      padding: '0px 22px 0px 7px',
                      display: 'flex' as const,
                      alignItems: 'flex-end' as const,
                      justifyContent: 'center' as const,
                      minHeight: '230px',
                    },
                    imageWrap: { width: '100%' as const, maxWidth: '310px', lineHeight: 0 },
                    image: { width: '100%' as const, height: 'auto' as const, display: 'block' as const },
                    textSection: {
                      padding: '18px 18px 22px',
                      textAlign: 'center' as const,
                      backgroundColor: '#FFFFFF',
                    },
                    position: {
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#010101',
                      letterSpacing: '0.18em',
                      marginBottom: '6px',
                    },
                    name: { fontSize: '15px', fontWeight: 500, color: '#111111', marginBottom: '10px' },
                    line: { width: '40px', height: '2px', backgroundColor: '#111111', margin: '0 auto' },
                  };

                  /* Other three (CEO, COO, CFO) – separate style and CSS */
                  const leadershipCardStylesMember = {
                    card: {
                      borderRadius: '20px',
                      overflow: 'hidden' as const,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                      display: 'flex' as const,
                      flexDirection: 'column' as const,
                      backgroundColor: '#FFFFFF',
                      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    },
                    imageSection: {
                      backgroundColor: '#E69B0A',
                      padding: '28px 22px 0',
                      display: 'flex' as const,
                      alignItems: 'flex-end' as const,
                      justifyContent: 'center' as const,
                      minHeight: '230px',
                    },
                    imageWrap: { width: '100%' as const, maxWidth: '310px', lineHeight: 0 },
                    image: { width: '100%' as const, height: 'auto' as const, display: 'block' as const },
                    textSection: {
                      padding: '18px 18px 22px',
                      textAlign: 'center' as const,
                      backgroundColor: '#FFFFFF',
                    },
                    position: {
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#010101',
                      letterSpacing: '0.18em',
                      marginBottom: '6px',
                    },
                    name: { fontSize: '15px', fontWeight: 500, color: '#111111', marginBottom: '10px' },
                    line: { width: '40px', height: '2px', backgroundColor: '#111111', margin: '0 auto' },
                  };

                  const renderLeadershipCardMD = (leader: any, index: number) => (
                    <NavLink
                      to={`/our-leadership/${getLeaderSlug(leader, index)}`}
                      className="leadership-card-link"
                      style={{ display: 'block', textDecoration: 'none', color: 'inherit', height: '100%' }}
                    >
                      <div className="leadership-card leadership-card-md-inner" style={leadershipCardStylesMD.card}>
                        <div style={leadershipCardStylesMD.imageSection}>
                          <div style={leadershipCardStylesMD.imageWrap}>
                            <img
                              src={leader.image_url || leader.image || 'images/testimonials/testi4.png'}
                              alt={leader.name || 'Leadership Member'}
                              style={leadershipCardStylesMD.image}
                            />
                          </div>
                        </div>
                        <div style={leadershipCardStylesMD.textSection}>
                          <div style={leadershipCardStylesMD.position}>{leader.position}</div>
                          <div style={leadershipCardStylesMD.name}>{leader.name}</div>
                          <div style={leadershipCardStylesMD.line} />
                        </div>
                      </div>
                    </NavLink>
                  );

                  const renderLeadershipCardMember = (leader: any, index: number) => (
                    <NavLink
                      to={`/our-leadership/${getLeaderSlug(leader, index)}`}
                      className="leadership-card-link"
                      style={{ display: 'block', textDecoration: 'none', color: 'inherit', height: '100%' }}
                    >
                      <div className="leadership-card leadership-card-member-inner" style={leadershipCardStylesMember.card}>
                        <div style={leadershipCardStylesMember.imageSection}>
                          <div style={leadershipCardStylesMember.imageWrap}>
                            <img
                              src={leader.image_url || leader.image || 'images/testimonials/testi4.png'}
                              alt={leader.name || 'Leadership Member'}
                              style={leadershipCardStylesMember.image}
                            />
                          </div>
                        </div>
                        <div style={leadershipCardStylesMember.textSection}>
                          <div style={leadershipCardStylesMember.position}>{leader.position}</div>
                          <div style={leadershipCardStylesMember.name}>{leader.name}</div>
                          <div style={leadershipCardStylesMember.line} />
                        </div>
                      </div>
                    </NavLink>
                  );

                  const mdLeader = leaders[0];
                  const otherLeaders = leaders.slice(1, 4);

                  return (
                    <div className="row justify-content-center">
                      <div
                        className="col-xl-3 col-lg-3 col-md-6 m-b30 leadership-card-md"
                        key={(mdLeader as any).id || (mdLeader as any).name || 1}
                      >
                        {renderLeadershipCardMD(mdLeader as any, 0)}
                      </div>
                      {otherLeaders.map((leader, index) => (
                        <div
                          key={(leader as any).id || (leader as any).name || index + 2}
                          className="col-xl-3 col-lg-3 col-md-6 m-b30 leadership-card-member"
                        >
                          {renderLeadershipCardMember(leader as any, index + 1)}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          {/* OUR TEAM SECTION END */}

          {/* DYNAMIC SECTIONS - Auto-display any new sections from API */}
          {dynamicSections.length > 0 && dynamicSections.map((sectionKey) => {
            const section = content[sectionKey];
            if (!section) return null;

            return (
              <div key={sectionKey} className="section-full p-t120 p-b90" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="container">
                  <div className="section-head center wt-small-separator-outer">
                    {section.title && (
                      <div className="wt-small-separator site-text-primary">
                        <i className="bi bi-house"></i>
                        <div style={{ color: '#A6A6A6' }}>{section.title}</div>
                      </div>
                    )}
                    {section.content && (
                      <h2 className="wt-title title_split_anim" style={{ color: '#010101' }}>{section.title || section.section_key}</h2>
                    )}
                  </div>

                  <div className="section-content mt-5">
                    <div className="row justify-content-center">
                      <div className="col-lg-10">
                        <div style={{
                          backgroundColor: '#f7f7f7',
                          padding: '40px',
                          borderRadius: '10px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                          {section.image_url && (
                            <div className="text-center mb-4">
                              <img
                                src={section.image_url}
                                alt={section.title || section.section_key}
                                style={{ maxWidth: '100%', borderRadius: '8px' }}
                              />
                            </div>
                          )}
                          <div
                            style={{ color: '#666', fontSize: '16px', lineHeight: '1.8' }}
                            dangerouslySetInnerHTML={{ __html: section.content || '' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Slide In Box */}
          <div className="slide-in" id="slideInBox">
            <div className="text">
              <h4 style={{ color: '#000', fontSize: '25px' }}>Proud Member</h4>
            </div>
            <img src="images/cc1.png" alt="Example Image" />
          </div>

        </div>
        {/* CONTENT END */}

        <Footer />
      </div>
    </>
  );
}

export default AboutPage;