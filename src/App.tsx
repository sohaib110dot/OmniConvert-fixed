/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  FileVideo, 
  FileAudio, 
  FileImage, 
  FileArchive, 
  FileText, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  Plus,
  Globe
} from "lucide-react";

import { RouterProvider, useRouter, Link } from "./components/Router.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import CloudUploadButtons from "./components/CloudUploadButtons.tsx";
import FAQ from "./components/FAQ.tsx";
import { 
  PricingPage, 
  ApiPage, 
  DashboardPage, 
  LegalPage, 
  BlogPage, 
  AuthPage, 
  ConvertPage 
} from "./components/Pages.tsx";

// --- Types ---
interface Converter {
  slug: string;
  name: string;
  supported_inputs: string[];
  supported_outputs: string[];
  advanced_options: any;
}

interface Job {
  jobId: string;
  status: "processing" | "done" | "error" | "queued";
  progress: number;
  eta: string;
  inputName: string;
  inputSize: string;
  outputUrl: string | null;
  converterSlug?: string | null;
  outputFormat?: string | null;
  error?: string | null;
}

function isMediaJob(job: Job): boolean {
  return (
    job.converterSlug === "video-converter" ||
    job.converterSlug === "audio-converter"
  );
}

interface BackendStatus {
  database: { isConnected: boolean; error: string | null };
  redis: { isConnected: boolean };
  env: { hasMongo: boolean; hasS3: boolean; hasRedis: boolean };
}

// --- Home Components ---
const Hero = ({ onUpload }: { onUpload: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="py-12 md:py-20 bg-gray-50 border-b border-gray-100 font-sans">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-4 tracking-tight text-secondary-slate">
            File Converter
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Easily convert files from one format to another, online.
          </p>
        </motion.div>

        <div className="relative max-w-2xl mx-auto">
          <div 
            className="border-2 border-dashed border-primary-teal/30 bg-white rounded-2xl p-8 md:p-12 hover:border-primary-teal transition-colors cursor-pointer group shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onUpload();
            }}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-teal text-white rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <p className="text-lg md:text-xl font-bold mb-1 text-secondary-slate">Choose Files</p>
              <p className="text-gray-400 text-xs md:text-sm mb-4">or Drop Files Here</p>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold bg-gray-50 px-3 py-1 rounded">Max file size 100MB. Sign Up for more</div>
            </div>
          </div>
          
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={() => onUpload()}
          />

          <div className="mt-4 text-xs text-gray-400">
            By proceeding, you agree to our <Link to="/terms" className="underline hover:text-primary-teal">Terms of Use</Link>.
          </div>

          <CloudUploadButtons />
        </div>
      </div>
    </div>
  );
};

const ConverterCard = ({ 
  icon: Icon, 
  title, 
  formats, 
  to 
}: { 
  icon: any, 
  title: string, 
  formats: string, 
  to: string 
}) => (
  <Link 
    to={to}
    className="bg-white border border-gray-100 p-6 rounded-xl hover:shadow-xl hover:border-primary-teal transition-all cursor-pointer group flex flex-col justify-between"
  >
    <div>
      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-teal group-hover:text-white transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display font-bold text-lg mb-1 text-secondary-slate">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{formats}</p>
    </div>
    <div className="flex items-center gap-1 text-primary-teal font-semibold text-sm">
      Open <ChevronRight className="w-4 h-4" />
    </div>
  </Link>
);

