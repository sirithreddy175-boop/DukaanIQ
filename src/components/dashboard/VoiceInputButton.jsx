import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

// Free, browser-built-in voice input (Web Speech API). No paid API, no key.
// Calls onTranscript(text) with the recognised speech. Gracefully degrades
// to a disabled state on unsupported browsers.
const BCP47 = { en: "en-IN", te: "te-IN", hi: "hi-IN" };

export default function VoiceInputButton({ onTranscript, lang = "en", className = "" }) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = BCP47[lang] || "en-IN";
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onTranscript?.(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* noop */
      }
    };
  }, [lang, onTranscript]);

  const toggle = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
      return;
    }
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input is not supported on this browser"
        className={`inline-flex items-center justify-center rounded-lg p-2 text-[#94A3B8] cursor-not-allowed ${className}`}
      >
        <MicOff className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? "Stop listening" : "Speak to fill this field"}
      className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
        listening
          ? "bg-[#F59E0B]/15 text-[#F59E0B] animate-pulse"
          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0B2D5B]"
      } ${className}`}
    >
      {listening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}