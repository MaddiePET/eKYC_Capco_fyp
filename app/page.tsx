"use client"; 

import Image from "next/image";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [fadeClass, setFadeClass] = useState('fade-in');

  const renderStars = (count: number) => {
    return [...Array(count)].map((_, i) => (
      <span key={i} style={{ color: "#f0ca8e" }}>★</span>
    ));
  };

  const testimonials = [
    {
      name: "Alice Johnson",
      text: "DTCOB's onboarding platform has made my life so much easier. I was able to complete my onboarding in just minutes, and the process was simple and intuitive!",
      stars: 5,
      image: "/images/fake-profile1.jpg",
    },
    {
      name: "Bob Smith",
      text: "The digital-first approach at DTCOB made the whole process hassle-free. I felt in control the entire time, and I’m now fully onboarded!",
      stars: 4,
      image: "/images/fake-profile2.jpg",
    },
    {
      name: "Catherine Lee",
      text: "I love how DTCOB’s platform doesn’t require me to jump through hoops. It’s quick, secure, and easy. I’ve already recommended it to others!",
      stars: 5,
      image: "/images/fake-profile3.jpg",
    },
    {
      name: "David Williams",
      text: "The entire onboarding experience was smooth and user-friendly. I had no issues at all, and I felt fully informed throughout the process.",
      stars: 4,
      image: "/images/fake-profile4.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass('fade-out');

      setTimeout(() => {
        setCurrentTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
        setFadeClass('fade-in');
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Navigation Section */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <Image src="/images/logos.png" alt="Tiya Golf Club" className="navbar-brand-image img-fluid" width={100} height={100} />
            <span className="navbar-brand-text">DTCOB</span>
          </a>

          <div className="d-lg-none ms-auto me-3">
            <a className="btn custom-btn custom-border-btn" data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample">Member Login</a>
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-lg-auto">
              <li className="nav-item">
                <a className="nav-link click-scroll" href="#section_1">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link click-scroll" href="#section_2">Team</a>
              </li>
              <li className="nav-item">
                <a className="nav-link click-scroll" href="#section_3">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link click-scroll" href="#section_4">Compliances</a>
              </li>
              <li className="nav-item">
                <a className="nav-link click-scroll" href="#section_5">Contact Us</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarLightDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">Pages</a>
                <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="navbarLightDropdownMenuLink">
                  <li><a className="dropdown-item" href="/dashboard">Dashboard</a></li>
                  <li><a className="dropdown-item" href="event-detail.html">Event Detail</a></li>
                </ul>
              </li>
            </ul>

            <div className="d-none d-lg-block ms-lg-3">
              <Link href="/auth/login" className="btn custom-btn custom-border-btn" role="button">
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Section */}
      <div className="offcanvas offcanvas-end" data-bs-scroll="true" tabIndex={-1} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasExampleLabel">Member Login</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div className="offcanvas-body d-flex flex-column">
          <form className="custom-form member-login-form" action="#" method="post" role="form">
            <div className="member-login-form-body">
              <div className="mb-4">
                <label className="form-label mb-2" htmlFor="member-login-number">Membership No.</label>
                <input type="text" name="member-login-number" id="member-login-number" className="form-control" placeholder="11002560" required />
              </div>

              <div className="mb-4">
                <label className="form-label mb-2" htmlFor="member-login-password">Password</label>
                <input type="password" name="member-login-password" id="member-login-password" pattern="[0-9a-zA-Z]{4,10}" className="form-control" placeholder="Password" required />
              </div>

              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                <label className="form-check-label" htmlFor="flexCheckDefault">Remember me</label>
              </div>

              <div className="col-lg-5 col-md-7 col-8 mx-auto">
                <button type="submit" className="form-control">Login</button>
              </div>

              <div className="text-center my-4">
                <a href="#">Forgotten password?</a>
              </div>
            </div>
          </form>

          <div className="mt-auto mb-5">
            <p>
              <strong className="text-white me-3">Any Questions?</strong>
              <a href="tel:010-020-0340" className="contact-link">010-020-0340</a>
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <section className="hero-section d-flex justify-content-center align-items-center" id="section_1">
        <div className="section-overlay"></div>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 400">
          <path fill="#3D405B" fillOpacity="1" d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,0L1405.7,0C1371.4,0,1303,0,1234,0C1165.7,0,1097,0,1029,0C960,0,891,0,823,0C754.3,0,686,0,617,0C548.6,0,480,0,411,0C342.9,0,274,0,206,0C137.1,0,69,0,34,0L0,0Z"></path>
        </svg>

        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-12 mb-5 mb-lg-0">
              <h1 className="text-white">Welcome to DTCOB</h1>

              <h2 className="cd-headline rotate-1 text-white mb-4 pb-2">
                <span>Revolutionizing Customer Onboarding with </span>
                <span className="cd-words-wrapper">
                  <b className="is-visible">Intelligent Automation</b>
                  <b>Instant Verification</b>
                  <b>Effortless Compliance</b>
                </span>
              </h2>

              <div className="custom-btn-group">
                <a href="/personalverification" className="btn custom-btn smoothscroll me-3">Personal Account</a>
                <a href="/businessverification" className="link smoothscroll">Business Account</a>
              </div>
            </div>

            <div className="col-lg-6 col-12">
              <div className="ratio ratio-16x9">
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/MGNgbNGOzh8"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#ffffff" fillOpacity="1" d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
        </svg>
      </section>

      {/* About Section */}
      <section className="about-section section-padding" id="section_2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-12 text-center">
              <h2 className="mb-lg-5 mb-4">Meet Our Team</h2>
            </div>

            <div className="col-lg-3 col-md-4 col-6 mb-4">
              <div className="member-block">
                <div className="member-block-image-wrap">
                  <Image
                    src="/images/members/portrait-young-handsome-businessman-wearing-suit-standing-with-crossed-arms-with-isolated-studio-white-background.jpg"
                    alt="Michael"
                    className="member-block-image img-fluid"
                    width={300}
                    height={400}
                  />
                  <ul className="social-icon">
                    <li className="social-icon-item">
                      <a href="#" className="social-icon-link bi-linkedin"></a>
                    </li>
                    <li className="social-icon-item">
                      <a href="#" className="social-icon-link bi-whatsapp"></a>
                    </li>
                  </ul>
                </div>
                <div className="member-block-info d-flex flex-column align-items-start">
                  <h6 className="mb-0">Myat Pan Ei Thu</h6>
                  <p className="mb-0">Founder</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-6 mb-4">
              <div className="member-block">
                <div className="member-block-image-wrap">
                  <Image
                    src="/images/members/successful-asian-lady-boss-red-blazer-holding-clipboard-with-documens-pen-working-looking-happy-white-background.jpg"
                    alt="Ashley"
                    className="member-block-image img-fluid"
                    width={300}
                    height={400}
                  />
                  <ul className="social-icon">
                    <li className="social-icon-item">
                      <a href="#" className="social-icon-link bi-linkedin"></a>
                    </li>
                    <li className="social-icon-item">
                      <a href="#" className="social-icon-link bi-whatsapp"></a>
                    </li>
                  </ul>
                </div>
                <div className="member-block-info d-flex flex-column align-items-start">
                  <h6 className="mb-0">Ashley Tang Way Yan</h6>
                  <p className="mb-0">Co-Founder</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-6 mb-4">
              <div className="member-block">
                <div className="member-block-image-wrap">
                  <Image
                    src="/images/members/successful-asian-lady-boss-red-blazer-holding-clipboard-with-documens-pen-working-looking-happy-white-background.jpg"
                    alt="Jerusha"
                    className="member-block-image img-fluid"
                    width={300}
                    height={400}
                  />
                  <ul className="social-icon">
                    <li className="social-icon-item">
                      <a href="#" className="social-icon-link bi-linkedin"></a>
                    </li>
                    <li className="social-icon-item">
                      <a href="#" className="social-icon-link bi-whatsapp"></a>
                    </li>
                  </ul>
                </div>
                <div className="member-block-info d-flex flex-column align-items-start">
                  <h6 className="mb-0">Jerusha Emmanuelle Dass</h6>
                  <p className="mb-0">Co-Founder</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-6 mb-4">
              <div className="member-block">
                <div className="member-block-image-wrap">
                  <Image
                    src="/images/members/successful-asian-lady-boss-red-blazer-holding-clipboard-with-documens-pen-working-looking-happy-white-background.jpg"
                    alt="Gabriella"
                    className="member-block-image img-fluid"
                    width={300}
                    height={400}
                  />
                  <ul className="social-icon">
                    <li className="social-icon-item">
                      <a href="#" className="social-icon-link bi-linkedin"></a>
                    </li>
                    <li className="social-icon-item">
                      <a href="#" className="social-icon-link bi-whatsapp"></a>
                    </li>
                  </ul>
                </div>
                <div className="member-block-info d-flex flex-column align-items-start">
                  <h6 className="mb-0">Gabriella Tio Pardede</h6>
                  <p className="mb-0">Co-Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-bg-image">
        <svg viewBox="0 0 1265 144" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 0 40 C 164 40 164 20 328 20 L 328 20 L 328 0 L 0 0 Z"
            strokeWidth="0"
          />
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 327 20 C 445.5 20 445.5 89 564 89 L 564 89 L 564 0 L 327 0 Z"
            strokeWidth="0"
          />
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 563 89 C 724.5 89 724.5 48 886 48 L 886 48 L 886 0 L 563 0 Z"
            strokeWidth="0"
          />
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 885 48 C 1006.5 48 1006.5 67 1128 67 L 1128 67 L 1128 0 L 885 0 Z"
            strokeWidth="0"
          />
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 1127 67 C 1196 67 1196 0 1265 0 L 1265 0 L 1265 0 L 1127 0 Z"
            strokeWidth="0"
          />
        </svg>

        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-12">
              <div className="section-bg-image-block">
                <h2 className="mb-lg-3">Stay Updated with Us</h2>
                <p>Sign up for our newsletter to receive the latest insights and updates on digital transformation in customer onboarding.</p>
                <form action="#" method="get" className="custom-form mt-lg-4 mt-2" role="form">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bi-envelope" id="basic-addon1"></span>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      pattern="[^ @]*@[^ @]*"
                      className="form-control"
                      placeholder="Email address"
                      required
                    />
                    <button type="submit" className="form-control">Subscribe</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <svg viewBox="0 0 1265 144" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 0 40 C 164 40 164 20 328 20 L 328 20 L 328 0 L 0 0 Z"
            strokeWidth="0"
          />
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 327 20 C 445.5 20 445.5 89 564 89 L 564 89 L 564 0 L 327 0 Z"
            strokeWidth="0"
          />
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 563 89 C 724.5 89 724.5 48 886 48 L 886 48 L 886 0 L 563 0 Z"
            strokeWidth="0"
          />
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 885 48 C 1006.5 48 1006.5 67 1128 67 L 1128 67 L 1128 0 L 885 0 Z"
            strokeWidth="0"
          />
          <path
            fill="rgba(255, 255, 255, 1)"
            d="M 1127 67 C 1196 67 1196 0 1265 0 L 1265 0 L 1265 0 L 1127 0 Z"
            strokeWidth="0"
          />
        </svg>
      </section>

      {/* Membership Section */}
      <section className="membership-section section-padding" id="section_3">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-12 text-center mx-auto mb-lg-5 mb-4">
            <h2><span>About</span> Us</h2>
          </div>

          <div className="col-lg-6 col-12 mb-3 mb-lg-0">
            <h4 className="mb-4 pb-lg-2">Our Core Values</h4>
            <div className="table-responsive">
              <table className="table table-bordered text-start">
                <tbody>
                  <tr>
                    <th style={{ width: "30%" }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <i className="bi bi-lightbulb-fill fs-2" style={{ color: '#f0ca8e', marginRight: '10px' }}></i>
                        <span className="text-center">Digital-First Solutions</span>
                      </div>
                    </th>
                    <td className="align-middle">At DTCOB, we offer innovative solutions that streamline the customer onboarding process.</td>
                  </tr>
                  <tr>
                    <th style={{ width: "25%" }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <i className="bi bi-card-checklist fs-2" style={{ color: '#f0ca8e', marginRight: '10px' }}></i>
                        <span className="text-center">Streamlined Onboarding</span>
                      </div>
                    </th>
                    <td className="align-middle">Simplifying the onboarding journey to reduce friction and increase efficiency.</td>
                  </tr>
                  <tr>
                    <th style={{ width: "25%" }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-lines-fill fs-2" style={{ color: '#f0ca8e', marginRight: '10px' }}></i>
                        <span className="text-center">Customer-Centric Approach</span>
                      </div>
                    </th>
                    <td className="align-middle">Focused on creating exceptional experiences that prioritize the needs of the customer.</td>
                  </tr>
                  <tr>
                    <th style={{ width: "25%" }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <i className="bi bi-gear-fill fs-2" style={{ color: '#f0ca8e', marginRight: '10px' }}></i>
                        <span className="text-center">Shaping the Future</span>
                      </div>
                    </th>
                    <td className="align-middle">Leveraging cutting-edge technology to redefine the future of banking and customer onboarding.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-lg-6 col-12 mb-3 mb-lg-0">
            <h4 className="mb-4 pb-lg-2">What Our Customers Say</h4>
            <div className="testimonial-carousel">
              <div
                className={`testimonial-item shadow-lg mb-4 ${fadeClass}`}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '15px',
                  padding: '20px',
                  transition: 'opacity 1s ease-in-out',
                  border: '1px solid #f0ca8e',
                  opacity: fadeClass === 'fade-in' ? 1 : 0,
                  transform: fadeClass === 'fade-in' ? 'scale(1)' : 'scale(0.95)',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="testimonial-img text-center">
                  <Image
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="img-fluid rounded-circle"
                    width={80}
                    height={80}
                  />
                </div>
                <div className="testimonial-content text-center">
                  <h5 className="testimonial-name" style={{ color: '#3d405b' }}>
                    {testimonials[currentTestimonial].name}
                  </h5>
                  <div className="testimonial-stars">
                    {renderStars(testimonials[currentTestimonial].stars)}
                  </div>
                  <p className="testimonial-text" style={{ color: '#3d405b' }}>
                    {testimonials[currentTestimonial].text}
                  </p>
                </div>
              </div>

              <div
                className={`testimonial-item shadow-lg mb-4 ${fadeClass}`}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '15px',
                  padding: '20px',
                  transition: 'opacity 1s ease-in-out',
                  border: '1px solid #f0ca8e',
                  opacity: fadeClass === 'fade-in' ? 1 : 0,
                  transform: fadeClass === 'fade-in' ? 'scale(1)' : 'scale(0.95)',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="testimonial-img text-center">
                  <Image
                    src={testimonials[(currentTestimonial + 1) % testimonials.length].image} 
                    alt={testimonials[(currentTestimonial + 1) % testimonials.length].name}
                    className="img-fluid rounded-circle"
                    width={80}
                    height={80}
                  />
                </div>
                <div className="testimonial-content text-center">
                  <h5 className="testimonial-name" style={{ color: '#3d405b' }}>
                    {testimonials[(currentTestimonial + 1) % testimonials.length].name}
                  </h5>
                  <div className="testimonial-stars">
                    {renderStars(testimonials[(currentTestimonial + 1) % testimonials.length].stars)}
                  </div>
                  <p className="testimonial-text" style={{ color: '#3d405b' }}>
                    {testimonials[(currentTestimonial + 1) % testimonials.length].text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Compliances Section */}
      <section className="events-section section-bg section-padding" id="section_4">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-12">
              <h2 className="mb-lg-3">Our Compliance Standards</h2>
            </div>

            <div className="row custom-block mb-3">
              <div className="col-lg-2 col-md-4 col-12 order-2 order-md-0 order-lg-0">
                <div className="custom-block-date-wrap d-flex d-lg-block d-md-block align-items-center mt-3 mt-lg-0 mt-md-0">
                  <h6 className="custom-block-date mb-lg-1 mb-0 me-3 me-lg-0 me-md-0 text-white">AML</h6>
                </div>
              </div>

              <div className="col-lg-4 col-md-8 col-12 order-1 order-lg-0">
                <div className="custom-block-image-wrap">
                  <a href="event-detail.html">
                    <img
                      src="images/picts.svg"
                      className="custom-block-image img-fluid"
                      alt="Golf Player"
                    />
                    <i className="custom-block-icon bi-link"></i>
                  </a>
                </div>
              </div>

              <div className="col-lg-6 col-12 order-3 order-lg-0">
                <div className="custom-block-info mt-2 mt-lg-0">
                  <a href="event-detail.html" className="events-title mb-3">
                    Anti-Money Laundering (AML) Compliance
                  </a>

                  <p className="mb-0">
                    At DTCOB, we ensure strict adherence to Anti-Money Laundering (AML) regulations, preventing financial crimes by implementing robust transaction monitoring and reporting systems.
                  </p>

                  <div className="d-flex flex-wrap border-top mt-4 pt-3">
                    <div className="d-flex flex-column mb-4 mb-lg-0">
                      <div className="d-flex flex-wrap align-items-center mb-1">
                        <span className="custom-block-span">Compliance Measures:</span>
                      </div>
                      <p className="mb-0">
                        AML risk assessment, monitoring, and reporting.
                      </p>
                    </div>

                    <div className="d-flex align-items-center ms-lg-auto">
                      <a href="event-detail.html" className="btn custom-btn">
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row custom-block custom-block-bg">
              <div className="col-lg-2 col-md-4 col-12 order-2 order-md-0 order-lg-0">
                <div className="custom-block-date-wrap d-flex d-lg-block d-md-block align-items-center mt-3 mt-lg-0 mt-md-0">
                  <h6 className="custom-block-date mb-lg-1 mb-0 me-3 me-lg-0 me-md-0 text-white">CFT</h6>
                </div>
              </div>

              <div className="col-lg-4 col-md-8 col-12 order-1 order-lg-0">
                <div className="custom-block-image-wrap">
                  <a href="event-detail.html">
                    <img
                      src="images/picts.svg"
                      className="custom-block-image img-fluid"
                      alt="Group Tournament"
                    />
                    <i className="custom-block-icon bi-link"></i>
                  </a>
                </div>
              </div>

              <div className="col-lg-6 col-12 order-3 order-lg-0">
                <div className="custom-block-info mt-2 mt-lg-0">
                  <a href="event-detail.html" className="events-title mb-3">
                    Counter Financing of Terrorism (CFT) Compliance
                  </a>

                  <p className="mb-0">
                    DTCOB complies with CFT regulations to prevent financing of terrorism by implementing secure screening and transaction checks.
                  </p>

                  <div className="d-flex flex-wrap border-top mt-4 pt-3">
                    <div className="d-flex flex-column mb-4 mb-lg-0">
                      <div className="d-flex flex-wrap align-items-center mb-1">
                        <span className="custom-block-span">Compliance Measures:</span>
                      </div>
                      <p className="mb-0">
                        Transaction surveillance, risk assessments, reporting.
                      </p>
                    </div>

                    <div className="d-flex align-items-center ms-lg-auto">
                      <a href="event-detail.html" className="btn custom-btn">
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row custom-block mb-3">
              <div className="col-lg-2 col-md-4 col-12 order-2 order-md-0 order-lg-0">
                <div className="custom-block-date-wrap d-flex d-lg-block d-md-block align-items-center mt-3 mt-lg-0 mt-md-0">
                  <h6 className="custom-block-date mb-lg-1 mb-0 me-3 me-lg-0 me-md-0 text-white">GDPR</h6>
                </div>
              </div>

              <div className="col-lg-4 col-md-8 col-12 order-1 order-lg-0">
                <div className="custom-block-image-wrap">
                  <a href="event-detail.html">
                    <img
                      src="images/picts.svg"
                      className="custom-block-image img-fluid"
                      alt="Golf Player"
                    />
                    <i className="custom-block-icon bi-link"></i>
                  </a>
                </div>
              </div>

              <div className="col-lg-6 col-12 order-3 order-lg-0">
                <div className="custom-block-info mt-2 mt-lg-0">
                  <a href="event-detail.html" className="events-title mb-3">
                    General Data Protection Regulation (GDPR) Compliance
                  </a>

                  <p className="mb-0">
                    DTCOB is fully compliant with GDPR, ensuring the privacy and protection of personal data in accordance with European regulations.
                  </p>

                  <div className="d-flex flex-wrap border-top mt-4 pt-3">
                    <div className="d-flex flex-column mb-4 mb-lg-0">
                      <div className="d-flex flex-wrap align-items-center mb-1">
                        <span className="custom-block-span">Compliance Measures:</span>
                      </div>
                      <p className="mb-0">
                        Data encryption, privacy by design, rights of access.
                      </p>
                    </div>

                    <div className="d-flex align-items-center ms-lg-auto">
                      <a href="event-detail.html" className="btn custom-btn">
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section section-padding" id="section_5">
        <div className="container">
          <div className="row">

            <div className="col-lg-5 col-12">
              <form action="#" method="post" className="custom-form contact-form" role="form">
                <h2 className="mb-4 pb-2">Contact DTCOB</h2>

                <div className="row">
                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-floating">
                      <input
                        type="text"
                        name="full-name"
                        id="full-name"
                        className="form-control"
                        placeholder="Full Name"
                        required
                      />
                      <label htmlFor="full-name">Full Name</label>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-12">
                    <div className="form-floating">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        pattern="[^ @]*@[^ @]*"
                        className="form-control"
                        placeholder="Email address"
                        required
                      />
                      <label htmlFor="email">Email address</label>
                    </div>
                  </div>

                  <div className="col-lg-12 col-12">
                    <div className="form-floating">
                      <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        placeholder="Describe message here"
                      ></textarea>
                      <label htmlFor="message">Message</label>
                    </div>

                    <button type="submit" className="form-control">
                      Submit Form
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-lg-6 col-12">
              <div className="contact-info mt-5">
                <div className="contact-info-item">
                  <div className="contact-info-body">
                    <strong>London, United Kingdom</strong>

                    <p className="mt-2 mb-1">
                      <a href="tel:010-020-0340" className="contact-link">
                        (020) 010-020-0340
                      </a>
                    </p>

                    <p className="mb-0">
                      <a href="mailto:info@company.com" className="contact-link">
                        info@company.com
                      </a>
                    </p>
                  </div>

                  <div className="contact-info-footer">
                    <a href="#">Directions</a>
                  </div>
                </div>

                <img
                  src="images/WorldMap.svg"
                  className="img-fluid"
                  alt="World map"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#81B29A" fillOpacity="1" d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z" />
        </svg>

        <div className="container">
          <div className="row">
            {/* Footer Middle Section */}
            <div className="col-12 text-center">
              <p className="copyright-text">© 2025 DTCOB. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
