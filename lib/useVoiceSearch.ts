"use client";

import { useState, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VoiceSearchResult {
  blood_group: string;
  city: string;
  urgency: "high" | "medium" | "normal";
}

export interface UseVoiceSearchReturn {
  listening: boolean;
  transcript: string;       // live (interim) transcript while speaking
  finalTranscript: string;  // confirmed transcript after speech ends
  aiStatus: "idle" | "processing" | "done" | "error" | "no-match";
  detectedLang: "hi" | "en";
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
}

// ─── Local AI: Blood Group Extraction ────────────────────────────────────────
//
// Handles spoken variants in English AND Hindi/Hinglish:
//   "B plus" → B+   |  "O negative" → O-   |  "AB positive" → AB+
//   "bee positive" → B+  |  "O negativ" → O-
//   Hindi: "bee positiv" / "o negativ" / "aye positiv"
//
const BLOOD_GROUP_PATTERNS: Array<{ pattern: RegExp; value: string }> = [
  // AB must come before A and B to avoid partial match
  { pattern: /\bAB\s*\+|\bAB\s*(positive|positiv|plus|plas)\b/i,  value: "AB+" },
  { pattern: /\bAB\s*-|\bAB\s*(negative|negativ|minus)\b/i,        value: "AB-" },
  // A group — "aye" is how Hindi speakers say "A"
  { pattern: /\b(A|aye)\s*\+|\b(A|aye)\s*(positive|positiv|plus|plas)\b/i,  value: "A+" },
  { pattern: /\b(A|aye)\s*-|\b(A|aye)\s*(negative|negativ|minus)\b/i,        value: "A-" },
  // B group — "bee" is how Hindi speakers say "B"
  { pattern: /\b(B|bee)\s*\+|\b(B|bee)\s*(positive|positiv|plus|plas)\b/i,  value: "B+" },
  { pattern: /\b(B|bee)\s*-|\b(B|bee)\s*(negative|negativ|minus)\b/i,        value: "B-" },
  // O group — "oh" is how Hindi speakers say "O"
  { pattern: /\b(O|oh)\s*\+|\b(O|oh)\s*(positive|positiv|plus|plas)\b/i,    value: "O+" },
  { pattern: /\b(O|oh)\s*-|\b(O|oh)\s*(negative|negativ|minus)\b/i,          value: "O-" },
];

// ─── Local AI: Urgency Extraction ─────────────────────────────────────────────
const URGENCY_HIGH   = /\burgent\b|\bemergency\b|\bjaldi\b|\bturant\b|\babhi\b|\bright now\b/i;
const URGENCY_MEDIUM = /\bkal\b|\btomorrow\b|\bsoon\b|\bthoda\b/i;

// ─── Local AI: City Extraction ────────────────────────────────────────────────
//
// Maps spoken/typed city names → canonical display name.
// Add more entries as needed.
//
const CITY_MAP: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /\bdelhi\b|\bnew delhi\b/i,       value: "Delhi"     },
  { pattern: /\bmumbai\b|\bbombay\b/i,          value: "Mumbai"    },
  { pattern: /\bnoida\b/i,                      value: "Noida"     },
  { pattern: /\bgurgaon\b|\bgurugram\b/i,       value: "Gurgaon"   },
  { pattern: /\bghaziabad\b/i,                  value: "Ghaziabad" },
  { pattern: /\bbangalore\b|\bbengaluru\b/i,    value: "Bangalore" },
  { pattern: /\bpune\b/i,                       value: "Pune"      },
  { pattern: /\bhyderabad\b/i,                  value: "Hyderabad" },
  { pattern: /\bchennai\b|\bmadras\b/i,         value: "Chennai"   },
  { pattern: /\bkolkata\b|\bcalcutta\b/i,       value: "Kolkata"   },
  { pattern: /\bahmedabad\b/i,                  value: "Ahmedabad" },
  { pattern: /\bjaipur\b/i,                     value: "Jaipur"    },
  { pattern: /\blucknow\b/i,                    value: "Lucknow"   },
  { pattern: /\bfaridabad\b/i,                  value: "Faridabad" },
  { pattern: /\bkanpur\b/i,                     value: "Kanpur"    },
];

// ─── Language Detection ───────────────────────────────────────────────────────
//
// Detects if the spoken text is primarily Hindi/Hinglish.
// Strategy: check for Devanagari script OR common Hindi words.
//
const HINDI_WORDS = /\b(mujhe|chahiye|hai|hain|mein|ka|ki|ke|aur|ya|nahi|karo|karna|dhundo|khoon|rakt|zaroorat|urgent|jaldi|abhi|kal|aaj|bata|dena|please|bhai|yahan|wahan|kahan|koi|kuch|sab|bahut|thoda|turant|emergency)\b/i;
const DEVANAGARI  = /[\u0900-\u097F]/;

