"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState } from 'react';

export default function NationalitySelectionPage() {
  const router = useRouter();
  const [selectedNationality, setSelectedNationality] = useState<string>('');

  const handleBack = () => router.back();

  const handleNext = () => {
    if (selectedNationality === 'Malaysian') {
      router.push('/mykadupload');
    } else if (selectedNationality === 'Non-Malaysian') {
      router.push('/non-malaysian-registration'); 
    } else {
      alert('Please select your nationality to continue.');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 overflow-hidden">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <button
            className="btn text-white d-flex align-items-center"
            style={{ zIndex: 20 }}
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left-circle-fill fs-3" style={{ color: 'white' }}></i>
            <span className="ms-2">Back</span>
          </button>
          <a className="navbar-brand d-flex align-items-center" href="/">
            <Image src="/images/logos.png" alt="DTCOB" className="navbar-brand-image img-fluid" width={100} height={100} />
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
              <h2 className="text-white mb-4 fw-bold">Choose Your Nationality</h2>
              <p className="text-white mb-5">Please select your nationality to proceed with the registration.</p>

              <div className="col-md-6 mx-auto"> {/* Changed back to col-md-6 to make it longer */}
                <div className="mb-3 text-start">
                  <label htmlFor="nationalitySelect" className="form-label text-white fw-bold">Select Your Nationality</label>
                  <select
                    id="nationalitySelect"
                    className="form-select"
                    aria-label="Select your nationality"
                    value={selectedNationality}
                    onChange={(e) => setSelectedNationality(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      backdropFilter: 'blur(3px)',
                      height: '50px',
                      padding: '0.5rem 1rem',
                      fontSize: '1rem',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m2 5 6 6 6-6\'/%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1em 1em',
                    }}
                  >
                    <option value="" disabled>Select your nationality</option>
                    <option value="Malaysian" style={{ color: 'black' }}>Malaysian (MyKad)</option>
                    <option value="Non-Malaysian" style={{ color: 'black' }}>Non-Malaysian (Passport)</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 d-grid gap-2 col-md-4 mx-auto">
                <button
                  className="btn btn-lg py-3 text-white shadow-sm"
                  style={{
                    backgroundColor: selectedNationality ? '#3D405B' : '#707390',
                    transition: 'background-color 0.3s ease',
                    cursor: selectedNationality ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={(e) => (selectedNationality ? (e.currentTarget.style.backgroundColor = '#2c2f42') : null)}
                  onMouseLeave={(e) => (selectedNationality ? (e.currentTarget.style.backgroundColor = '#3D405B') : null)}
                  onClick={handleNext}
                  disabled={!selectedNationality}
                >
                  Continue
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
