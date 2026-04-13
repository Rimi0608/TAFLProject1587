import React, { useState, useEffect, useRef } from 'react';
import './index.css';

import LusionNavbar from './components/LusionNavbar';
import HeroCanvas from './components/HeroCanvas';
import FeaturedWorkSection from './components/FeaturedWorkSection';
import SpaceSection from './components/SpaceSection';
import CTASection from './components/CTASection';
import FooterSection from './components/FooterSection';
import ConverterModal from './components/ConverterModal';

function App() {
  const [converterOpen, setConverterOpen] = useState(false);
  const [modalPage, setModalPage] = useState('converter');
  const [scrolled, setScrolled] = useState(false);
  const ctaRef = useRef(null);

  /* Track scroll for navbar background */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock body scroll when modal is open */
  useEffect(() => {
    document.body.style.overflow = converterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [converterOpen]);

  const openConverter = () => {
    setModalPage('converter');
    setConverterOpen(true);
  };

  const openModalPage = (page) => {
    setModalPage(page);
    setConverterOpen(true);
  };

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <LusionNavbar
        scrolled={scrolled}
        onOpenConverter={openConverter}
        onNavigate={openModalPage}
      />

      {/* ─── Scroll-based sections ─── */}
      <HeroCanvas />
      <FeaturedWorkSection onOpenConverter={openConverter} />
      <SpaceSection onScrollDown={scrollToCTA} />
      <div ref={ctaRef}>
        <CTASection onOpenConverter={openConverter} />
      </div>
      <FooterSection />

      {/* ─── Converter / Info Modal ─── */}
      <ConverterModal
        isOpen={converterOpen}
        onClose={() => setConverterOpen(false)}
        initialPage={modalPage}
      />
    </>
  );
}

export default App;
