import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import {
  Menu,
  X,
  Play,
  Plus,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Twitter,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Camera,
  Aperture,
  Video,
  Music,
  Heart,
  Filter,
  Maximize2
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* UTILS & HELPERS                              */
/* -------------------------------------------------------------------------- */

// Simple class merger helper
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/* -------------------------------------------------------------------------- */
/* ANIMATION COMPONENTS (Adapted for No-Dependency)                           */
/* -------------------------------------------------------------------------- */

function InView({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* BEAMS BACKGROUND                               */
/* -------------------------------------------------------------------------- */

function BackgroundBeams({ className, intensity = "strong" }) {
  const canvasRef = useRef(null);
  const beamsRef = useRef([]);
  const animationFrameRef = useRef(0);
  const MINIMUM_BEAMS = 20;

  const isDarkMode = false;

  const opacityMap = {
    subtle: 0.7,
    medium: 0.85,
    strong: 1,
  };

  function createBeam(width, height) {
    const angle = -35 + Math.random() * 10;
    const hueBase = isDarkMode ? 190 : 210;
    const hueRange = isDarkMode ? 70 : 50;

    return {
      x: Math.random() * width * 1.5 - width * 0.25,
      y: Math.random() * height * 1.5 - height * 0.25,
      width: 30 + Math.random() * 60,
      length: height * 2.5,
      angle: angle,
      speed: 0.6 + Math.random() * 1.2,
      opacity: 0.12 + Math.random() * 0.16,
      hue: hueBase + Math.random() * hueRange,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const totalBeams = MINIMUM_BEAMS * 1.5;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(canvas.width, canvas.height)
      );
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    function resetBeam(beam, index, totalBeams) {
      if (!canvas) return beam;

      const column = index % 3;
      const spacing = canvas.width / 3;

      const hueBase = isDarkMode ? 190 : 210;
      const hueRange = isDarkMode ? 70 : 50;

      beam.y = canvas.height + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = hueBase + (index * hueRange) / totalBeams;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    }

    function drawBeam(ctx, beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityMap[intensity];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

      const saturation = isDarkMode ? "85%" : "75%";
      const lightness = isDarkMode ? "65%" : "45%";

      gradient.addColorStop(0, `hsla(${beam.hue}, ${saturation}, ${lightness}, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, ${saturation}, ${lightness}, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, ${saturation}, ${lightness}, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, ${saturation}, ${lightness}, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, ${saturation}, ${lightness}, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, ${saturation}, ${lightness}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(35px)";

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(ctx, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity]);

  return (
    <div className={cn("fixed inset-0 w-full h-full pointer-events-none overflow-hidden", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ filter: "blur(15px)" }} />
      <div className="absolute inset-0 bg-neutral-100/30" style={{ animation: 'pulseOverlay 10s ease-in-out infinite', backdropFilter: 'blur(50px)' }} />
      <style>{`@keyframes pulseOverlay { 0% { opacity: 0.05; } 50% { opacity: 0.15; } 100% { opacity: 0.05; } }`}</style>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

const LuminaEvents = () => {
  const [activePage, setActivePage] = useState('home'); // 'home' | 'gallery'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Gallery Specific State
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth Scroll Implementation
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // Standard smooth scroll duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 1, // Reset to standard speed
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none'; // Hide broken images instead of showing stock photo
    e.target.onerror = null;
  };

  const navigateTo = (page, sectionId = null) => {
    setActivePage(page);
    setIsMenuOpen(false);
    if (sectionId && page === 'home') {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // ---------------- DATA ---------------- //

  const services = [
    { title: "Wedding Photography", id: "01", icon: <Heart className="w-5 h-5" /> },
    { title: "Pre-Wedding Shoots", id: "02", icon: <Camera className="w-5 h-5" /> },
    { title: "Cinematic Films", id: "03", icon: <Video className="w-5 h-5" /> },
    { title: "Drone & Aerial", id: "04", icon: <Aperture className="w-5 h-5" /> },
    { title: "Music Videos", id: "05", icon: <Music className="w-5 h-5" /> },
  ];

  const faqs = [
    { q: "Do you travel for destination weddings?", a: "Absolutely. We are based in Mumbai but have covered weddings across Bali, Dubai, Jaipur, and Udaipur. Travel and accommodation costs are borne by the client." },
    { q: "Do you provide raw footage?", a: "We believe in delivering a finished masterpiece. We provide high-resolution edited images and professionally graded films. Raw footage can be purchased separately if required." },
    { q: "What gear do you use?", a: "We use industry-leading equipment including Sony Alpha series cameras, DJI Mavic 3 Cine drones, and professional audio gear to ensure cinematic quality." },
    { q: "How long does delivery take?", a: "For photos, we deliver a sneak peek within 48 hours and the full gallery within 4 weeks. Cinematic films typically take 8-10 weeks for perfection." },
  ];

  const portfolio = [
    { title: "Wedding Highlights", category: "Wedding • Candid", img: "/upload-7.jpg", year: "2024" },
    { title: "Moments & Memories", category: "Rituals • Details", img: "/upload-8.jpg", year: "2024" },
    { title: "Traditional Vows", category: "Wedding • Portrait", img: "/upload-9.jpg", year: "2023" },
    { title: "The Big Day", category: "Celebration • Joy", img: "/upload-10.jpg", year: "2023" },
  ];

  // Highlights Data for Home Page
  const homeGalleryHighlights = [
    { src: "/upload-1.jpg", className: "col-span-1 row-span-1 md:col-span-1 md:row-span-1" },
    { src: "/upload-2.jpg", className: "col-span-1 row-span-2 md:col-span-1 md:row-span-2" },
    { src: "/upload-3.jpg", className: "col-span-1 row-span-1 md:col-span-1 md:row-span-1" },
    { src: "/upload-4.jpg", className: "col-span-1 row-span-1 md:col-span-1 md:row-span-1" },
    { src: "/upload-5.jpg", className: "col-span-1 row-span-1 md:col-span-1 md:row-span-1" },
    { src: "/upload-6.jpg", className: "col-span-2 row-span-1 md:col-span-2 md:row-span-1" },
  ];

  // Extended Gallery Data with User Uploads
  const fullGallery = [


    // --- USER UPLOADED WEDDING PHOTOS ---

    // --- NEW USER UPLOADS ---
    {
      id: 22,
      src: "/upload-1.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 1",
      size: "tall"
    },
    {
      id: 23,
      src: "/upload-2.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 2",
      size: "normal"
    },
    {
      id: 24,
      src: "/upload-3.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 3",
      size: "wide"
    },
    {
      id: 25,
      src: "/upload-4.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 4",
      size: "normal"
    },
    {
      id: 26,
      src: "/upload-5.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 5",
      size: "tall"
    },
    // --- RESTORED & NEW USER UPLOADS ---
    {
      id: 27,
      src: "/upload-6.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 6",
      size: "normal"
    },
    {
      id: 28,
      src: "/upload-7.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 7",
      size: "tall"
    },
    {
      id: 29,
      src: "/upload-8.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 8",
      size: "wide"
    },
    {
      id: 30,
      src: "/upload-9.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 9",
      size: "normal"
    },
    {
      id: 31,
      src: "/upload-10.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 10",
      size: "large"
    },
    // --- NEW BATCH (11-15) ---
    {
      id: 32,
      src: "/upload-11.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 11",
      size: "normal"
    },
    {
      id: 33,
      src: "/upload-12.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 12",
      size: "tall"
    },
    {
      id: 34,
      src: "/upload-13.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 13",
      size: "wide"
    },
    {
      id: 35,
      src: "/upload-14.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 14",
      size: "normal"
    },
    {
      id: 36,
      src: "/upload-15.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 15",
      size: "large"
    },
    // --- NEW BATCH (16-20) ---
    {
      id: 37,
      src: "/upload-16.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 16",
      size: "tall"
    },
    {
      id: 38,
      src: "/upload-17.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 17",
      size: "normal"
    },
    {
      id: 39,
      src: "/upload-18.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 18",
      size: "wide"
    },
    {
      id: 40,
      src: "/upload-19.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 19",
      size: "normal"
    },
    {
      id: 41,
      src: "/upload-20.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 20",
      size: "large"
    },
    // --- NEW BATCH 5 (21-25) ---
    {
      id: 42,
      src: "/upload-21.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 21",
      size: "normal"
    },
    {
      id: 43,
      src: "/upload-22.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 22",
      size: "tall"
    },
    {
      id: 44,
      src: "/upload-23.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 23",
      size: "wide"
    },
    {
      id: 45,
      src: "/upload-24.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 24",
      size: "normal"
    },
    {
      id: 46,
      src: "/upload-25.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 25",
      size: "large"
    },
    // --- DUPLICATES TO FILL SPACE (47-56) ---
    {
      id: 47,
      src: "/upload-1.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 26",
      size: "normal"
    },
    {
      id: 48,
      src: "/upload-2.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 27",
      size: "tall"
    },
    {
      id: 49,
      src: "/upload-3.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 28",
      size: "wide"
    },
    {
      id: 50,
      src: "/upload-4.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 29",
      size: "normal"
    },
    {
      id: 51,
      src: "/upload-5.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 30",
      size: "large"
    },
    {
      id: 52,
      src: "/upload-6.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 31",
      size: "tall"
    },
    {
      id: 53,
      src: "/upload-7.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 32",
      size: "wide"
    },
    {
      id: 54,
      src: "/upload-8.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 33",
      size: "normal"
    },
    {
      id: 55,
      src: "/upload-9.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 34",
      size: "large"
    },
    {
      id: 56,
      src: "/upload-10.jpg",
      category: "Weddings",
      alt: "Wedding Highlight 35",
      size: "normal"
    },
  ];

  const filteredGallery = galleryFilter === 'All'
    ? fullGallery
    : fullGallery.filter(img => img.category === galleryFilter);

  return (
    <div className="relative font-sans text-gray-900 bg-white/30 min-h-screen selection:bg-gray-200">

      {/* Background Beams Implementation */}
      <BackgroundBeams className="z-0" intensity="medium" />

      {/* Main Content Wrapper */}
      <div className="relative z-10">

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-4' : 'bg-transparent py-6'}`}>
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <button onClick={() => navigateTo('home')} className="text-3xl font-serif font-bold tracking-tight z-50 relative hover:opacity-80 transition-opacity">
              Lumina<span className="text-xs align-top ml-1 font-sans font-normal">®</span>
            </button>

            <div className="flex items-center gap-4">
              {activePage === 'gallery' && (
                <button
                  onClick={() => navigateTo('home')}
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
              )}

              <span className="hidden md:block text-sm font-medium text-gray-500">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>

        {/* Full Screen Menu Overlay */}
        <div className={`fixed inset-0 bg-white z-[60] transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="flex flex-col h-full p-6 md:p-12">
            <div className="flex justify-between items-center mb-12">
              <div className="text-3xl font-serif font-bold">Lumina<span className="text-xs align-top ml-1 font-sans font-normal">®</span></div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center gap-8">
              <button onClick={() => navigateTo('home')} className="text-4xl md:text-6xl font-serif hover:text-gray-500 transition-colors flex items-baseline gap-4 group">
                Home <span className="text-sm font-sans text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">01</span>
              </button>
              <button onClick={() => navigateTo('gallery')} className="text-4xl md:text-6xl font-serif hover:text-gray-500 transition-colors flex items-baseline gap-4 group">
                Gallery <span className="text-sm font-sans text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">02</span>
              </button>
              <button onClick={() => navigateTo('home', 'services')} className="text-4xl md:text-6xl font-serif hover:text-gray-500 transition-colors flex items-baseline gap-4 group">
                Services <span className="text-sm font-sans text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">03</span>
              </button>
              <button onClick={() => navigateTo('home', 'about')} className="text-4xl md:text-6xl font-serif hover:text-gray-500 transition-colors flex items-baseline gap-4 group">
                About <span className="text-sm font-sans text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">04</span>
              </button>
              <button onClick={() => navigateTo('home', 'faq')} className="text-4xl md:text-6xl font-serif hover:text-gray-500 transition-colors flex items-baseline gap-4 group">
                Contact <span className="text-sm font-sans text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">05</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-gray-100">
              <div>
                <h5 className="text-gray-400 text-sm mb-2">Socials</h5>
                <div className="flex gap-4">
                  <Instagram className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                  <Twitter className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                  <Linkedin className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
              <div>
                <h5 className="text-gray-400 text-sm mb-2">Contact</h5>
                <p className="text-sm">hello@lumina.studio</p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================================== */}
        {/* HOME PAGE CONTENT                                                                    */}
        {/* ==================================================================================== */}

        {activePage === 'home' && (
          <>
            {/* Hero Section */}
            <header className="pt-32 pb-16 px-6 md:pt-48 md:pb-24 max-w-7xl mx-auto" id="home">
              <InView>
                <h1 className="text-5xl md:text-8xl font-serif font-medium tracking-tight leading-[0.9] mb-8">
                  Capturing the <br />
                  soul of the <span className="text-gray-400">moment.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
                  Lumina is a premium creative collective crafting timeless visual narratives for weddings, events, and brands.
                </p>

                <div className="flex items-center gap-2 mt-8 text-sm font-medium">
                  ★★★★★ 4.9/5
                  <span className="text-gray-400 font-normal ml-2">Trusted by 200+ couples & brands</span>
                </div>
              </InView>

              {/* Hero Image */}
              <div className="mt-16 w-full h-[50vh] md:h-[80vh] bg-gray-100 rounded-3xl overflow-hidden relative group">
                <img
                  src="/hero-image-new.jpg"
                  alt="Cinematic Wedding Shot"
                  onError={handleImageError}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                />
                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10">
                  <a
                    href="https://wa.me/917735791248"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/90 backdrop-blur text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
                  >
                    Book a Consultation <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </header>

            {/* About / Stats */}
            <section className="py-20 px-6 max-w-7xl mx-auto" id="about">
              <div className="flex flex-col md:flex-row gap-12 md:gap-24">
                <div className="md:w-1/3">
                  <span className="text-gray-400 text-sm font-medium">/ About Us</span>
                  <span className="float-right text-gray-400 text-sm font-medium">(01)</span>
                </div>
                <div className="md:w-2/3">
                  <InView delay={200}>
                    <h2 className="text-3xl md:text-5xl font-medium leading-tight mb-8">
                      We focus on creating <br />
                      <span className="text-gray-400">simple, purposeful,</span> <br />
                      and elegant memories.
                    </h2>
                    <p className="text-gray-600 mb-12 max-w-lg">
                      Our studio is dedicated to the art of visual storytelling. We strip away the artificial to reveal the genuine emotion of your special day. From high-end drone cinematography to intimate candid photography, we cover it all.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-lg">
                        <span className="font-bold">10+</span> <span className="text-gray-600">Years of Experience</span>
                      </div>
                      <div className="flex items-center gap-4 text-lg">
                        <span className="font-bold">500+</span> <span className="text-gray-600">Events Covered</span>
                      </div>
                      <div className="flex items-center gap-4 text-lg">
                        <span className="font-bold">100%</span> <span className="text-gray-600">Client Satisfaction</span>
                      </div>
                    </div>
                  </InView>
                </div>
              </div>
            </section>

            {/* Home Page Gallery Highlights Section */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-12">
                <div className="max-w-xl">
                  <span className="text-gray-400 text-sm font-medium">/ Highlights</span>
                  <h2 className="text-3xl md:text-5xl font-medium mt-2">Captured Moments.</h2>
                </div>
                <button
                  onClick={() => navigateTo('gallery')}
                  className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  View Full Archive <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[150px] md:auto-rows-[250px]">
                {homeGalleryHighlights.map((img, idx) => (
                  <InView key={idx} delay={idx * 100} className={`relative overflow-hidden rounded-2xl group ${img.className} bg-gray-100`}>
                    <img
                      src={img.src}
                      alt="Gallery Highlight"
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </InView>
                ))}
              </div>

              <div className="mt-8 md:hidden text-center">
                <button
                  onClick={() => navigateTo('gallery')}
                  className="text-sm font-medium border-b border-black pb-1 hover:text-gray-600 transition-colors"
                >
                  View Full Archive
                </button>
              </div>
            </section>

            {/* Process / Services */}
            <section className="py-24 px-6 bg-black text-white" id="services">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
                <div className="md:w-1/3">
                  <div className="flex justify-between mb-8">
                    <span className="text-gray-500 text-sm font-medium">/ Services</span>
                    <span className="text-gray-500 text-sm font-medium">(03)</span>
                  </div>
                  <h2 className="text-4xl font-medium mb-6">Our lens covers<br /> every angle.</h2>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    We adapt to the scale of your event. From intimate elopements to grand stadium concerts, our team brings the same level of preparation and artistry.
                  </p>
                  <button className="bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2">
                    See Pricing <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="md:w-2/3">
                  <div className="divide-y divide-gray-800">
                    {services.map((service, idx) => (
                      <InView key={idx} delay={idx * 100}>
                        <div className="py-6 group cursor-pointer transition-colors hover:bg-gray-900 px-4 -mx-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xl md:text-3xl font-light group-hover:pl-4 transition-all duration-300 flex items-center gap-4">
                              {service.title}
                            </h3>
                            <Plus className="text-gray-500 group-hover:text-white transition-colors group-hover:rotate-90 duration-300" />
                          </div>
                        </div>
                      </InView>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing / Packages */}
            <section className="py-24 px-6 max-w-7xl mx-auto bg-gray-50/90 backdrop-blur rounded-b-[3rem]">
              <div className="mb-12">
                <span className="text-gray-400 text-sm font-medium block mb-2">/ Packages</span>
                <h2 className="text-3xl md:text-4xl font-medium">Clear, flexible pricing.</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Package 1 */}
                <InView delay={100} className="h-full">
                  <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-full">
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Most Popular</span>
                      <span className="text-2xl font-serif font-bold">Wedding Essential</span>
                    </div>
                    <div className="text-4xl font-bold mb-2">₹1,50,000<span className="text-lg text-gray-400 font-normal">/day</span></div>
                    <p className="text-gray-500 mb-8 text-sm">Perfect for traditional weddings capturing all key ceremonies.</p>

                    <ul className="space-y-3 mb-8 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> 2 Candid Photographers</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> 2 Cinematographers</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> Drone Coverage (Aerials)</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> 3-5 Minute Cinematic Highlight</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> 500+ Edited Images</li>
                    </ul>

                    <button className="w-full bg-black text-white py-4 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex justify-center items-center gap-2">
                      Inquire Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </InView>

                {/* Package 2 */}
                <InView delay={300} className="h-full">
                  <div className="bg-black text-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <span className="bg-gray-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-300">Cinematic</span>
                      <span className="text-2xl font-serif font-bold">The Royal Cut</span>
                    </div>
                    <div className="text-4xl font-bold mb-2 relative z-10">₹2,50,000<span className="text-lg text-gray-500 font-normal">/day</span></div>
                    <p className="text-gray-400 mb-8 text-sm relative z-10">For grand celebrations requiring a full production crew.</p>

                    <ul className="space-y-3 mb-8 text-sm text-gray-300 relative z-10">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> 3 Senior Photographers</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> 3 Senior Cinematographers</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Dual Drone Coverage</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Same Day Edit (SDE) for Reception</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Premium Photo Album</li>
                    </ul>

                    <button className="w-full bg-white text-black py-4 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 relative z-10">
                      Get Started <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </InView>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl md:text-5xl font-medium max-w-md">Love notes from our couples.</h2>
                <div className="hidden md:flex gap-4">
                  <button className="p-4 rounded-full border border-gray-200 hover:bg-gray-100"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                  <button className="p-4 rounded-full bg-black text-white hover:bg-gray-800"><ArrowRight className="w-5 h-5" /></button>
                </div>
              </div>

              <InView>
                <div className="bg-gray-100/90 backdrop-blur rounded-3xl p-8 md:p-12 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 relative">
                      <div className="aspect-square bg-gray-300 rounded-2xl overflow-hidden relative">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
                          className="object-cover w-full h-full"
                          alt="Client"
                          onError={handleImageError}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-2/3">
                      <div className="flex text-yellow-500 mb-4 text-sm">★★★★★ 5.0</div>
                      <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
                        "Lumina understood our vibe perfectly. They didn't just take photos; they captured the chaos, the laughter, and the tears. The team was invisible yet everywhere."
                      </blockquote>
                      <div>
                        <cite className="not-italic font-bold block text-lg">Sofia & Rahul</cite>
                        <span className="text-gray-500 text-sm">Married in Goa, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </InView>
            </section>

            {/* FAQ */}
            <section className="py-24 px-6 max-w-3xl mx-auto" id="faq">
              <div className="text-center mb-16">
                <span className="text-gray-400 text-sm font-medium">/ FAQ</span>
                <h2 className="text-3xl md:text-4xl font-medium mt-2">Wondering How We Work?</h2>
                <button className="mt-6 px-6 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50/50 transition-colors">Contact Support</button>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-100/50 rounded-2xl p-2 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm">
                    <button
                      onClick={() => toggleAccordion(idx)}
                      className="w-full flex justify-between items-center p-4 text-left"
                    >
                      <span className="font-medium text-lg text-gray-800">{faq.q}</span>
                      {activeAccordion === idx ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-4 pt-0 text-gray-500 leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ==================================================================================== */}
        {/* GALLERY PAGE CONTENT                                                                 */}
        {/* ==================================================================================== */}

        {activePage === 'gallery' && (
          <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
                  <span className="text-gray-500 text-sm font-medium">/ Visual Archive</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight">Moments in Motion.</h1>
                <p className="text-gray-600 mt-4 max-w-xl">
                  Explore our curated collection of memories. Click on any image to enter immersive viewing mode.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Weddings', 'Pre-Wedding', 'Events', 'Editorial', 'Drone'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setGalleryFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${galleryFilter === category
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white text-gray-600 border border-transparent hover:border-gray-200'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid with InView Animation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              {filteredGallery.map((img, idx) => (
                <InView
                  key={img.id}
                  delay={idx * 50} // Staggered delay for cascade effect
                  className={`
                                relative group rounded-2xl overflow-hidden cursor-zoom-in bg-gray-100 border border-gray-100 h-full w-full
                                ${img.size === 'tall' ? 'md:row-span-2' : ''}
                                ${img.size === 'wide' ? 'md:col-span-2' : ''}
                                ${img.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                            `}
                >
                  <div
                    onClick={() => setLightboxImage(img)}
                    className="w-full h-full relative"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                        <Maximize2 className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl inline-block shadow-lg">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{img.category}</p>
                        <p className="text-sm font-medium text-black">{img.alt}</p>
                      </div>
                    </div>
                  </div>
                </InView>
              ))}
            </div>

            {/* Empty State */}
            {filteredGallery.length === 0 && (
              <div className="py-24 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">No images found</h3>
                <p className="text-gray-500 mt-2">Try selecting a different category.</p>
                <button
                  onClick={() => setGalleryFilter('All')}
                  className="mt-6 text-sm font-medium border-b border-black pb-0.5 hover:text-gray-600 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================================== */}
        {/* LIGHTBOX OVERLAY                                                                     */}
        {/* ==================================================================================== */}

        {lightboxImage && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl"
              />
              <div className="mt-6 text-center">
                <h3 className="text-white text-xl font-medium">{lightboxImage.alt}</h3>
                <p className="text-white/50 text-sm mt-1">{lightboxImage.category}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer (Always Visible) */}
        <footer className="bg-black text-white pt-24 pb-12 px-6 rounded-t-[3rem] relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between mb-20 gap-12">
              <div className="md:w-1/2">
                <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8">Lumina Studio</h2>
                <p className="text-2xl max-w-sm leading-normal text-gray-400">
                  Whether you're planning a wedding, a concert, or a brand film, <span className="text-white border-b border-white pb-1">we'd love to hear from you.</span>
                </p>

                <div className="mt-12">
                  <a href="mailto:hello@lumina.studio" className="text-3xl hover:text-gray-300 transition-colors block mb-2">hello@lumina.studio</a>
                  <p className="text-gray-500">+91 98765 43210</p>
                </div>
              </div>

              <div className="md:w-1/3 flex flex-col justify-between">
                <form className="bg-gray-900 p-6 rounded-2xl mb-8">
                  <h4 className="text-sm font-medium text-gray-300 mb-4">Sign up for our monthly visual digest.</h4>
                  <div className="flex flex-col gap-3">
                    <input
                      type="email"
                      placeholder="Email address"
                      className="bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    />
                    <button className="bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors">Sign Up</button>
                  </div>
                </form>

                <div className="grid grid-cols-2 gap-8 text-gray-400 text-sm">
                  <ul className="space-y-2">
                    <li><button onClick={() => navigateTo('home')} className="hover:text-white transition-colors">Home</button></li>
                    <li><button onClick={() => navigateTo('home', 'about')} className="hover:text-white transition-colors">About</button></li>
                    <li><button onClick={() => navigateTo('gallery')} className="hover:text-white transition-colors">Gallery</button></li>
                    <li><button onClick={() => navigateTo('home', 'faq')} className="hover:text-white transition-colors">FAQ</button></li>
                  </ul>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Twitter/X</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
              <div className="flex gap-6">
                <a href="#" className="hover:text-white">Terms & Conditions</a>
                <a href="#" className="hover:text-white">Privacy Policy</a>
              </div>
              <p>© 2025 Lumina Studios. All rights reserved.</p>
            </div>
          </div>
        </footer>


        {/* WhatsApp Floating Button */}


        {/* Floating CTA for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <a
            href="https://wa.me/917735791248"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-6 py-3 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            Book Now <Plus className="w-4 h-4" />
          </a>
        </div>

      </div> {/* End Main Content Wrapper */}
    </div>
  );
};

export default LuminaEvents;
