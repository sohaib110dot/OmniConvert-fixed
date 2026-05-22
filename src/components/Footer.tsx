import React from "react";
import { Link } from "./Router.tsx";
import { Upload } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary-slate text-white py-12 md:py-20 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 md:gap-12">
        
        {/* Branding Column */}
        <div className="col-span-2 lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2 mb-2 outline-none group cursor-pointer">
            <Upload className="text-primary-teal w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xl font-display font-bold">OmniConvert</span>
          </Link>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
            OmniConvert is a premium developer-friendly and consumer-oriented visual translation engine. We support over 1,500+ file transformations with absolute isolation container safety.
          </p>
          <div className="flex items-center gap-4">
            <select className="bg-transparent border border-gray-700 text-xs p-1.5 rounded outline-none focus:border-primary-teal text-gray-300">
              <option className="bg-secondary-slate">English (US)</option>
              <option className="bg-secondary-slate">Deutsch</option>
              <option className="bg-secondary-slate">Español</option>
              <option className="bg-secondary-slate">Français</option>
            </select>
          </div>
        </div>
        
        {/* Video Column */}
        <div>
          <h5 className="font-bold mb-4 text-xs md:text-sm uppercase tracking-wider text-primary-teal">Video</h5>
          <ul className="text-xs md:text-sm space-y-2.5 text-gray-400 font-semibold">
            <li><Link to="/convert/video" className="hover:text-white transition-colors">MP4 Converter</Link></li>
            <li><Link to="/convert/video" className="hover:text-white transition-colors">MOV to MP4</Link></li>
            <li><Link to="/convert/video" className="hover:text-white transition-colors">MKV to MP4</Link></li>
            <li><Link to="/convert/video" className="hover:text-white transition-colors">WEBM to MP4</Link></li>
          </ul>
        </div>

        {/* Audio Column */}
        <div>
          <h5 className="font-bold mb-4 text-xs md:text-sm uppercase tracking-wider text-primary-teal">Audio</h5>
          <ul className="text-xs md:text-sm space-y-2.5 text-gray-400 font-semibold">
            <li><Link to="/convert/audio" className="hover:text-white transition-colors">MP3 Converter</Link></li>
            <li><Link to="/convert/audio" className="hover:text-white transition-colors">WAV to MP3</Link></li>
            <li><Link to="/convert/audio" className="hover:text-white transition-colors">MP4 to MP3</Link></li>
            <li><Link to="/convert/audio" className="hover:text-white transition-colors">Audio Compressor</Link></li>
          </ul>
        </div>

        {/* Image Column */}
        <div>
          <h5 className="font-bold mb-4 text-xs md:text-sm uppercase tracking-wider text-primary-teal">Image</h5>
          <ul className="text-xs md:text-sm space-y-2.5 text-gray-400 font-semibold">
            <li><Link to="/convert/image" className="hover:text-white transition-colors">JPG to PNG</Link></li>
            <li><Link to="/convert/image" className="hover:text-white transition-colors">PNG to JPG</Link></li>
            <li><Link to="/convert/image" className="hover:text-white transition-colors">JPG to WEBP</Link></li>
            <li><Link to="/convert/image" className="hover:text-white transition-colors">Image Compressor</Link></li>
          </ul>
        </div>

        {/* Document Column */}
        <div>
          <h5 className="font-bold mb-4 text-xs md:text-sm uppercase tracking-wider text-primary-teal">Document</h5>
          <ul className="text-xs md:text-sm space-y-2.5 text-gray-400 font-semibold">
            <li><Link to="/convert/pdf" className="hover:text-white transition-colors">PDF to JPG</Link></li>
            <li><Link to="/convert/pdf" className="hover:text-white transition-colors">JPG to PDF</Link></li>
            <li><Link to="/convert/document" className="hover:text-white transition-colors">DOCX to PDF</Link></li>
            <li><Link to="/convert/ebook" className="hover:text-white transition-colors">EPUB to PDF</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-semibold">
        <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
          <Link to="/blog" className="hover:text-white transition-colors">Help Center & Blog</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing Tiers</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/security" className="hover:text-white transition-colors">Security Rules</Link>
        </div>
        <div className="text-center md:text-right">
          © OmniConvert.com v2.30 All rights reserved (2026)
        </div>
      </div>
    </footer>
  );
}
