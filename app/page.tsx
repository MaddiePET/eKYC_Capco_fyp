"use client";

import Image from "next/image";
import Link from 'next/link';
import Label from "@/components/form/Label";
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-100');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const words = ["Intelligent Automation", "Instant Verification", "Effortless Compliance"];

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(wordInterval);
  }, [words.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass('opacity-0');
      setTimeout(() => {
        setCurrentTestimonial(prev => (prev + 2 >= testimonials.length ? 0 : prev + 2));
        setFadeClass('opacity-100');
      }, 800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderStars = (count: number) => {
    return [...Array(count)].map((_, i) => (
      <span key={i} className="text-[#F0CA8E] text-2xl">★</span>
    ));
  };

  const testimonials = [
    { name: "Muhammad Faiz", text: "DTCOB's onboarding platform has made my life so much easier. I was able to complete my onboarding in just minutes!", stars: 5, image: "/images/user/user-08.jpg" },
    { name: "Tan Wei Ming", text: "The digital-first approach at DTCOB made the whole process hassle-free. I felt in control the entire time.", stars: 4, image: "/images/user/user-07.jpg" },
    { name: "Kavitha Ramanathan", text: "I love how DTCOB’s platform doesn’t require me to jump through hoops. It’s quick, secure, and easy.", stars: 5, image: "/images/user/user-06.jpg" },
    { name: "Siti Aishah", text: "The entire onboarding experience was smooth and user-friendly. I had no issues at all.", stars: 4, image: "/images/user/user-05.jpg" },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950 text-gray-800 dark:text-white/95 selection:bg-[#F0CA8E] selection:text-[#3D405B]">

      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-[#5c6185]/50' 
          : 'bg-transparent border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/images/logo/logo-light.svg" alt="Logo" width={40} height={40} className={isScrolled ? "hidden dark:block" : "block"} />
              <Image src="/images/logo/logo-dark.svg" alt="Logo" width={40} height={40} className={isScrolled ? "block dark:hidden" : "hidden"} />
              <span className={`text-2xl font-bold uppercase tracking-tight transition-colors ${isScrolled ? 'text-[#3D405B] dark:text-white' : 'text-white'}`}>DTCOB</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              {['Home', 'Core Values', 'Testimonials', 'Compliances', 'Contact Us'].map((item, index) => (
                <a key={index} href={`#section_${index + 1}`} className={`text-sm font-bold transition-all hover:-translate-y-0.5 ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-[#F0CA8E] dark:text-white dark:hover:text-[#F0CA8E]' 
                    : 'text-white/90 hover:text-[#F0CA8E]'
                }`}>
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex">
              <Link href="/login" className={`inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold transition-all border-2 rounded-lg hover:shadow-lg active:scale-95 ${
                isScrolled 
                  ? 'bg-transparent text-[#3D405B] border-[#3D405B] hover:bg-[#3D405B] hover:text-white dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-[#3D405B]' 
                  : 'bg-transparent text-[#F0CA8E] border-[#F0CA8E] hover:bg-[#F0CA8E] hover:text-[#3D405B]'
              }`}>
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section id="section_1" className="relative pt-32 pb-32 lg:pt-36 lg:pb-48 bg-[#3D405B] dark:bg-[#3D405B] overflow-hidden text-white transition-colors duration-500">
        <svg className="absolute top-0 left-0 w-full h-24 sm:h-32 md:h-48 lg:h-64 pointer-events-none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path className="text-white/5 dark:text-black/10" fill="currentColor" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,192C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          <path className="text-white/10 dark:text-black/20" fill="currentColor" d="M0,128L48,138.7C96,149,192,171,288,176C384,181,480,171,576,144C672,117,768,75,864,69.3C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 w-full text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 animate-fade-in">Welcome to DTCOB</h1>
              <h2 className="text-2xl lg:text-3xl text-white/90 mb-10 min-h-[80px] font-medium">
                <span>Revolutionizing Customer Onboarding with </span>
                <br className="hidden lg:block"/>
                <span className="block mt-2 relative h-10 lg:h-12 overflow-hidden w-full">
                  {words.map((word, index) => {
                    const isActive = index === currentWord;
                    const isPrev = index === (currentWord - 1 + words.length) % words.length;
                    
                    let positionClass = "-translate-y-full opacity-0"; 
                    if (isActive) {
                      positionClass = "translate-y-0 opacity-100";
                    } else if (isPrev) {
                      positionClass = "translate-y-full opacity-0";
                    }

                    return (
                      <b
                        key={word}
                        className={`absolute top-0 left-0 w-full text-[#F0CA8E] transition-all duration-700 ease-in-out ${positionClass}`}
                      >
                        {word}
                      </b>
                    );
                  })}
                </span>
              </h2>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link href="/personal/user_verification" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-[#3D405B] transition-all rounded-lg bg-[#F0CA8E] shadow-lg hover:bg-[#e2bc80] hover:-translate-y-1 active:scale-95">Personal Account</Link>
                <Link href="/business/user_verification" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold transition-all bg-transparent border-2 rounded-lg text-[#F0CA8E] border-[#F0CA8E] hover:bg-[#F0CA8E]/10 hover:-translate-y-1 active:scale-95">Business Account</Link>
              </div>
            </div>
            <div className="lg:w-1/2 w-full group">
              <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#81B29A]/20 transition-transform duration-500 group-hover:scale-[1.01] ring-4 ring-black/20">
                <iframe className="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/MGNgbNGOzh8" title="Video" allowFullScreen></iframe>
              </div>
            </div>
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 w-full h-24 sm:h-32 md:h-48 lg:h-64 text-[#F9FAFB] dark:text-gray-950 -mb-1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="currentColor" d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
        </svg>
      </section>

      <section id="section_2" className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-12 text-[#3D405B] dark:text-white">Our Core Values</h2>
          <div className="w-full border-2 border-[#81B29A] dark:border-[#81B29A] rounded-3xl overflow-hidden bg-white dark:bg-gray-900/90 shadow-xl dark:ring-4 dark:ring-[#81B29A]/20 transition-all duration-500">
            {[
              { title: "Digital-First Solutions", desc: "At DTCOB, we offer innovative solutions that streamline the customer onboarding process.", icon: <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /> },
              { title: "Streamlined Onboarding", desc: "Simplifying the onboarding journey to reduce friction and increase efficiency.", icon: <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /> },
              { title: "Customer-Centric Approach", desc: "Focused on creating exceptional experiences that prioritize the needs of the customer.", icon: <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /> },
              { title: "Shaping the Future", desc: "Leveraging cutting-edge technology to redefine the future of banking and customer onboarding.", icon: <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.286c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.286-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.286c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /> }
            ].map((item, i) => (
              <div key={i} className={`flex flex-col md:flex-row items-center p-8 transition-all duration-300 group hover:bg-gray-50 dark:hover:bg-[#3D405B]/30 ${i !== 3 ? 'border-b border-[#81B29A]/40 dark:border-[#81B29A]/40' : ''}`}>
                <div className="md:w-1/3 flex items-center justify-center md:justify-start gap-4 mb-4 md:mb-0 transition-transform group-hover:translate-x-2">
                  <svg className="w-10 h-10 text-[#F0CA8E] flex-shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">{item.icon}</svg>
                  <span className="font-bold text-lg text-[#3D405B] dark:text-white">{item.title}</span>
                </div>
                <div className="md:w-2/3 text-sm text-gray-600 dark:text-gray-300 text-center md:text-left md:border-l border-[#81B29A]/40 dark:border-[#81B29A]/40 md:pl-8">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#3D405B] dark:bg-[#3D405B] text-white pt-32 pb-32 lg:pt-40 lg:pb-40 my-12 relative overflow-hidden transition-colors duration-500">
        <svg className="absolute top-0 left-0 w-full h-12 sm:h-16 md:h-24 lg:h-32 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path className="text-[#F0CA8E]/10 dark:text-white/5" fill="currentColor" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,192C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          <path className="text-[#F9FAFB] dark:text-gray-950" fill="currentColor" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-extrabold mb-4 text-[#F0CA8E]">Stay Updated with Us</h2>
          <p className="text-white/80 dark:text-gray-200 mb-10 text-base font-medium">Sign up for our newsletter to receive the latest insights and updates.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-grow">
              <div className="relative">
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 fill-gray-400 dark:fill-gray-300 z-10" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                  <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 placeholder:text-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40" 
                  placeholder="Enter your email address" 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-[#3D405B] transition rounded-xl bg-[#F0CA8E] shadow-lg hover:bg-[#e2bc80] hover:-translate-y-0.5"
            >
              Subscribe
            </button>
          </form>
        </div>

        <svg className="absolute bottom-0 left-0 w-full h-12 sm:h-16 md:h-24 lg:h-32 translate-y-[2px]" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path className="text-[#F0CA8E]/10 dark:text-white/5" fill="currentColor" d="M0,192L48,186.7C96,181,192,171,288,181.3C384,192,480,224,576,234.7C672,245,768,235,864,213.3C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L0,320Z"></path>
          <path className="text-[#F9FAFB] dark:text-gray-950" fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z"></path>
        </svg>
      </section>

      <section id="section_3" className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-12 text-[#3D405B] dark:text-white">Customer Reviews</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {[0, 1].map((offset) => {
              const index = (currentTestimonial + offset) % testimonials.length;
              const testimonial = testimonials[index];
              return (
                <div key={index} className={`flex-1 bg-white dark:bg-gray-900/90 rounded-3xl p-10 shadow-xl border border-[#F0CA8E] dark:border-[#F0CA8E] dark:ring-4 dark:ring-[#F0CA8E]/20 flex flex-col items-center justify-center min-h-[320px] transition-all duration-700 ease-in-out ${fadeClass}`}>
                  <div className="relative w-20 h-20 mx-auto mb-6 rounded-full ring-4 ring-[#81B29A]/30 overflow-hidden shadow-md group-hover:scale-110 transition-transform">
                    <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
                  </div>
                  <h5 className="text-lg font-bold text-[#81B29A] mb-2">{testimonial.name}</h5>
                  <div className="mb-4">{renderStars(testimonial.stars)}</div>
                  <p className="text-sm text-center text-[#3D405B]/80 dark:text-gray-300 italic font-medium">"{testimonial.text}"</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="section_4" className="py-24 border-t border-b border-gray-200 dark:border-gray-800/0 relative z-10 bg-white/50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-12 text-center text-[#3D405B] dark:text-white">Our Compliance Standards</h2>
          <div className="space-y-6">
            {[
              { 
                tag: "AML", 
                title: "Anti-Money Laundering (AML) Compliance", 
                desc: "At DTCOB, we ensure strict adherence to AML regulations, preventing financial crimes with robust monitoring systems.", 
                comp: "AML risk assessment, monitoring, and reporting.",
                imgSrc: "/images/aml.svg" 
              },
              { 
                tag: "GDPR", 
                title: "General Data Protection Regulation (GDPR) Compliance", 
                desc: "DTCOB strictly adheres to GDPR standards, guaranteeing the utmost privacy, security, and transparent processing of your personal data.", 
                comp: "Privacy by design and robust data protection protocols.",
                imgSrc: "/images/gdpr.svg" 
              },
              { 
                tag: "PDPA", 
                title: "Personal Data Protection Act (PDPA) Compliance", 
                desc: "At DTCOB, we are committed to protecting personal data in accordance with the PDPA, ensuring privacy and confidentiality.", 
                comp: "Data protection measures and secure data handling.",
                imgSrc: "/images/pdpa.svg" 
              }
            ].map((item, i) => (
              <div key={i} className={`flex flex-col md:flex-row bg-white dark:bg-gray-900/90 rounded-2xl p-6 md:p-8 shadow-lg items-center gap-6 md:gap-8 border border-gray-100 dark:border-[#5c6185] hover:border-[#81B29A] dark:hover:border-[#81B29A] dark:hover:ring-4 dark:hover:ring-[#81B29A]/40 hover:scale-[1.01] transition-all duration-300 ${i === 1 ? 'md:flex-row-reverse' : ''}`}>
                
                <div className="flex-shrink-0 relative">
                  <div className="absolute -top-1 -left-1 z-10 bg-[#F0CA8E] text-[#3D405B] font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm border border-white dark:border-gray-800">
                    {item.tag}
                  </div>
                  
                  <div className="bg-[#F9FAFB] dark:bg-gray-950 p-3 rounded-full border border-gray-100 dark:border-[#5c6185] w-28 h-28 md:w-32 md:h-32 flex items-center justify-center overflow-hidden shadow-inner">
                    <img 
                      src={item.imgSrc} 
                      alt={`${item.tag} icon`} 
                      className="w-full h-full object-contain opacity-90 dark:brightness-0 dark:invert transition-all" 
                    />
                  </div>
                </div>

                <div className="w-full flex-1">
                  <h3 className="text-xl font-bold text-[#3D405B] dark:text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{item.desc}</p>
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-[#5c6185]/50 pt-6 gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong className="text-[#3D405B] dark:text-white">Compliance:</strong> {item.comp}
                    </p>
                    <Link href="#" className="px-6 py-2.5 text-sm font-bold transition-all bg-[#3D405B] rounded-lg text-white hover:bg-[#2c2e42] dark:bg-[#3D405B] dark:text-white dark:hover:bg-[#4a4e6d] active:scale-95 whitespace-nowrap">
                      Learn More
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="section_5" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-extrabold mb-8 text-[#3D405B] dark:text-white">Contact DTCOB</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block mb-2 text-center sm:text-left text-gray-800 dark:text-white/90">
                      Username <span className="text-error-500">*</span>
                    </Label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40" 
                      placeholder="Enter your username" 
                      required 
                    />
                  </div>
                  <div>
                    <Label className="block mb-2 text-center sm:text-left text-gray-800 dark:text-white/90">
                      Email Address <span className="text-error-500">*</span>
                    </Label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40" 
                      placeholder="Enter your email address" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label className="block mb-2 text-center sm:text-left text-gray-800 dark:text-white/90">
                    Message <span className="text-error-500">*</span>
                  </Label>
                  <textarea 
                    className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 h-32 resize-none" 
                    placeholder="Describe message here"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="inline-flex items-center justify-center w-full px-6 py-2.5 text-sm font-bold text-white transition rounded-xl bg-[#3D405B] shadow-lg hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:text-white dark:hover:bg-[#4a4e6d]"
                >
                  Submit Form
                </button>
              </form>
            </div>

            <div className="lg:w-1/2 flex flex-col justify-center">
              <div className="bg-white dark:bg-gray-900/90 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-[#5c6185] dark:ring-4 dark:ring-[#3D405B]/40 mb-8 relative z-10 text-center sm:text-left">
                <h4 className="text-xl font-bold text-[#3D405B] dark:text-white mb-4">Kuala Lumpur, Malaysia</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex items-center justify-center sm:justify-start gap-2">
                  <svg className="w-4 h-4 text-[#F0CA8E]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                  <a href="tel:010-020-0340" className="hover:text-[#F0CA8E] font-medium transition-colors">(60) 123456789</a>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center sm:justify-start gap-2">
                  <svg className="w-4 h-4 text-[#F0CA8E]" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                  <a href="mailto:info@company.com" className="hover:text-[#F0CA8E] font-medium transition-colors">dtcob@company.com</a>
                </p>
              </div>
              <div className="relative w-full h-48 opacity-50 dark:opacity-30 -mt-20 pointer-events-none drop-shadow-sm">
                <Image src="/images/WorldMap.svg" alt="World Map" fill className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#F0CA8E] text-white pt-16 pb-8 relative mt-16 transition-colors duration-500">
        <svg className="absolute bottom-full left-0 w-full h-10 md:h-16 lg:h-20 text-[#F0CA8E] -mb-1" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path fill="currentColor" d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L0,320Z" />
        </svg>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="relative mt-8 text-xs font-medium text-[#2c3d35]">
            &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}