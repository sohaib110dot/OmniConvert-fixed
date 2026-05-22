import React, { useState } from "react";
import { Link, useRouter } from "./Router.tsx";
import { Upload, ChevronDown, Menu, X, AlertCircle, Sparkles } from "lucide-react";

interface NavbarProps {
  health: any;
}

export default function Navbar({ health }: NavbarProps) {
  const { navigate } = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { name: "Image Converter", path: "/convert/image" },
    { name: "Video Converter", path: "/convert/video" },
    { name: "Audio Converter", path: "/convert/audio" },
    { name: "Document Converter", path: "/convert/document" },
    { name: "PDF Suite", path: "/convert/pdf" },
    { name: "Archive Packer", path: "/convert/archive" },
    { name: "eBook Converter", path: "/convert/ebook" },
    { name: "Unit Converter", path: "/convert/unit" },
    { name: "Compressors", path: "/convert/compressor" }
  ];

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-2xs font-sans">
      
      {/* Prototype Health Banner */}
      <div className="bg-amber-50 border-b border-amber-100 py-1.5 px-4 text-center">
        <div className="text-[10px] md:text-xs font-medium text-amber-700 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            OmniConvert is running on <strong>Live Infrastructure</strong>.
          </span>
          {health && (
            <div className="flex items-center gap-3 opacity-90 border-l border-amber-200 pl-4">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${health.database.isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} /> DB
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${health.redis.isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} /> Redis
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${health.env.hasS3 ? "bg-green-500 animate-pulse" : "bg-red-500"}`} /> Storage
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 outline-none group cursor-pointer">
          <div className="w-10 h-10 bg-primary-teal rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-md">
            <Upload className="text-white w-6 h-6 animate-pulse" />
          </div>
          <span className="text-lg md:text-xl font-display font-bold tracking-tight text-primary-teal">OmniConvert</span>
        </Link>
        
        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-secondary-slate">
          
          {/* Dropdown triggers */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className="hover:text-primary-teal flex items-center gap-1 py-4 transition-colors cursor-pointer outline-none"
            >
              Converters <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "transform rotate-180 text-primary-teal" : ""}`} />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute top-14 left-0 bg-white border border-gray-150 rounded-2xl shadow-xl p-4 w-64 grid grid-cols-1 gap-1 z-50"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={cat.path}
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-primary-teal/5 text-gray-600 hover:text-primary-teal rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <Sparkles className="w-3.5 h-3.5 opacity-0 hover:opacity-100 transition-opacity text-primary-teal" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/pricing" className="hover:text-primary-teal py-4 transition-colors">Pricing</Link>
          <Link to="/api" className="hover:text-primary-teal py-4 transition-colors">Developer API</Link>
          <Link to="/dashboard" className="hover:text-primary-teal py-4 transition-colors">Dashboard</Link>
          <Link to="/blog" className="hover:text-primary-teal py-4 transition-colors font-semibold">Help & Blog</Link>
        </div>

        {/* AUTH ACTIONS */}
        <div className="hidden lg:flex items-center gap-3 md:gap-4">
          <Link to="/login" className="text-sm font-bold text-secondary-slate hover:text-primary-teal cursor-pointer">Log In</Link>
          <Link to="/signup" className="btn-primary py-2 px-5 text-sm whitespace-nowrap cursor-pointer shadow-sm hover:opacity-90 active:scale-95 transition-all">Sign Up</Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-500 hover:text-secondary-slate rounded-lg cursor-pointer outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white p-4 space-y-4 shadow-lg absolute w-full left-0 z-50">
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-3">Converters</p>
            <div className="grid grid-cols-2 gap-1 pl-2">
              {categories.map((cat, idx) => (
                <Link
                  key={idx}
                  to={cat.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-primary-teal rounded-lg transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          
          <hr className="border-gray-50" />

          <div className="flex flex-col gap-2.5 px-3">
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-primary-teal transition-colors">Pricing</Link>
            <Link to="/api" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-primary-teal transition-colors">Developer API</Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-primary-teal transition-colors">Dashboard</Link>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-primary-teal transition-colors">Help & Blog</Link>
          </div>

          <hr className="border-gray-50" />

          <div className="grid grid-cols-2 gap-3 px-3">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-center text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">Log In</Link>
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-center text-sm font-bold text-white bg-primary-teal hover:opacity-90 rounded-xl transition-all shadow-sm">Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