const JobProgressCard = ({ job, onCancel }: { job: Job, onCancel: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-white border border-gray-150 shadow-2xl rounded-2xl p-5 w-[calc(100%-2rem)] max-w-xs fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] font-sans"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-bold text-sm truncate w-48 text-secondary-slate">{job.inputName}</h4>
        <p className="text-xs text-gray-400">{job.inputSize}</p>
      </div>
      <button onClick={onCancel} className="text-gray-400 hover:text-red-500 cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between text-xs font-bold text-secondary-slate">
        <span>{job.status === "processing" ? "Converting..." : job.status === "error" ? "Failed" : "Complete"}</span>
        <span>{job.progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${job.status === "error" ? "bg-red-500" : "bg-primary-teal"}`}
          initial={{ width: 0 }}
          animate={{ width: `${job.progress}%` }}
        />
      </div>
      {job.outputFormat === "webm" && isMediaJob(job) && (
        <p className="text-[11px] text-primary-teal/80 leading-snug">
          Fast WebM mode is used for quicker conversion on VPS.
        </p>
      )}
      {isMediaJob(job) &&
        job.status === "processing" &&
        job.progress >= 40 &&
        job.progress < 100 && (
          <p className="text-[11px] text-gray-500 leading-snug">
            Processing media with FFmpeg. Large videos can take several minutes.
          </p>
        )}
      {job.status === "error" && job.error && (
        <p className="text-[11px] text-red-600 leading-snug font-medium">{job.error}</p>
      )}
      <div className="flex justify-between items-center pt-2">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          {job.status === "error" ? "Error" : `ETA: ${job.eta}`}
        </span>
        {job.status === "done" && (
          <a 
            href={job.outputUrl || "#"} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-primary-teal hover:underline cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

function MainApp() {
  const { path, navigate } = useRouter();

  const [convertersData, setConvertersData] = useState<Record<string, Converter> | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [healthStatus, setHealthStatus] = useState<BackendStatus | null>(null);

  const [error, setError] = useState<ReactNode | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissedError, setDismissedError] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("omni_db_error_dismissed") === "true";
    }
    return false;
  });

  const checkHealth = async (isManual = false) => {
    if (isManual) setIsRetrying(true);
    try {
      if (isManual) {
        await fetch("/api/v1/health/retry", { method: "POST" });
      }

      const r = await fetch("/api/v1/health");
      const data = await r.json();
      setHealthStatus(data);
      
      if (data.database.isConnected) {
        if (isManual) {
          setError(null);
          setDismissedError(false);
          localStorage.removeItem("omni_db_error_dismissed");
        }
      } else if (data.database.error && (!dismissedError || isManual)) {
        console.error("DB Error reported by backend:", data.database.error);
        if (data.database.error.includes("Authentication failed") || data.database.error.includes("bad auth")) {
          setError(
            <div className="flex items-start gap-3">
              <div className="flex-grow">
                <strong className="block text-sm">MongoDB Authentication Failed</strong>
                <div className="mt-1 opacity-90 text-[11px] leading-snug">
                  The credentials in your <b>MONGODB_URI</b> are incorrect.
                  <br/><br/>
                  <b>To Fix:</b>
                  <ol className="list-decimal ml-4 mt-1 space-y-0.5">
                    <li>Open <b>Settings</b> (bottom left sidebar)</li>
                    <li>Check <b>MONGODB_URI</b> credentials</li>
                    <li>Ensure password special characters are <b>URL-encoded</b></li>
                    <li>Verify the user has <b>Read/Write</b> access in Atlas <b>Database Access</b></li>
                  </ol>
                  <span className="mt-2 block font-bold text-amber-900 bg-amber-200/50 px-2 py-0.5 rounded-sm inline-block underline decoration-dotted">App is currently using In-Memory Fallback.</span>
                </div>
                <button 
                  onClick={() => checkHealth(true)} 
                  disabled={isRetrying}
                  className="mt-3 text-[10px] font-bold bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 disabled:opacity-50 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  {isRetrying ? "Checking..." : "Verify & Retry"}
                </button>
              </div>
              <button 
                onClick={() => { 
                  setError(null); 
                  setDismissedError(true);
                  localStorage.setItem("omni_db_error_dismissed", "true");
                }}
                className="p-1 hover:bg-black/5 rounded transition-colors cursor-pointer"
                title="Dismiss and use fallback"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        } else if (data.database.error.includes("MongooseServerSelectionError") || data.database.error.includes("whitelist")) {
          setError(
            <div className="flex items-start gap-3">
              <div className="flex-grow">
                <strong className="block text-sm">MongoDB Atlas Connection Blocked</strong>
                <div className="mt-1 opacity-90 text-[11px] leading-snug">
                  Your Atlas cluster is rejecting the connection. This usually means the IP address of this environment isn't whitelisted.
                  <br/><br/>
                  <b>To Fix:</b>
                  <ol className="list-decimal ml-4 mt-1 space-y-0.5">
                    <li>Log into <b>MongoDB Atlas</b></li>
                    <li>Go to <b>Network Access</b></li>
                    <li>Click <b>Add IP Address</b></li>
                    <li>Add <b>0.0.0.0/0</b> (allows all IPs - best for dynamic environments)</li>
                  </ol>
                  <span className="mt-2 block font-bold text-amber-900 bg-amber-200/50 px-2 py-0.5 rounded-sm inline-block underline decoration-dotted">App is currently using In-Memory Fallback.</span>
                </div>
                <button 
                  onClick={() => checkHealth(true)} 
                  disabled={isRetrying}
                  className="mt-3 text-[10px] font-bold bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 disabled:opacity-50 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  {isRetrying ? "Checking..." : "Re-check Connection"}
                </button>
              </div>
              <button 
                onClick={() => { 
                  setError(null); 
                  setDismissedError(true);
                  localStorage.setItem("omni_db_error_dismissed", "true");
                }}
                className="p-1 hover:bg-black/5 rounded transition-colors cursor-pointer"
                title="Dismiss and use fallback"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }
      }
    } catch (err) {
      console.warn("Health check failed:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    fetch("/api/v1/converters")
      .then(r => r.json())
      .then(data => {
        const mapped = data.reduce((acc: any, curr: any) => {
          acc[curr.id] = curr;
          return acc;
        }, {});
        setConvertersData(mapped);
      })
      .catch(err => {
        console.error("Failed to load converters:", err);
        setError("Could not connect to conversion service.");
      });
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeJob && (activeJob.status === "processing" || activeJob.status === "queued")) {
      const poll = async () => {
        try {
          const r = await fetch(`/api/v1/status/${activeJob.jobId}`);
          if (!r.ok) throw new Error("Status check failed");
          const data = await r.json();
          
          setActiveJob((prev) => {
            if (!prev || prev.jobId !== data.jobId) return prev;
            if (
              prev.progress === data.progress &&
              prev.status === data.status &&
              prev.error === data.error &&
              prev.eta === data.eta
            ) {
              return prev;
            }
            return {
              ...prev,
              ...data,
              jobId: data.jobId,
            };
          });

          if (data.status === "done") {
            clearInterval(interval);
          } else if (data.status === "error") {
            clearInterval(interval);
            if (data.error) {
              setError(data.error);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      };

      interval = setInterval(poll, 2000);
      poll();
    }
    return () => clearInterval(interval);
  }, [activeJob?.jobId, activeJob?.status]);

  const handleFileUpload = async (files: FileList | File[], overrides?: { outputFormat?: string; converterSlug?: string; options?: any }) => {
    if (!files.length) return;
    setError(null);
    
    try {
      const file = files[0];
      const fileSizeString = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(1)} KB`;

      // 1. Real Upload using FormData
      const formData = new FormData();
      formData.append("file", file);

      const uploadResp = await fetch("/api/v1/upload", { 
        method: "POST", 
        body: formData 
      });
      
      if (!uploadResp.ok) {
        const errorData = await uploadResp.json();
        throw new Error(errorData.error || "Connection error during upload.");
      }
      
      const { fileId } = await uploadResp.json();

      // Configure targets dynamically depending on tool settings
      const targetSlug = overrides?.converterSlug || "video-converter";
      const targetFormat = overrides?.outputFormat || "mp4";

      // 2. Start conversion with real fileId
      const convertResp = await fetch("/api/v1/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          converterSlug: targetSlug,
          outputFormat: targetFormat,
          options: overrides?.options || { quality: "high" }
        })
      });
      
      if (!convertResp.ok) {
        const errorData = await convertResp.json();
        throw new Error(errorData.error || "Conversion could not be started.");
      }
      
      const { jobId } = await convertResp.json();

      // 3. Initiate job tracking
      setActiveJob({
        jobId,
        status: "processing",
        progress: 0,
        eta: "Initializing...",
        inputName: file.name,
        inputSize: fileSizeString,
        outputUrl: null,
        converterSlug: targetSlug,
        outputFormat: targetFormat,
        error: null,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  // --- Dynamic Route Rendering ---
  const renderRoute = () => {
    if (path.startsWith("/convert/")) {
      const parts = path.split("/");
      const category = parts[parts.length - 1] as any;
      
      return (
        <ConvertPage 
          category={category} 
          onFileUpload={(files, customOpts) => {
            // If input and output format are the same, it's a compressor tool
            const isCompressor = customOpts?.outputFormat && customOpts?.inputFormat && customOpts.inputFormat === customOpts.outputFormat;
            const currentSlug = isCompressor ? "compressor-converter" : `${category}-converter`;
            handleFileUpload(files, {
              converterSlug: currentSlug,
              outputFormat: customOpts?.outputFormat,
              options: customOpts?.options
            });
          }}
          isUploading={!!(activeJob && activeJob.status === "processing")}
          convertersData={convertersData}
        />
      );
    }

    switch (path) {
      case "/pricing":
        return <PricingPage />;
      case "/api":
        return <ApiPage />;
      case "/dashboard":
        return <DashboardPage />;
      case "/login":
        return <AuthPage type="login" />;
      case "/signup":
        return <AuthPage type="signup" />;
      case "/terms":
        return <LegalPage type="terms" />;
      case "/privacy":
        return <LegalPage type="privacy" />;
      case "/security":
        return <LegalPage type="security" />;
      case "/blog":
        return <BlogPage />;
      case "/":
      case "":
        return (
          <>
            <Hero onUpload={() => navigate("/convert/image")} />
            <div className="max-w-7xl mx-auto px-4 py-20 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-teal/5 text-primary-teal rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3 text-secondary-slate">Convert Any File</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">OmniConvert supports more than 1500 file conversions. You can convert videos, images, audio files, or e-books.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-teal/5 text-primary-teal rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3 text-secondary-slate">Works Anywhere</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">OmniConvert is an online file converter. So it works on Windows, Mac, Linux, or any mobile device.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-teal/5 text-primary-teal rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3 text-secondary-slate">Privacy Guaranteed</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">We use 256-bit SSL encryption when transferring files and automatically delete them after a few hours.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-slate">Standard Converters</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <ConverterCard icon={FileVideo} title="Video Converter" formats="MP4, MOV, MKV, AVI, WEBM..." to="/convert/video" />
                <ConverterCard icon={FileAudio} title="Audio Converter" formats="MP3, WAV, FLAC, M4A, AAC..." to="/convert/audio" />
                <ConverterCard icon={FileImage} title="Image Converter" formats="JPG, PNG, WEBP, TIFF, HEIC..." to="/convert/image" />
                <ConverterCard icon={FileText} title="Document Converter" formats="PDF, DOCX, TXT, ODT..." to="/convert/document" />
                <ConverterCard icon={FileArchive} title="Archive Converter" formats="ZIP, 7Z, TAR, RAR..." to="/convert/archive" />
                <ConverterCard icon={Globe} title="Unit Converter" formats="Length, Weight, Temperature..." to="/convert/unit" />
              </div>

              <div className="mt-32 py-20 bg-primary-teal rounded-[2rem] text-white px-8 md:px-16 overflow-hidden relative">
                <div className="max-w-2xl relative z-10">
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Your Data, Our Priority</h2>
                  <p className="text-lg mb-8 leading-relaxed text-white/80">At OmniConvert, we go beyond just converting files—we protect them. Our robust security framework ensures that your data is always safe.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">SSL/TLS Encryption</h4>
                        <p className="text-white/60 text-sm">256-bit encrypted transfers for all files.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Secured Data Centers</h4>
                        <p className="text-white/60 text-sm">State-of-the-art infrastructure security.</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/security" className="mt-12 text-sm font-bold underline hover:text-white/80 inline-block cursor-pointer">Learn more about our commitment to security</Link>
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              </div>

              <div className="mt-20 text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="text-2xl font-display font-bold mb-4 text-secondary-slate">Want to convert large files without a queue or Ads?</h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                  <Link to="/pricing" className="btn-primary flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 active:scale-95 transition-all">Upgrade Now</Link>
                  <Link to="/signup" className="btn-secondary flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90 active:scale-95 transition-all">Sign Up</Link>
                </div>
              </div>

              <FAQ />
            </div>
          </>
        );
      default:
        // Beautiful 404 handler returning user to home
        return (
          <div className="max-w-md mx-auto py-32 px-4 text-center space-y-6 font-sans">
            <div className="text-6xl font-display font-bold text-primary-teal animate-bounce">404</div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-secondary-slate">Page Not Found</h2>
              <p className="text-xs text-gray-500">The path you requested does not exist or has been relocated.</p>
            </div>
            <Link to="/" className="btn-primary inline-block py-2.5 px-6 text-sm cursor-pointer shadow-sm">
              Return Home
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Navbar health={healthStatus} />
      
      <main className="flex-grow">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 mt-4"
            >
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-100 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm font-medium flex-grow">{error}</div>
                <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-black/5 rounded group cursor-pointer">
                  <X className="w-4 h-4 text-amber-900/50 group-hover:text-amber-900" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {renderRoute()}
      </main>

      <Footer />

      <AnimatePresence>
        {activeJob && (
          <JobProgressCard job={activeJob} onCancel={() => setActiveJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <MainApp />
    </RouterProvider>
  );
}
