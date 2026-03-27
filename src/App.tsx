/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Heart, 
  Wind, 
  Layers, 
  ShieldCheck, 
  Palette, 
  Maximize2, 
  Star,
  ChevronRight,
  Menu,
  X,
  Play,
  Loader2,
  Video,
  Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const carouselRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const isVideoInView = useInView(videoSectionRef, { amount: 0.5, once: true });

  const galleryImages = [
    "https://i.ibb.co/v4hy9Xcn/header.jpg",
    "https://i.ibb.co/tMKmHg0N/img1.jpg",
    "https://i.ibb.co/Swb7d8bP/img2.jpg",
    "https://i.ibb.co/DfYrcgMh/img3.jpg",
    "https://i.ibb.co/C5r3WV6X/img4.jpg",
    "https://i.ibb.co/0Vm4Wk67/img5.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateConstraints = () => {
      if (carouselRef.current && contentRef.current) {
        const carouselWidth = carouselRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setDragConstraints({
          left: -(contentWidth - carouselWidth),
          right: 0
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-rose-500" />,
      title: "হাই-কোয়ালিটি ম্যাটেরিয়াল",
      desc: "প্রিমিয়াম নাইলন ও স্প্যানডেক্স দিয়ে তৈরি যা দীর্ঘস্থায়ী।"
    },
    {
      icon: <Wind className="w-6 h-6 text-rose-500" />,
      title: "সফট ও ব্রিদেবল",
      desc: "ভেতরে কটন মোল্ড কাপ যা প্রচণ্ড গরমেও প্রশান্তি দেয়।"
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: "বাটারফ্লাই লেস ডিজাইন",
      desc: "চমৎকার ডিজাইন যা আপনাকে দিবে এক ইউনিক ও স্টাইলিশ লুক।"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-500" />,
      title: "বাড়তি সাপোর্ট",
      desc: "চওড়া ইলাস্টিক বেল্ট যা সারাদিন নিখুঁত সাপোর্ট নিশ্চিত করে।"
    }
  ];

  const sizes = [
    { label: "M", size: "৩৪" },
    { label: "L", size: "৩৬" },
    { label: "XL", size: "৩৮" },
    { label: "2XL", size: "৪০" },
    { label: "3XL", size: "৪২" }
  ];

  const colors = [
    { name: "Black", class: "bg-black", image: "https://i.ibb.co/tMKmHg0N/img1.jpg" },
    { name: "Nude", class: "bg-[#E3C5AF]", image: "https://i.ibb.co/Swb7d8bP/img2.jpg" },
    { name: "Rose", class: "bg-rose-300", image: "https://i.ibb.co/DfYrcgMh/img3.jpg" },
    { name: "Blue", class: "bg-blue-300", image: "https://i.ibb.co/C5r3WV6X/img4.jpg" },
    { name: "Grey", class: "bg-stone-400", image: "https://i.ibb.co/0Vm4Wk67/img5.jpg" }
  ];

  const testimonials = [
    {
      name: "সাদিয়া ইসলাম",
      location: "ঢাকা",
      image: "https://i.ibb.co/tMKmHg0N/img1.jpg",
      rating: 5,
      text: "অসাধারণ একটি প্রোডাক্ট! বাটারফ্লাই ডিজাইনটা সত্যিই ইউনিক আর ম্যাটেরিয়াল অনেক সফট। সারাদিন পরে থাকলেও কোনো অস্বস্তি হয় না।"
    },
    {
      name: "নুসরাত জাহান",
      location: "চট্টগ্রাম",
      image: "https://i.ibb.co/Swb7d8bP/img2.jpg",
      rating: 5,
      text: "আমি এর আগে অনেক স্পোর্টস ব্রা ব্যবহার করেছি, কিন্তু ম্যাজিক পারফরম্যান্সের মতো সাপোর্ট আর কোথাও পাইনি। কালারগুলোও খুব সুন্দর।"
    },
    {
      name: "ফারহানা আক্তার",
      location: "সিলেট",
      image: "https://i.ibb.co/DfYrcgMh/img3.jpg",
      rating: 4,
      text: "খুবই আরামদায়ক। বিশেষ করে জিম করার সময় এটি অনেক ভালো সাপোর্ট দেয়। ডেলিভারিও খুব দ্রুত পেয়েছি। ধন্যবাদ!"
    }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-900">Magic Performance</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors">বৈশিষ্ট্য</a>
              <a href="#video" onClick={(e) => handleNavClick(e, 'video')} className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors">ভিডিও</a>
              <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors">রিভিউ</a>
              <a href="#details" onClick={(e) => handleNavClick(e, 'details')} className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors">বিস্তারিত</a>
              <a href="#order" onClick={(e) => handleNavClick(e, 'order')} className="bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">অর্ডার করুন</a>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-stone-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-stone-100 px-4 py-6 flex flex-col gap-4"
          >
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-lg font-medium text-stone-800">বৈশিষ্ট্য</a>
            <a href="#video" onClick={(e) => handleNavClick(e, 'video')} className="text-lg font-medium text-stone-800">ভিডিও</a>
            <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-lg font-medium text-stone-800">রিভিউ</a>
            <a href="#details" onClick={(e) => handleNavClick(e, 'details')} className="text-lg font-medium text-stone-800">বিস্তারিত</a>
            <a href="#order" onClick={(e) => handleNavClick(e, 'order')} className="bg-rose-500 text-white px-6 py-3 rounded-xl text-center font-bold">অর্ডার করুন</a>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
              প্রিমিয়াম কোয়ালিটি স্পোর্টস ব্রা
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 leading-[1.1] mb-6">
              ম্যাজিক পারফরম্যান্স — <br />
              <span className="text-rose-500 italic">স্টাইল ও কমফোর্টের</span> সেরা কম্বো!
            </h1>
            <p className="text-lg text-stone-600 mb-8 max-w-lg leading-relaxed">
              সারাদিন সতেজ আর আত্মবিশ্বাসী থাকতে চান? আমাদের এই স্পোর্টস ব্রা আপনার ডেলি লাইফ আর ওয়ার্কআউটকে করবে আরও সহজ ও আরামদায়ক। এর চমৎকার Butterfly Lace Design আপনাকে দিবে এক ইউনিক লুক। 🦋
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#order" 
                onClick={(e) => handleNavClick(e, 'order')}
                className="flex items-center justify-center gap-2 bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 group"
              >
                এখনই কিনুন 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <div className="flex items-center gap-3 px-4">
                <div className="flex -space-x-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                      <img src={`https://i.ibb.co/C5r3WV6X/img4.jpg`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <p className="text-stone-500 font-medium">৫০০০+ সন্তুষ্ট গ্রাহক</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-rose-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:ml-auto">
              {galleryImages.map((img, i) => (
                <div key={i} className="aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  <img 
                    src={img} 
                    alt={`Product detail ${i + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <motion.section 
        id="video" 
        ref={videoSectionRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-stone-900 text-white overflow-hidden relative scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                পণ্যটি সরাসরি <span className="text-rose-500">অ্যাকশনে</span> দেখুন
              </h2>
              <p className="text-stone-400 text-lg mb-8 leading-relaxed">
                আমাদের স্পোর্টস ব্রা-এর ফিটিং, কমফোর্ট এবং স্টাইল সরাসরি ভিডিওতে দেখে নিন। এটি আপনার শরীরের সাথে নিখুঁতভাবে ফিট হয় এবং ওয়ার্কআউটের সময় সর্বোচ্চ সাপোর্ট নিশ্চিত করে।
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-2xl border border-stone-700">
                  <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white">প্রিমিয়াম কোয়ালিটি</p>
                    <p className="text-sm text-stone-400">ভিডিওতে কাপড়ের মান যাচাই করুন</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-2xl border border-stone-700">
                  <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white">নিখুঁত ফিটিং</p>
                    <p className="text-sm text-stone-400">শরীরের সাথে মানানসই ডিজাইন</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="w-full max-w-[350px] aspect-[9/16] bg-stone-800 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-stone-700 relative group">
                {isVideoInView && (
                  <iframe 
                    src="https://www.youtube.com/embed/7gk2QRdY6yI?autoplay=1&mute=1&loop=1&playlist=7gk2QRdY6yI&rel=0" 
                    title="Magic Performance Sports Bra Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )}
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-rose-500 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-white scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">কেন এটি আপনার সংগ্রহে রাখা জরুরি?</h2>
            <p className="text-stone-500">সেরা মানের ম্যাটেরিয়াল এবং আধুনিক ডিজাইনের সমন্বয় যা আপনাকে দিবে সর্বোচ্চ আরাম।</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-xl hover:shadow-rose-100/50"
              >
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-rose-50/50 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">গ্রাহকদের মতামত</h2>
            <p className="text-stone-500">আমাদের সন্তুষ্ট গ্রাহকদের কাছ থেকে সরাসরি শুনে নিন তাদের অভিজ্ঞতার কথা।</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-rose-100 relative"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={cn("w-4 h-4 fill-current", idx >= t.rating && "text-stone-200")} 
                    />
                  ))}
                </div>
                <p className="text-stone-600 mb-8 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={t.image} 
                    alt={t.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-100" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-stone-900">{t.name}</h4>
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Product Details & Size Guide */}
      <motion.section 
        id="details" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-stone-50 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-6 md:mb-8 flex items-center gap-3">
                <Palette className="text-rose-500" /> সাইজ গাইড
              </h2>
              
              <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">সাইজ বেছে নিন</p>
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">সোয়াইপ করুন →</span>
                </div>
                
                <div className="relative" ref={carouselRef}>
                  <motion.div 
                    ref={contentRef}
                    drag="x"
                    dragConstraints={dragConstraints}
                    dragElastic={0.1}
                    className="flex gap-2 md:gap-4 cursor-grab active:cursor-grabbing py-2"
                  >
                    {sizes.map((s, i) => (
                      <motion.div 
                        key={i} 
                        onClick={() => setSelectedSize(s.label)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "flex-shrink-0 w-14 md:w-28 text-center p-2 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 relative group",
                          selectedSize === s.label 
                            ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-200 scale-105" 
                            : "bg-stone-50 border-stone-100 text-stone-900 hover:border-rose-200"
                        )}
                      >
                        {selectedSize === s.label && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-white text-rose-500 rounded-full p-0.5 shadow-md border border-rose-100"
                          >
                            <Check className="w-2 h-2 md:w-3 md:h-3" />
                          </motion.div>
                        )}
                        <p className={cn("text-lg md:text-2xl font-black", selectedSize === s.label ? "text-white" : "text-rose-500")}>{s.label}</p>
                        <p className={cn("text-[10px] md:text-xs font-bold", selectedSize === s.label ? "text-rose-100" : "text-stone-400")}>({s.size})</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <p className="mt-8 text-sm text-stone-500 italic flex items-center gap-2 mb-6">
                  <Maximize2 className="w-4 h-4" /> আপনার সঠিক সাইজটি বেছে নিন নিখুঁত ফিটিংয়ের জন্য।
                </p>

                <div className="mt-6 border-t border-stone-100 pt-6">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">সাইজ চার্ট (ইঞ্চি)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="py-2 font-bold text-stone-900">সাইজ</th>
                          <th className="py-2 font-bold text-stone-900">বক্ষ (Bust)</th>
                          <th className="py-2 font-bold text-stone-900">উপযুক্ত (Weight)</th>
                        </tr>
                      </thead>
                      <tbody className="text-stone-600">
                        {sizes.map((s, i) => (
                          <tr key={i} className={cn("border-b border-stone-50 last:border-0", selectedSize === s.label && "bg-rose-50/50")}>
                            <td className="py-2 font-bold">{s.label}</td>
                            <td className="py-2">{s.size}"</td>
                            <td className="py-2">{i === 0 ? "৪৫-৫০" : i === 1 ? "৫০-৫৫" : i === 2 ? "৫৫-৬০" : i === 3 ? "৬০-৬৫" : "৬৫-৭০"} কেজি</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-rose-500 p-10 rounded-[2.5rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-bold mb-6">প্রোডাক্ট স্পেসিফিকেশন</h3>
                <ul className="space-y-4">
                  {[
                    "ম্যাটেরিয়াল: হাই-কোয়ালিটি নাইলন ও স্প্যানডেক্স",
                    "সফট টাচ: ভেতরে কটন মোল্ড কাপ",
                    "ডিজাইন: সিমলেস এবং গ্যাদার ফাংশন",
                    "সাপোর্ট: চওড়া ইলাস্টিক বেল্ট",
                    "কালার: ৫টি আকর্ষণীয় কালার"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-rose-200" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-3xl overflow-hidden">
                  <img src="https://i.ibb.co/tMKmHg0N/img1.jpg" alt="Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="aspect-square rounded-3xl overflow-hidden">
                  <img src="https://i.ibb.co/Swb7d8bP/img2.jpg" alt="Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Order Section */}
      <motion.section 
        id="order" 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-white relative overflow-hidden scroll-mt-16"
      >
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="bg-stone-900 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">অর্ডার কনফার্ম করুন</h2>
              <p className="text-stone-400">নিচের ফর্মটি পূরণ করে আপনার অর্ডারটি সম্পন্ন করুন। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase">আপনার নাম</label>
                  <input type="text" placeholder="পুরো নাম লিখুন" className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase">মোবাইল নম্বর</label>
                  <input type="tel" placeholder="০১৭XXXXXXXX" className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-400 uppercase">পুরো ঠিকানা</label>
                <textarea rows={3} placeholder="আপনার বর্তমান ঠিকানা লিখুন" className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none resize-none"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase">সাইজ নির্বাচন করুন</label>
                  <select 
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none appearance-none"
                  >
                    {sizes.map((s) => (
                      <option key={s.label} value={s.label}>{s.label} ({s.size})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase">কালার নির্বাচন করুন</label>
                  <select 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none appearance-none"
                  >
                    {colors.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-5 rounded-2xl text-xl transition-all shadow-xl shadow-rose-900/20 flex items-center justify-center gap-3 mt-8">
                <ShoppingBag className="w-6 h-6" /> অর্ডার কনফার্ম করুন
              </button>
            </form>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-stone-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> ক্যাশ অন ডেলিভারি
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> ৩ দিনের মধ্যে রিটার্ন
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> সারা বাংলাদেশে হোম ডেলিভারি
              </div>
            </div>
          </div>
        </div>
        
        {/* Background shapes */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-20 w-64 h-64 bg-rose-100 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl -z-0"></div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-stone-900">Magic Performance</span>
          </div>
          <p className="text-stone-500 text-sm">© ২০২৬ ম্যাজিক পারফরম্যান্স। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
