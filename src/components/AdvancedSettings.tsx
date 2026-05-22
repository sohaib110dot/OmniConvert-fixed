import React, { useState } from "react";
import { Settings2, Info } from "lucide-react";

interface AdvancedSettingsProps {
  category: "image" | "video" | "audio" | "document" | "archive" | "ebook" | "unit" | "compressor" | string;
  onChange?: (options: any) => void;
}

export default function AdvancedSettings({ category, onChange }: AdvancedSettingsProps) {
  // Image states
  const [quality, setQuality] = useState(80);
  const [resizePercent, setResizePercent] = useState("none");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  // Video states
  const [resolution, setResolution] = useState("1080p");
  const [videoCodec, setVideoCodec] = useState("h264");
  const [videoBitrate, setVideoBitrate] = useState("auto");

  // Audio states
  const [audioBitrate, setAudioBitrate] = useState("320k");
  const [sampleRate, setSampleRate] = useState("44100");

  // Document states
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState("eng");

  const notifyChange = (newOptions: any) => {
    if (onChange) onChange(newOptions);
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setQuality(val);
    notifyChange({ quality: val, resizePercent, width, height });
  };

  const isProFeature = category === "video" || category === "archive" || category === "audio";

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 md:p-8 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-display font-bold text-lg text-secondary-slate flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary-teal animate-spin-slow" /> Advanced Conversion Options
        </h4>
        <span className="text-[10px] bg-primary-teal/10 text-primary-teal px-2 py-1 rounded font-bold uppercase tracking-wider">
          Configuration Panel
        </span>
      </div>

      {/* IMAGE OPTIONS */}
      {(category === "image" || category === "compressor") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-gray-400">Image Quality</label>
              <span className="text-xs font-bold text-primary-teal bg-white px-2 py-0.5 border border-gray-100 rounded shadow-2xs">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={handleQualityChange}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-teal focus:outline-none"
            />
            <p className="text-[10px] text-gray-400">Higher quality results in larger file size.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Resize Scale</label>
            <select
              value={resizePercent}
              onChange={(e) => {
                setResizePercent(e.target.value);
                notifyChange({ quality, resizePercent: e.target.value, width, height });
              }}
              className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
            >
              <option value="none">No resizing (Original size)</option>
              <option value="75">75% of Original</option>
              <option value="50">50% of Original</option>
              <option value="25">25% of Original</option>
              <option value="custom">Custom Dimensions</option>
            </select>
          </div>

          {resizePercent === "custom" && (
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Width (px)</label>
                <input
                  type="number"
                  placeholder="e.g. 1920"
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value);
                    notifyChange({ quality, resizePercent, width: e.target.value, height });
                  }}
                  className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Height (px)</label>
                <input
                  type="number"
                  placeholder="e.g. 1080"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    notifyChange({ quality, resizePercent, width, height: e.target.value });
                  }}
                  className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIDEO OPTIONS */}
      {category === "video" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 font-sans">Resolution</label>
            <select
              value={resolution}
              onChange={(e) => {
                setResolution(e.target.value);
                notifyChange({ resolution: e.target.value, videoCodec, videoBitrate });
              }}
              className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
            >
              <option value="4k">4K Ultra HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p SD</option>
              <option value="original">Original resolution</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Video Codec</label>
            <select
              value={videoCodec}
              onChange={(e) => {
                setVideoCodec(e.target.value);
                notifyChange({ resolution, videoCodec: e.target.value, videoBitrate });
              }}
              className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
            >
              <option value="h264">H.264 / AVC (High compatibility)</option>
              <option value="h265">H.265 / HEVC (Efficient)</option>
              <option value="vp9">VP9 (Web standard)</option>
              <option value="av1">AV1 (Next-gen)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Target Bitrate</label>
            <select
              value={videoBitrate}
              onChange={(e) => {
                setVideoBitrate(e.target.value);
                notifyChange({ resolution, videoCodec, videoBitrate: e.target.value });
              }}
              className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="12M">12 Mbps (High Quality)</option>
              <option value="6M">6 Mbps (Medium Quality)</option>
              <option value="3M">3 Mbps (Low Quality)</option>
            </select>
          </div>
        </div>
      )}

      {/* AUDIO OPTIONS */}
      {category === "audio" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Audio Bitrate</label>
            <select
              value={audioBitrate}
              onChange={(e) => {
                setAudioBitrate(e.target.value);
                notifyChange({ audioBitrate: e.target.value, sampleRate });
              }}
              className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
            >
              <option value="320k">320 kbps (High Quality)</option>
              <option value="192k">192 kbps (Standard)</option>
              <option value="128k">128 kbps (Mobile-friendly)</option>
              <option value="64k">64 kbps (Mono speech)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Sample Rate</label>
            <select
              value={sampleRate}
              onChange={(e) => {
                setSampleRate(e.target.value);
                notifyChange({ audioBitrate, sampleRate: e.target.value });
              }}
              className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
            >
              <option value="48000">48 kHz (DVD/Studio)</option>
              <option value="44100">44.1 kHz (CD Standard)</option>
              <option value="22050">22.05 kHz (Low quality)</option>
            </select>
          </div>
        </div>
      )}

      {/* DOCUMENT & PDF OPTIONS */}
      {(category === "document" || category === "pdf") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
            <div className="space-y-1">
              <label className="text-sm font-bold text-secondary-slate">Enable OCR (Optical Character Recognition)</label>
              <p className="text-xs text-gray-400">Convert scanned PDFs or images into editable documents.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ocrEnabled}
                onChange={(e) => {
                  setOcrEnabled(e.target.checked);
                  notifyChange({ ocrEnabled: e.target.checked, ocrLanguage });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-teal"></div>
            </label>
          </div>

          {ocrEnabled && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">OCR Source Language</label>
              <select
                value={ocrLanguage}
                onChange={(e) => {
                  setOcrLanguage(e.target.value);
                  notifyChange({ ocrEnabled, ocrLanguage: e.target.value });
                }}
                className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-teal shadow-2xs"
              >
                <option value="eng">English (US/UK)</option>
                <option value="deu">German (Deutsch)</option>
                <option value="fra">French (Français)</option>
                <option value="spa">Spanish (Español)</option>
                <option value="jpn">Japanese (日本語)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* FALLBACK INFO PANEL */}
      {["archive", "ebook", "unit"].includes(category) && (
        <div className="flex gap-3 bg-white p-4 border border-gray-200 rounded-xl items-start shadow-2xs">
          <Info className="w-5 h-5 text-primary-teal flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs text-gray-500 leading-relaxed">
            <span className="font-bold text-secondary-slate block mb-0.5">Automated Formatting Active</span>
            OmniConvert automatically optimizes conversion parameters for this file format. No advanced parameters are required. Upload your file to start!
          </div>
        </div>
      )}

      {isProFeature && (
        <div className="mt-4 text-[10px] text-gray-400 flex items-center gap-1.5 bg-white border border-dashed border-gray-200 py-1.5 px-3 rounded-lg">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block animate-ping" />
          Some configurations shown are customized automatically depending on plan tiers.
        </div>
      )}
    </div>
  );
}
