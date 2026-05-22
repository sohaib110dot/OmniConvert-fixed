import React, { useState } from "react";
import { Cloud, Globe, FolderOpen, ArrowRight, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CloudUploadButtonsProps {
  onUrlSubmit?: (url: string) => void;
}

export default function CloudUploadButtons({ onUrlSubmit }: CloudUploadButtonsProps) {
  const [activeModal, setActiveModal] = useState<"gdrive" | "onedrive" | "dropbox" | "url" | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (onUrlSubmit) {
      onUrlSubmit(urlInput);
    }
    setActiveModal(null);
    setUrlInput("");
  };

  const providers = [
    { id: "gdrive" as const, name: "Google Drive", icon: Cloud, color: "text-blue-500 bg-blue-50 border-blue-100 hover:border-blue-500" },
    { id: "onedrive" as const, name: "OneDrive", icon: FolderOpen, color: "text-sky-600 bg-sky-50 border-sky-100 hover:border-sky-500" },
    { id: "dropbox" as const, name: "Dropbox", icon: Cloud, color: "text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-500" },
    { id: "url" as const, name: "URL Link", icon: Globe, color: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-500" }
  ];

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6">
        {providers.map((provider) => {
          const IconComp = provider.icon;
          return (
            <button
              key={provider.id}
              onClick={() => setActiveModal(provider.id)}
              className={`flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-xs md:text-sm font-medium border shadow-2xs hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer ${provider.color}`}
            >
              <IconComp className="w-4 h-4" /> {provider.name}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full relative overflow-hidden"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {activeModal === "url" ? (
                <form onSubmit={handleUrlSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Globe className="w-6 h-6" />
                    <h4 className="font-display font-bold text-lg">Upload from URL</h4>
                  </div>
                  <p className="text-xs text-gray-500">Provide the direct web link of the file you wish to import.</p>
                  
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://example.com/document.pdf"
                      required
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    Import File <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-lg text-secondary-slate">
                      {providers.find(p => p.id === activeModal)?.name} Integration
                    </h4>
                    <p className="text-xs text-gray-400">Cloud importer skeleton mockup</p>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed px-2">
                    Direct integration with <b>{providers.find(p => p.id === activeModal)?.name}</b> is currently under active development.
                  </p>

                  <div className="bg-amber-50/50 text-[10px] text-amber-700 font-bold uppercase py-1 px-3 rounded-md inline-block">
                    Coming Soon in Phase 1
                  </div>

                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-secondary-slate rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Got it, close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
