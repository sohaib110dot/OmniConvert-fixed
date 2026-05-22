import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "What file formats does OmniConvert support?",
      answer: "OmniConvert supports over 1,500+ file conversion combinations across Video (MP4, MKV, AVI, WEBM, MOV), Audio (MP3, WAV, FLAC, M4A), Images (JPG, PNG, WEBP, HEIC, SVG), Documents (PDF, DOCX, TXT), eBooks (EPUB, MOBI), and Archives (ZIP, RAR, 7Z)."
    },
    {
      question: "Is there a maximum file size limit for uploads?",
      answer: "For free guest users, the upload limit is 100MB per file. Authenticated free account holders get a boosted limit of 500MB, while Pro subscribers can upload files up to 10GB with zero queuing queues."
    },
    {
      question: "How secure is my data? Are my files protected?",
      answer: "Security is our highest priority. All files are transferred over secure, encrypted SSL/TLS channels (256-bit AES). Files are processed on isolated, non-persistent container instances and are permanently deleted from our servers automatically within 2 hours of processing."
    },
    {
      question: "Can I perform multiple conversions at once (Batch Conversion)?",
      answer: "Yes! OmniConvert supports batch processing. Pro users can select and queue up to 20 files simultaneously for parallel conversion. Free tiers support sequential batch conversions."
    },
    {
      question: "Do you offer API integrations for custom developer setups?",
      answer: "Absolutely. We offer a high-performance REST API supporting programmatic conversion triggers, webhooks, and presigned R2/S3 file transfers. You can check our Developer Hub page to explore our API references, libraries, and generate testing API keys."
    }
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="w-12 h-12 bg-primary-teal/5 text-primary-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6 animate-bounce" />
        </div>
        <h3 className="text-2xl md:text-3xl font-display font-bold text-secondary-slate">Frequently Asked Questions</h3>
        <p className="text-gray-500 text-sm mt-2">Everything you need to know about OmniConvert's system.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white border border-gray-150 rounded-2xl overflow-hidden transition-all duration-200 hover:border-primary-teal hover:shadow-xs cursor-pointer"
              onClick={() => toggle(index)}
            >
              <button className="w-full flex items-center justify-between p-5 text-left font-semibold text-secondary-slate text-sm md:text-base outline-none cursor-pointer">
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    isOpen ? "transform rotate-180 text-primary-teal" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
