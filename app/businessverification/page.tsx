"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState } from 'react';

export default function BusinessVerificationPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | null>(null);

  const handleExistingUserSelect = () => {
    setSelectedOption('existing');
  };

  const handleNewUserSelect = () => {
    setSelectedOption('new');
  };

  const handleBack = () => router.back();

  const handleNext = () => {
    if (selectedOption === 'existing') {
      router.push('/business-login');
    } else if (selectedOption === 'new') {
      router.push('/business-registration');
    } else {
      alert('Please select an option (Existing User or New User) to continue.');
    }
  };

  const getCardStyle = (option: 'existing' | 'new') => ({
    backgroundColor: selectedOption === option ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)',
    borderRadius: '15px',
    backdropFilter: 'blur(3px)',
    border: selectedOption === option ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out, background-color 0.3s ease, border 0.3s ease',
    cursor: 'pointer',
  });

  const getButtonTextStyle = (option: 'existing' | 'new') => ({
    color: selectedOption === option ? '#3D405B' : 'white',
    fontWeight: 'bold',
  });

  const getIconStyle = (option: 'existing' | 'new') => ({
    color: selectedOption === option ? '#3D405B' : 'white',
    marginBottom: '10px',
  });

  return (
    <div className="d-flex flex-column min-vh-100 overflow-hidden">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <Image src="/images/logo.png" alt="DTCOB" className="navbar-brand-image img-fluid" width={100} height={100} />
            <span className="navbar-brand-text">DTCOB</span>
          </a>
        </div>
      </nav>

      <section className="hero-section d-flex justify-content-center align-items-center flex-grow-1" id="section_1" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="section-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 2 }}>
            <path fill="#3D405B" fillOpacity="1" d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,0L1405.7,0C1371.4,0,1303,0,1234,0C1165.7,0,1097,0,1029,0C960,0,891,0,823,0C754.3,0,686,0,617,0C548.6,0,480,0,411,0C342.9,0,274,0,206,0C137.1,0,69,0,34,0L0,0Z"></path>
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'url(/images/business_picts.svg)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}></div>
        </div>

        <div className="container d-flex flex-column justify-content-center align-items-center" style={{ zIndex: 10, position: 'relative' }}>
          <div className="row text-center">
            <div className="col-lg-12 col-12 mb-5 mb-lg-0">
              <h2 className="text-white mb-4 fw-bold">Business Account Verification</h2>
              <p className="text-white mb-5">Easily manage your company's financial services. Verify your business identity to gain full access to our banking solutions.</p>

              <div className="row justify-content-center g-4 w-100">
                <div className="col-md-5">
                  <div className="card-like-box p-4" style={getCardStyle('existing')} onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')} onClick={handleExistingUserSelect}>
                    <button className="btn w-100 py-3 border-0 shadow-sm d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'transparent', transition: 'color 0.3s ease' }}>
                      <i className="bi bi-person-fill fs-2" style={getIconStyle('existing')}></i>
                      <span style={getButtonTextStyle('existing')}>I am an Existing User</span>
                    </button>
                    <small className="text-white-50 form-text d-block mt-2">Log in to your existing business account</small>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="card-like-box p-4" style={getCardStyle('new')} onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')} onClick={handleNewUserSelect}>
                    <button className="btn w-100 py-3 border-0 shadow-sm d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'transparent', transition: 'color 0.3s ease' }}>
                      <i className="bi bi-person-plus-fill fs-2" style={getIconStyle('new')}></i>
                      <span style={getButtonTextStyle('new')}>I am a New User</span>
                    </button>
                    <small className="text-white-50 form-text d-block mt-2">Register your new business with us</small>
                  </div>
                </div>
              </div>

              <div className="mt-5 d-grid gap-2 col-md-4 mx-auto">
                <button
                  className="btn btn-lg py-3 text-white shadow-sm"
                  style={{
                    backgroundColor: selectedOption ? '#3D405B' : '#707390',
                    transition: 'background-color 0.3s ease',
                    cursor: selectedOption ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={(e) => (selectedOption ? (e.currentTarget.style.backgroundColor = '#2c2f42') : null)}
                  onMouseLeave={(e) => (selectedOption ? (e.currentTarget.style.backgroundColor = '#3D405B') : null)}
                  onClick={handleNext}
                  disabled={!selectedOption}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 2 }}>
          <path fill="#ffffff" fillOpacity="1" d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
        </svg>
      </section>
    </div>
  );
}
