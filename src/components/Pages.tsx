import React, { useState } from "react";
import { 
  Check, 
  Terminal, 
  Key, 
  Clock, 
  FileText, 
  Search, 
  HelpCircle, 
  Lock, 
  User, 
  Shield, 
  Database,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
  FileCheck,
  Zap,
  Info,
  Cpu,
  ChevronRight,
  Globe,
  Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdvancedSettings from "./AdvancedSettings.tsx";
import CloudUploadButtons from "./CloudUploadButtons.tsx";

// ==========================================
// PRICING PAGE
// ==========================================
export function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Free Basic",
      price: "0",
      desc: "For occasional single file conversions",
      features: [
        "100 MB max file size limit",
        "5 conversions per day",
        "Standard queuing speeds",
        "Local browser conversions only",
        "24-hour file persistence"
      ],
      cta: "Current Plan",
      popular: false,
      active: true
    },
    {
      name: "Pro Premium",
      price: isAnnual ? "9" : "15",
      desc: "Perfect for creators, engineers, and power users",
      features: [
        "10 GB max file size limit",
        "Unlimited daily conversions",
        "Instant priority processing queue",
        "Parallel batch uploading (up to 20 files)",
        "Advanced parameters & codecs configuration",
        "Cloud integrations (Drive, Dropbox, OneDrive)",
        "API access tokens (1,000 requests/mo)"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      active: false
    },
    {
      name: "Enterprise",
      price: isAnnual ? "49" : "69",
      desc: "High volume system-level integrations",
      features: [
        "100 GB max file size limit",
        "Fully dedicated isolated processing node",
        "Unlimited API access & programmatic triggers",
        "Real-time custom webhooks",
        "99.9% uptime SLA guarantee",
        "Dedicated corporate manager support"
      ],
      cta: "Contact Sales",
      popular: false,
      active: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-secondary-slate">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4 text-primary-teal">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Get access to faster conversion processing, larger file limits, and developer integrations.</p>
        
        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8 bg-gray-50 border border-gray-100 p-1.5 rounded-full inline-flex mx-auto">
          <button 
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${!isAnnual ? "bg-primary-teal text-white shadow-xs" : "text-gray-500"}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isAnnual ? "bg-primary-teal text-white shadow-xs" : "text-gray-500"}`}
          >
            Annually <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Save 40%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
        {plans.map((plan, i) => (
          <div 
            key={i}
            className={`bg-white rounded-3xl border p-8 flex flex-col justify-between relative hover:shadow-xl transition-all duration-300 ${
              plan.popular ? "border-2 border-primary-teal ring-4 ring-primary-teal/5 shadow-md" : "border-gray-150"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-teal text-white text-[10px] font-bold py-1 px-3.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Zap className="w-3 h-3 fill-white" /> Most Popular
              </span>
            )}
            
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl">{plan.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-gray-400 text-2xl font-semibold">$</span>
                <span className="text-4xl md:text-5xl font-display font-bold">{plan.price}</span>
                <span className="text-gray-400 text-xs font-semibold">/ month</span>
              </div>

              <hr className="border-gray-100" />

              <ul className="space-y-3.5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-600">
                    <Check className="w-4 h-4 text-primary-teal flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => plan.name !== "Free Basic" && setSelectedPlan(plan.name)}
              className={`w-full mt-8 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 cursor-pointer ${
                plan.popular 
                  ? "bg-primary-teal text-white hover:opacity-90 shadow-sm" 
                  : plan.active 
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                    : "border-2 border-primary-teal text-primary-teal hover:bg-primary-teal/5"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* PLAN MODAL */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 max-w-md w-full text-center relative shadow-2xl"
            >
              <div className="w-14 h-14 bg-primary-teal/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary-teal" />
              </div>
              <h3 className="font-display font-bold text-2xl text-secondary-slate">Upgrade to {selectedPlan}</h3>
              <p className="text-sm text-gray-400 mt-2">Experience premium instant visual conversions.</p>
              
              <div className="my-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-left space-y-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Upgrade Subscription Plan:</span>
                  <span className="font-bold text-secondary-slate">{selectedPlan}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Billing Schedule:</span>
                  <span className="font-bold text-secondary-slate">{isAnnual ? "Annual Billing (Save 40%)" : "Monthly Billing"}</span>
                </div>
                <hr className="border-gray-200 border-dashed" />
                <div className="flex justify-between text-sm font-bold text-secondary-slate">
                  <span>Total Due Today:</span>
                  <span className="text-primary-teal">${selectedPlan.includes("Pro") ? (isAnnual ? "108.00" : "15.00") : "Custom"}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-[11px] text-amber-800 leading-snug flex gap-2 text-left mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>This checkout workflow is a visual mockup. Pressing continue activates the virtual Pro subscription locally for testing!</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-secondary-slate rounded-xl py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel Checkout
                </button>
                <button 
                  onClick={() => {
                    setSelectedPlan(null);
                    alert("Congratulations! Premium mode active locally.");
                  }}
                  className="bg-primary-teal text-white hover:opacity-90 rounded-xl py-3 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Start Pro Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// DEVELOPER / API PAGE
// ==========================================
export function ApiPage() {
  const [activeLang, setActiveLang] = useState<"curl" | "node" | "python">("curl");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMockKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setApiKey("omni_live_" + Array.from({ length: 28 }, () => Math.random().toString(36)[2]).join(""));
      setIsGenerating(false);
    }, 800);
  };

  const codeSnippets = {
    curl: `curl -X POST "https://omniconvert.com/api/v1/upload" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/document.pdf"

# Response:
# { "fileId": "65fc239a0ef3", "url": "https://..." }`,
    node: `const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const form = new FormData();
form.append('file', fs.createReadStream('/path/to/image.png'));

axios.post('https://omniconvert.com/api/v1/upload', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer YOUR_API_KEY'
  }
}).then(res => console.log(res.data));`,
    python: `import requests

files = {'file': open('/path/to/video.mp4', 'rb')}
headers = {'Authorization': 'Bearer YOUR_API_KEY'}

response = requests.post(
    'https://omniconvert.com/api/v1/upload', 
    files=files, 
    headers=headers
)
print(response.json())`
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-secondary-slate">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary-teal/5 text-primary-teal px-3 py-1 rounded-full text-xs font-bold">
            <Terminal className="w-3.5 h-3.5" /> Programmatic Conversions Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-secondary-slate">Developer Hub & API</h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Integrate OmniConvert’s rapid transformation pipelines directly into your applications. Programmatically upload files, trigger background worker threads, and download processed media dynamically.
          </p>

          <div className="p-5 border border-gray-150 rounded-2xl bg-white shadow-2xs space-y-4">
            <h4 className="font-display font-bold text-sm flex items-center gap-2 text-secondary-slate">
              <Key className="w-4 h-4 text-amber-500" /> Developer Access Tokens
            </h4>
            <p className="text-xs text-gray-400">Generate a secure test key to authorize calls to our endpoints.</p>
            
            {apiKey ? (
              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  readOnly 
                  value={apiKey} 
                  className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-mono flex-grow outline-none text-gray-600 shadow-2xs"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    alert("API Key copied!");
                  }}
                  className="bg-primary-teal text-white px-3 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
                >
                  Copy
                </button>
              </div>
            ) : (
              <button 
                onClick={generateMockKey}
                disabled={isGenerating}
                className="w-full bg-primary-teal hover:opacity-90 text-white rounded-lg py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isGenerating ? "Creating credential..." : "Generate API Key"}
              </button>
            )}
          </div>
        </div>

        {/* CODE BLOCK SKELETON */}
        <div className="bg-secondary-slate text-gray-300 rounded-3xl overflow-hidden shadow-2xl border border-gray-750">
          <div className="bg-secondary-slate border-b border-gray-750 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            
            <div className="flex gap-2">
              {(["curl", "node", "python"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase transition-all cursor-pointer ${
                    activeLang === lang ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {lang === "node" ? "NodeJS" : lang}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed text-gray-200">
            {codeSnippets[activeLang]}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 border border-gray-150 rounded-2xl bg-white hover:shadow-md transition-shadow">
          <Shield className="w-8 h-8 text-primary-teal mb-4" />
          <h4 className="font-bold text-sm mb-2 text-secondary-slate">Token Authentication</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Secure each payload with HTTP Bearer tokens over standard SSL schemas to ensure complete validation.</p>
        </div>
        <div className="p-6 border border-gray-150 rounded-2xl bg-white hover:shadow-md transition-shadow">
          <Database className="w-8 h-8 text-primary-teal mb-4" />
          <h4 className="font-bold text-sm mb-2 text-secondary-slate">R2 Presigned URLs</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Direct upload capabilities leveraging Cloudflare R2 bucket endpoints for massive speed boosts.</p>
        </div>
        <div className="p-6 border border-gray-150 rounded-2xl bg-white hover:shadow-md transition-shadow">
          <Cpu className="w-8 h-8 text-primary-teal mb-4" />
          <h4 className="font-bold text-sm mb-2 text-secondary-slate">Isolated Sandbox Workers</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Each conversion operates within its own CPU-throttled Docker sandbox to assure isolated performance safety.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// USER DASHBOARD & HISTORY
// ==========================================
export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"history" | "keys" | "analytics">("history");

  // Mock conversion history
  const history = [
    { id: "10a82b", file: "presentation.pptx", format: "PDF", size: "12.4 MB", date: "2026-05-18", status: "completed" },
    { id: "98fc2a", file: "hero_banner.png", format: "WEBP", size: "4.8 MB", date: "2026-05-17", status: "completed" },
    { id: "87ea3d", file: "podcast_ep3.wav", format: "MP3", size: "78.2 MB", date: "2026-05-15", status: "completed" },
    { id: "76bd1f", file: "vacation_clip.mov", format: "MP4", size: "112.5 MB", date: "2026-05-12", status: "failed" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-secondary-slate">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-secondary-slate">User Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your active conversions, tokens, and storage metrics.</p>
        </div>
        
        {/* Metric widgets */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-center min-w-[100px] shadow-2xs">
            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">Conversions</span>
            <span className="text-lg font-display font-bold text-primary-teal">142</span>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-center min-w-[100px] shadow-2xs">
            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">Storage Used</span>
            <span className="text-lg font-display font-bold text-primary-teal">208 MB</span>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-center min-w-[100px] shadow-2xs">
            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">Subscription</span>
            <span className="text-lg font-display font-bold text-amber-600">Pro</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-gray-100 mb-8 overflow-x-auto pb-px">
        {[
          { id: "history", name: "Conversion History", icon: Clock },
          { id: "keys", name: "API Keys", icon: Key },
          { id: "analytics", name: "Analytics & Usage", icon: TrendingUp }
        ].map((tab) => {
          const IconC = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs md:text-sm whitespace-nowrap cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? "border-primary-teal text-primary-teal" 
                  : "border-transparent text-gray-400 hover:text-secondary-slate"
              }`}
            >
              <IconC className="w-4 h-4" /> {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "history" && (
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 text-xs">
                  <th className="p-4 uppercase tracking-wider">File Name</th>
                  <th className="p-4 uppercase tracking-wider">Target Format</th>
                  <th className="p-4 uppercase tracking-wider">Size</th>
                  <th className="p-4 uppercase tracking-wider">Processed Date</th>
                  <th className="p-4 uppercase tracking-wider">Status</th>
                  <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-4 font-semibold text-secondary-slate flex items-center gap-2 min-w-[200px]">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="truncate w-40">{item.file}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-xs"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">{item.format}</span></td>
                    <td className="p-4 text-gray-500 text-xs">{item.size}</td>
                    <td className="p-4 text-gray-500 text-xs">{item.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === "completed" 
                          ? "bg-green-50 text-green-700 border border-green-100" 
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === "completed" ? "bg-green-500" : "bg-red-500"}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {item.status === "completed" ? (
                        <button className="text-primary-teal hover:underline text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      ) : (
                        <button className="text-gray-400 cursor-not-allowed text-xs font-bold inline-flex items-center gap-1" disabled>
                          Unavailable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "keys" && (
        <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-2xl shadow-2xs space-y-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <h3 className="font-display font-bold text-lg">Active Authorization Credentials</h3>
              <p className="text-xs text-gray-400">Tokens utilized to deploy and execute media processing assets.</p>
            </div>
            <button className="bg-primary-teal text-white hover:opacity-90 py-2.5 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm">
              Create New Key
            </button>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
            <div className="p-4 bg-gray-50/50 flex justify-between items-center gap-4 text-xs font-bold text-gray-400">
              <span>Token Identifier</span>
              <span>Expires</span>
            </div>
            <div className="p-4 flex justify-between items-center gap-4 text-sm">
              <span className="font-mono text-gray-600">omni_live_h93f7x8c8230...</span>
              <span className="text-gray-500 text-xs">Never</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-2xl shadow-2xs space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg">API Request Usage Rates</h3>
            <p className="text-xs text-gray-400">programmatic server metrics monitoring requests per minute limits.</p>
          </div>

          {/* Simple Visual Graph Skeleton */}
          <div className="h-64 bg-gray-50 rounded-2xl flex items-end p-6 gap-3 md:gap-6 border border-gray-100 relative">
            <div className="absolute top-4 left-4 text-xs text-gray-400 font-bold uppercase">Requests (Last 7 Days)</div>
            
            <div className="w-full bg-primary-teal/20 hover:bg-primary-teal transition-all rounded-t-lg h-[20%] text-center" title="12 requests"></div>
            <div className="w-full bg-primary-teal/20 hover:bg-primary-teal transition-all rounded-t-lg h-[45%] text-center" title="42 requests"></div>
            <div className="w-full bg-primary-teal/20 hover:bg-primary-teal transition-all rounded-t-lg h-[30%] text-center" title="24 requests"></div>
            <div className="w-full bg-primary-teal/20 hover:bg-primary-teal transition-all rounded-t-lg h-[75%] text-center" title="89 requests"></div>
            <div className="w-full bg-primary-teal/20 hover:bg-primary-teal transition-all rounded-t-lg h-[60%] text-center" title="68 requests"></div>
            <div className="w-full bg-primary-teal/20 hover:bg-primary-teal transition-all rounded-t-lg h-[90%] text-center" title="112 requests"></div>
            <div className="w-full bg-primary-teal hover:opacity-90 transition-all rounded-t-lg h-[80%] text-center" title="104 requests"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// LEGAL PAGES (Terms, Privacy, Security)
// ==========================================
export function LegalPage({ type }: { type: "terms" | "privacy" | "security" }) {
  const content = {
    terms: {
      title: "Terms of Service",
      desc: "Last updated: May 20, 2026",
      sections: [
        {
          heading: "1. Acceptance of Terms",
          body: "By accessing and utilizing the OmniConvert website and file conversion pipelines, you accept and agree to comply with and be bound by the conditions described below. If you reject these specifications, you are advised to terminate access immediately."
        },
        {
          heading: "2. Services and Operations",
          body: "OmniConvert facilitates client-side programming interfaces to upload, queue, and convert media items. Free-tier accounts are restricted to limited daily allocations. Premium tiers require continuous recurring billing validation."
        },
        {
          heading: "3. User Intellectual Property",
          body: "You maintain complete intellectual property privileges over all file buffers uploaded to our isolated environments. OmniConvert makes zero ownership claims on user properties and deletes all processing outputs within 2 hours of completion."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      desc: "Last updated: May 20, 2026",
      sections: [
        {
          heading: "1. Information We Collect",
          body: "We collect metadata detailing file formats, sizes, and operational throughput strictly to optimize load balancing protocols. We store zero raw file buffer components on permanent physical databases unless required by operations."
        },
        {
          heading: "2. Data Portability and Erasure",
          body: "All uploaded and processed file elements are permanently erased from our container architectures automatically within 2 hours. You can programmatically wipe your history dynamically from the dashboard viewport."
        },
        {
          heading: "3. Cookie Structures",
          body: "We implement isolated session-state token mechanisms strictly to keep users securely logged in and store customized conversion options locally."
        }
      ]
    },
    security: {
      title: "Security Operations",
      desc: "Infrastructure compliance and protection protocols",
      sections: [
        {
          heading: "1. Network-Level Encryption",
          body: "All connection channels routing assets through OmniConvert utilize strict Transport Layer Security (TLS 1.3) protocols. Upload streams undergo 256-bit AES cryptographic wrapping to prevent intercept risks."
        },
        {
          heading: "2. Container Sandbox Security",
          body: "Conversions undergo translation inside restricted micro-containers with limited local file access and zero internal internet routes. Systems isolate process contexts to safeguard workspace bounds."
        },
        {
          heading: "3. Compliance Audits",
          body: "OmniConvert regularly evaluates storage patterns and undergoes external vulnerability scanning protocols to maintain strict data protection guidelines."
        }
      ]
    }
  };

  const selected = content[type];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-secondary-slate">
      <div className="border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-teal">{selected.title}</h1>
        <p className="text-sm text-gray-400 mt-2">{selected.desc}</p>
      </div>

      <div className="space-y-8 leading-relaxed text-gray-600 text-sm md:text-base">
        {selected.sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="font-display font-bold text-lg text-secondary-slate">{section.heading}</h3>
            <p className="bg-gray-50/50 p-4 border border-gray-100 rounded-2xl">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// BLOG / HELP CENTER
// ==========================================
export function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const articles = [
    { title: "Optimizing Web Images: PNG vs JPG vs WEBP", cat: "Tips", excerpt: "Learn how converting assets to modern WEBP files significantly boosts web load times.", date: "May 18, 2026" },
    { title: "Programmatic Batch Conversion using Curl and API Tokens", cat: "Developer", excerpt: "Automate large-scale document pipelines with short shell scripts.", date: "May 15, 2026" },
    { title: "Ensuring Cloud Security with Sandbox Processing", cat: "Security", excerpt: "A breakdown of how containerized Docker setups keep your uploads fully secure.", date: "May 12, 2026" },
    { title: "Converting Vector Files without Artifact Loss", cat: "Tutorials", excerpt: "A guide to clean SVG rendering under modern node pipelines.", date: "May 08, 2026" }
  ];

  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-secondary-slate">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-teal">Blog & Help Desk</h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto">Explore optimization guides, developer setups, and system status explanations.</p>
        
        <div className="max-w-md mx-auto relative mt-6">
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-full py-3 pl-12 pr-6 outline-none focus:border-primary-teal shadow-2xs"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((art, idx) => (
          <div key={idx} className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <span className="bg-primary-teal/5 text-primary-teal text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">{art.cat}</span>
              <h3 className="font-display font-bold text-lg md:text-xl text-secondary-slate">{art.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{art.excerpt}</p>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-100 pt-5 mt-6">
              <span className="text-gray-400 text-xs">{art.date}</span>
              <button className="text-primary-teal hover:underline text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 space-y-4">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-500">No Articles Found</h4>
            <p className="text-xs text-gray-400">Try modifying your query variables.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// LOGIN & SIGNUP PAGES
// ==========================================
export function AuthPage({ type }: { type: "login" | "signup" }) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-secondary-slate">
      <div className="bg-white/80 border border-gray-150 shadow-2xl p-8 rounded-3xl backdrop-blur-md relative overflow-hidden space-y-6">
        
        {/* Glow circles */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary-teal/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="text-center space-y-2 relative">
          <div className="w-12 h-12 bg-primary-teal text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold text-secondary-slate">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-gray-400">
            {type === "login" ? "Access your custom conversion logs" : "Unlock larger file limits & parallel batch processing"}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert("Virtual credentials active locally for testing!"); }} className="space-y-4 relative">
          {type === "signup" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  placeholder="developer_pro" 
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary-teal shadow-2xs"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required 
                placeholder="you@example.com" 
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary-teal shadow-2xs"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary-teal shadow-2xs"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full btn-primary py-3 rounded-xl font-bold text-sm tracking-wide shadow-md active:scale-95 cursor-pointer"
          >
            {type === "login" ? "Sign In" : "Register Free"}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-50 relative">
          {type === "login" ? (
            <span>Don't have an account? <a href="/signup" className="text-primary-teal font-bold hover:underline">Sign up now</a></span>
          ) : (
            <span>Already have an account? <a href="/login" className="text-primary-teal font-bold hover:underline">Log in instead</a></span>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DYNAMIC CONVERTER PAGE WITH SKELETON TOOLS
// ==========================================
interface ConvertPageProps {
  category: "image" | "video" | "audio" | "document" | "pdf" | "archive" | "ebook" | "unit" | "compressor";
  onFileUpload: (files: FileList | File[], options: any) => void;
  isUploading: boolean;
  convertersData: any;
}

export function ConvertPage({ category, onFileUpload, isUploading, convertersData }: ConvertPageProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [comingSoonModal, setComingSoonModal] = useState<string | null>(null);
  const [customOptions, setCustomOptions] = useState<any>({});

  // Tool categories mapping
  const toolList = {
    image: [
      { name: "JPG to PNG", inF: "jpg", outF: "png", works: true },
      { name: "PNG to JPG", inF: "png", outF: "jpg", works: true },
      { name: "JPG to WEBP", inF: "jpg", outF: "webp", works: true },
      { name: "PNG to WEBP", inF: "png", outF: "webp", works: true },
      { name: "WEBP to JPG", inF: "webp", outF: "jpg", works: true },
      { name: "WEBP to PNG", inF: "webp", outF: "png", works: true },
      { name: "JPG to AVIF", inF: "jpg", outF: "avif", works: true },
      { name: "PNG to AVIF", inF: "png", outF: "avif", works: true },
      { name: "WEBP to AVIF", inF: "webp", outF: "avif", works: true },
      { name: "AVIF to JPG", inF: "avif", outF: "jpg", works: true },
      { name: "AVIF to PNG", inF: "avif", outF: "png", works: true },
      { name: "AVIF to WEBP", inF: "avif", outF: "webp", works: true },
      { name: "SVG to PNG", inF: "svg", outF: "png", works: true },
      { name: "SVG to JPG", inF: "svg", outF: "jpg", works: true },
      { name: "SVG to WEBP", inF: "svg", outF: "webp", works: true },
      { name: "HEIC to JPG", inF: "heic", outF: "jpg", works: true },
      { name: "JPG Compressor", inF: "jpg", outF: "jpg", works: true },
      { name: "PNG Compressor", inF: "png", outF: "png", works: true },
      { name: "WEBP Compressor", inF: "webp", outF: "webp", works: true },
      { name: "AVIF Compressor", inF: "avif", outF: "avif", works: true },
      { name: "Image Resizer", inF: "jpg", outF: "jpg", works: true },
      { name: "Image Cropper", inF: "jpg", outF: "jpg", works: true },
      { name: "GIF Compressor", inF: "gif", outF: "gif", works: true },
      { name: "GIF to MP4", inF: "gif", outF: "mp4", works: true }
    ],
    video: [
      { name: "MP4 Converter", inF: "mov", outF: "mp4", works: false },
      { name: "MOV to MP4", inF: "mov", outF: "mp4", works: true },
      { name: "MKV to MP4", inF: "mkv", outF: "mp4", works: true },
      { name: "WEBM to MP4", inF: "webm", outF: "mp4", works: true },
      { name: "MP4 to WEBM", inF: "mp4", outF: "webm", works: true },
      { name: "MP4 to GIF", inF: "mp4", outF: "gif", works: false },
      { name: "Video Compressor", inF: "mp4", outF: "mp4", works: false },
      { name: "Video Trimmer", inF: "mp4", outF: "mp4", works: false },
      { name: "Video Cropper", inF: "mp4", outF: "mp4", works: false },
      { name: "Video to MP3", inF: "mp4", outF: "mp3", works: true }
    ],
    audio: [
      { name: "MP3 Converter", inF: "wav", outF: "mp3", works: false },
      { name: "WAV to MP3", inF: "wav", outF: "mp3", works: true },
      { name: "MP3 to WAV", inF: "mp3", outF: "wav", works: true },
      { name: "MP4 to MP3", inF: "mp4", outF: "mp3", works: true },
      { name: "Video to MP3", inF: "mp4", outF: "mp3", works: false },
      { name: "Audio Compressor", inF: "mp3", outF: "mp3", works: false },
      { name: "Audio Trimmer", inF: "mp3", outF: "mp3", works: false }
    ],
    pdf: [
      { name: "JPG to PDF", inF: "jpg", outF: "pdf", works: true },
      { name: "PNG to PDF", inF: "png", outF: "pdf", works: true },
      { name: "PDF to JPG", inF: "pdf", outF: "jpg", works: true },
      { name: "PDF to PNG", inF: "pdf", outF: "png", works: true },
      { name: "PDF to Word", inF: "pdf", outF: "docx", works: false },
      { name: "Word to PDF", inF: "docx", outF: "pdf", works: false },
      { name: "Compress PDF", inF: "pdf", outF: "pdf", works: false },
      { name: "Merge PDF", inF: "pdf", outF: "pdf", works: false },
      { name: "Split PDF", inF: "pdf", outF: "pdf", works: false },
      { name: "PDF OCR", inF: "pdf", outF: "pdf", works: false }
    ],
    document: [
      { name: "DOCX to PDF", inF: "docx", outF: "pdf", works: false },
      { name: "TXT to PDF", inF: "txt", outF: "pdf", works: false },
      { name: "PDF to DOCX", inF: "pdf", outF: "docx", works: false },
      { name: "ODT to PDF", inF: "odt", outF: "pdf", works: false },
      { name: "PPTX to PDF", inF: "pptx", outF: "pdf", works: false },
      { name: "XLSX to PDF", inF: "xlsx", outF: "pdf", works: false }
    ],
    archive: [
      { name: "ZIP Converter", inF: "rar", outF: "zip", works: false },
      { name: "RAR to ZIP", inF: "rar", outF: "zip", works: false },
      { name: "7Z to ZIP", inF: "7z", outF: "zip", works: false },
      { name: "TAR to ZIP", inF: "tar", outF: "zip", works: false },
      { name: "Extract Archive", inF: "zip", outF: "txt", works: false }
    ],
    ebook: [
      { name: "EPUB to PDF", inF: "epub", outF: "pdf", works: false },
      { name: "MOBI to EPUB", inF: "mobi", outF: "epub", works: false },
      { name: "AZW3 to EPUB", inF: "azw3", outF: "epub", works: false },
      { name: "PDF to EPUB", inF: "pdf", outF: "epub", works: false }
    ],
    unit: [
      { name: "Length Converter", inF: "m", outF: "ft", works: false },
      { name: "Weight Converter", inF: "kg", outF: "lbs", works: false },
      { name: "Temperature Converter", inF: "c", outF: "f", works: false },
      { name: "Data Size Converter", inF: "gb", outF: "mb", works: false },
      { name: "Time Converter", inF: "hr", outF: "min", works: false },
      { name: "Speed Converter", inF: "kmh", outF: "mph", works: false },
      { name: "Area Converter", inF: "sqm", outF: "sqft", works: false },
      { name: "Volume Converter", inF: "l", outF: "gal", works: false }
    ],
    compressor: [
      { name: "JPG Compressor", inF: "jpg", outF: "jpg", works: true },
      { name: "PNG Compressor", inF: "png", outF: "png", works: true },
      { name: "WEBP Compressor", inF: "webp", outF: "webp", works: true },
      { name: "AVIF Compressor", inF: "avif", outF: "avif", works: true },
      { name: "Video Compressor", inF: "mp4", outF: "mp4", works: false },
      { name: "Audio Compressor", inF: "mp3", outF: "mp3", works: false },
      { name: "Compress PDF", inF: "pdf", outF: "pdf", works: false }
    ]
  };

  const categoryTitles = {
    image: "Image Transformation Suite",
    video: "Video Formatting Pipelines",
    audio: "Acoustic Audio Converters",
    document: "Document Layout Transformers",
    pdf: "PDF Management Core",
    archive: "Compressed Archive Toolkits",
    ebook: "eBook Layout Translators",
    unit: "System Unit Scale Calculators",
    compressor: "Compression Space Savers"
  };

  const currentTools = toolList[category] || [];

  const handleToolClick = (tool: typeof currentTools[0]) => {
    if (!tool.works) {
      setComingSoonModal(tool.name);
      return;
    }
    setSelectedTool(tool.name);
  };

  const currentToolData = currentTools.find(t => t.name === selectedTool);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 text-secondary-slate">
      <div className="mb-10 text-center">
        <span className="bg-primary-teal/5 text-primary-teal text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-primary-teal/10">
          Visual Toolkit Skeletons
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-secondary-slate mt-4">
          {categoryTitles[category] || "Converter Suite"}
        </h1>
        <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto mt-2">
          Select one of our specialized layout presets below to configure advanced codecs, compression boundaries, and launch transformations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: TOOLS GRID */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Available Presets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {currentTools.map((tool, idx) => (
              <button
                key={idx}
                onClick={() => handleToolClick(tool)}
                className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98 ${
                  selectedTool === tool.name 
                    ? "border-primary-teal bg-primary-teal/5 ring-2 ring-primary-teal/10 font-bold" 
                    : "border-gray-150 bg-white hover:border-primary-teal/50"
                }`}
              >
                <div>
                  <span className="text-xs md:text-sm font-semibold block text-secondary-slate">{tool.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wide">
                    {tool.inF} → {tool.outF}
                  </span>
                </div>

                {!tool.works ? (
                  <span className="text-[9px] bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Coming Soon</span>
                ) : (
                  <span className="text-[9px] bg-primary-teal/10 text-primary-teal px-2 py-0.5 rounded font-bold uppercase tracking-wider">Ready</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE AND ADVANCED SETTINGS */}
        <div className="lg:col-span-2 space-y-8">
          {selectedTool && currentToolData ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-150 p-6 md:p-8 rounded-3xl shadow-xs space-y-8"
            >
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <h3 className="font-display font-bold text-xl">{selectedTool} Active View</h3>
                  <p className="text-xs text-gray-400 mt-1">Configuring upload pipeline for converting <span className="font-bold text-primary-teal font-mono uppercase">{currentToolData.inF}</span> to <span className="font-bold text-primary-teal font-mono uppercase">{currentToolData.outF}</span> format.</p>
                  {currentToolData.inF === "mp4" && currentToolData.outF === "webm" && (
                    <p className="text-xs text-gray-500 mt-2">Fast WebM mode is used for quicker conversion on VPS.</p>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedTool(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold underline cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              {/* UPLOAD WORKSPACE AREA */}
              <div 
                className="border-2 border-dashed border-primary-teal/30 bg-gray-50/50 rounded-2xl p-8 md:p-12 hover:border-primary-teal transition-colors cursor-pointer group text-center"
                onClick={() => document.getElementById("tool-upload-native")?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) {
                    onFileUpload(e.dataTransfer.files, {
                      outputFormat: currentToolData.outF,
                      inputFormat: currentToolData.inF,
                      options: customOptions
                    });
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-primary-teal text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 fill-white" />
                  </div>
                  <p className="text-base font-bold text-secondary-slate">Choose {currentToolData.inF.toUpperCase()} File</p>
                  <p className="text-gray-400 text-xs mt-1">or Drop File here to start transformation</p>
                </div>
                <input 
                  id="tool-upload-native"
                  type="file"
                  className="hidden"
                  accept={`.${currentToolData.inF}`}
                  onChange={(e) => {
                    if (e.target.files) {
                      onFileUpload(e.target.files, {
                        outputFormat: currentToolData.outF,
                        inputFormat: currentToolData.inF,
                        options: customOptions
                      });
                    }
                  }}
                />
              </div>

              {/* CLOUD BUTTONS SKELETON */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide text-center mb-3">Or Import Programmatic Media</p>
                <CloudUploadButtons />
              </div>

              {/* ADVANCED SETTINGS */}
              <div className="border-t border-gray-100 pt-6">
                <AdvancedSettings category={category} onChange={setCustomOptions} />
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-50 border border-gray-150 border-dashed rounded-3xl p-12 text-center text-gray-400 space-y-4">
              <Info className="w-12 h-12 text-gray-300 mx-auto animate-pulse" />
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="font-display font-bold text-secondary-slate text-sm">Preset Target Configuration Empty</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Please pick a specialized tool preset from the left directory panel. This binds the workspace compiler to correct MIME targets and renders matching advanced option controllers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMING SOON MODAL */}
      <AnimatePresence>
        {comingSoonModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-150 p-6 md:p-8 rounded-3xl max-w-sm w-full text-center relative shadow-2xl"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-xl text-secondary-slate">{comingSoonModal}</h3>
              <p className="text-xs text-gray-400 mt-1">Preset transformation skeleton mockup</p>
              
              <p className="text-sm text-gray-500 leading-relaxed mt-4">
                The layout configuration and compilation parameters for <b>{comingSoonModal}</b> is scheduled for integration in the next iteration.
              </p>

              <div className="my-6 bg-amber-50 text-[10px] text-amber-700 font-bold uppercase tracking-wider py-1 px-3.5 rounded-full inline-block">
                Coming Soon in Phase 1
              </div>

              <button 
                onClick={() => setComingSoonModal(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-secondary-slate rounded-xl py-3 text-xs font-semibold transition-colors cursor-pointer"
              >
                Got it, close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