function detectLang(text: string): "hi" | "en" {
  if (DEVANAGARI.test(text) || HINDI_WORDS.test(text)) return "hi";
  return "en";
}

// ─── Bilingual response templates ─────────────────────────────────────────────
function buildConfirmation(
  lang: "hi" | "en",
  blood_group: string,
  city: string,
  urgency: VoiceSearchResult["urgency"]
): string {
  if (lang === "hi") {
    const bg = blood_group || "koi bhi blood group";
    const ct = city        || "aapke area";
    const urgencyNote =
      urgency === "high"   ? " Yeh request urgent hai." :
      urgency === "medium" ? " Kal ke liye search kar raha hoon." : "";
    return `${bg} blood group ke donors ${ct} mein dhundh raha hoon.${urgencyNote}`;
  }
  const bg = blood_group || "any blood group";
  const ct = city        || "your area";
  const urgencyNote =
    urgency === "high"   ? " This is marked as urgent." :
    urgency === "medium" ? " Searching for tomorrow."   : "";
  return `Searching donors for ${bg} in ${ct}.${urgencyNote}`;
}

function buildNoMatchMessage(lang: "hi" | "en"): string {
  return lang === "hi"
    ? "Samajh nahi aaya. Kripya blood group aur city bolein, jaise B positive Delhi mein."
    : "Could not understand. Please say your blood group and city, for example B positive in Delhi.";
}

function buildErrorMessage(lang: "hi" | "en"): string {
  return lang === "hi"
    ? "Microphone mein kuch problem hai. Dobara try karein."
    : "Microphone error. Please check permissions and try again.";
}

// ─── Core extraction function (pure, no API) ──────────────────────────────────
export function extractDonorInfo(text: string): VoiceSearchResult {
  let blood_group = "";
  let city = "";
  let urgency: VoiceSearchResult["urgency"] = "normal";

  // Blood group
  for (const { pattern, value } of BLOOD_GROUP_PATTERNS) {
    if (pattern.test(text)) {
      blood_group = value;
      break; // first match wins (AB checked before A/B)
    }
  }

  // City
  for (const { pattern, value } of CITY_MAP) {
    if (pattern.test(text)) {
      city = value;
      break;
    }
  }

  // Urgency
  if (URGENCY_HIGH.test(text))        urgency = "high";
  else if (URGENCY_MEDIUM.test(text)) urgency = "medium";

  return { blood_group, city, urgency };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceSearch(
  onResult: (result: VoiceSearchResult) => void
): UseVoiceSearchReturn {
  const [listening, setListening]               = useState(false);
  const [transcript, setTranscript]             = useState("");
  const [finalTranscript, setFinalTranscript]   = useState("");
  const [aiStatus, setAiStatus]                 = useState<UseVoiceSearchReturn["aiStatus"]>("idle");
  const [detectedLang, setDetectedLang]         = useState<"hi" | "en">("en");
  const recognitionRef                          = useRef<any>(null);

  // ── SpeechSynthesis — lang-aware ─────────────────────────────────────────
  const speak = useCallback((text: string, lang: "hi" | "en" = "en") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate   = 0.95;
    utterance.pitch  = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Local extraction ──────────────────────────────────────────────────────
  const extractLocally = useCallback(
    (text: string) => {
      setAiStatus("processing");

      setTimeout(() => {
        const lang   = detectLang(text);
        setDetectedLang(lang);

        const result       = extractDonorInfo(text);
        const nothingFound = !result.blood_group && !result.city;

        if (nothingFound) {
          setAiStatus("no-match");
          speak(buildNoMatchMessage(lang), lang);
          return;
        }

        setAiStatus("done");
        onResult(result);
        speak(buildConfirmation(lang, result.blood_group, result.city, result.urgency), lang);
      }, 80);
    },
    [onResult, speak]
  );

  // ── Start listening ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    // Reset state
    setTranscript("");
    setFinalTranscript("");
    setAiStatus("idle");

    const recognition          = new SpeechRecognition();
    recognition.lang           = "en-IN";   // handles Hindi/Hinglish too
    recognition.interimResults = true;      // live transcript while speaking
    recognition.maxAlternatives = 1;
    recognition.continuous     = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      let final   = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) final   += chunk;
        else                          interim += chunk;
      }

      // Show live text while speaking
      if (interim) setTranscript(interim);

      // When browser confirms a final result, extract from it
      if (final) {
        setTranscript(final);
        setFinalTranscript(final);
        extractLocally(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      if (event.error === "no-speech") {
        setAiStatus("no-match");
        speak(buildNoMatchMessage(detectedLang), detectedLang);
      } else {
        setAiStatus("error");
        speak(buildErrorMessage(detectedLang), detectedLang);
      }
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [extractLocally]);

  // ── Stop listening ────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return {
    listening,
    transcript,
    finalTranscript,
    aiStatus,
    detectedLang,
    startListening,
    stopListening,
    speak,
  };
}
