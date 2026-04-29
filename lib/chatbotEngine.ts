// ─── Chatbot NLP Engine ───────────────────────────────────────────────────────
// Pure client-side, no API calls.
// Uses compromise for basic NLP + keyword/pattern matching for Hindi/Hinglish.

import nlp from "compromise";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Intent =
  | "request_blood"
  | "find_donor"
  | "donate_info"
  | "eligibility"
  | "health_screening"
  | "leaderboard"
  | "campus_network"
  | "contact_support"
  | "greeting"
  | "thanks"
  | "fallback";

export interface BotResponse {
  intent: Intent;
  reply: string;
  action?: { label: string; href: string };
}

// ── Stopwords to strip before matching ───────────────────────────────────────
const STOPWORDS = new Set([
  "i", "me", "my", "the", "a", "an", "is", "are", "was", "were",
  "do", "does", "did", "to", "of", "in", "on", "at", "for", "with",
  "mujhe", "meri", "mera", "hai", "hain", "ka", "ki", "ke", "aur",
  "ya", "kya", "kaise", "karo", "please", "plz", "pls", "bhai",
  "yaar", "sir", "madam", "hello", "hi", "hey",
]);

// ── Keyword map: intent → patterns (regex or plain strings) ──────────────────
const INTENT_PATTERNS: Array<{ intent: Intent; patterns: RegExp[] }> = [
  {
    intent: "greeting",
    patterns: [
      /\b(hello|hi|hey|namaste|namaskar|hii|helo|sup|good\s*(morning|evening|afternoon))\b/i,
    ],
  },
  {
    intent: "thanks",
    patterns: [
      /\b(thanks|thank\s*you|shukriya|dhanyawad|ty|thx|thnx|shukriya)\b/i,
    ],
  },
  {
    intent: "request_blood",
    patterns: [
      /\b(need|want|require|chahiye|chahie|zaroorat|urgently?\s*need|emergency)\b.*\b(blood|rakt|khoon)\b/i,
      /\b(blood|rakt|khoon)\b.*\b(need|want|require|chahiye|chahie|zaroorat|emergency)\b/i,
      /\b(blood\s*request|request\s*blood|blood\s*emergency|blood\s*chahiye)\b/i,
      /\b(mujhe|humein|patient)\b.*\b(blood|rakt|khoon)\b/i,
    ],
  },
  {
    intent: "find_donor",
    patterns: [
      /\b(find|search|dhundo|dhundna|khojo|locate|nearest?)\b.*\b(donor|doner|donator)\b/i,
      /\b(donor|doner)\b.*\b(find|search|dhundo|near|nearby|close)\b/i,
      /\b(donor\s*list|list\s*of\s*donors|available\s*donors?)\b/i,
      /\b(koi\s*donor|donor\s*kahan|donor\s*milega)\b/i,
    ],
  },
  {
    intent: "donate_info",
    patterns: [
      /\b(how\s*to\s*donate|donate\s*kaise|donation\s*process|become\s*a?\s*donor|register\s*as\s*donor)\b/i,
      /\b(donate|donation|donating)\b.*\b(kaise|how|process|steps?|start|begin)\b/i,
      /\b(blood\s*donate|donate\s*blood|rakt\s*dan|raktdan)\b/i,
      /\b(donor\s*banna|donor\s*kaise\s*bane|donor\s*registration)\b/i,
    ],
  },
  {
    intent: "eligibility",
    patterns: [
      /\b(eligib|eligible|eligibility|yogya|yogyata|qualify|qualification)\b/i,
      /\b(can\s*i\s*donate|am\s*i\s*eligible|donate\s*kar\s*sakta|donate\s*kar\s*sakti)\b/i,
      /\b(age|weight|criteria|requirement|condition)\b.*\b(donat|blood)\b/i,
      /\b(donat|blood)\b.*\b(age|weight|criteria|requirement|condition)\b/i,
      /\b(kitni\s*umar|minimum\s*age|weight\s*required)\b/i,
    ],
  },
  {
    intent: "health_screening",
    patterns: [
      /\b(health\s*screen|screening|health\s*form|medical\s*form|health\s*check)\b/i,
      /\b(health\s*test|medical\s*test|fitness|swasthya)\b.*\b(donat|blood)\b/i,
      /\b(form\s*fill|fill\s*form|health\s*questionnaire)\b/i,
    ],
  },
  {
    intent: "leaderboard",
    patterns: [
      /\b(leaderboard|top\s*donors?|best\s*donors?|ranking|rank|scoreboard)\b/i,
      /\b(sabse\s*zyada|most\s*donations?|highest\s*donor)\b/i,
    ],
  },
  {
    intent: "campus_network",
    patterns: [
      /\b(campus|college|university|institute|school)\b.*\b(network|join|register|blood)\b/i,
      /\b(campus\s*network|college\s*donor|join\s*campus)\b/i,
      /\b(apna\s*college|college\s*add|college\s*join)\b/i,
    ],
  },
  {
    intent: "contact_support",
    patterns: [
      /\b(contact|support|help|helpline|helpdesk|customer\s*care|assist)\b/i,
      /\b(problem|issue|complaint|report|error)\b/i,
      /\b(madad|sahayata|sampark|baat\s*karna)\b/i,
    ],
  },
];

// ── Response map ──────────────────────────────────────────────────────────────
const RESPONSES: Record<Intent, BotResponse> = {
  greeting: {
    intent: "greeting",
    reply:
      "Hello! 👋 Welcome to RedConnect. I can help you find donors, learn about donating blood, or check your eligibility. What do you need?",
  },
  thanks: {
    intent: "thanks",
    reply: "You're welcome! 😊 Is there anything else I can help you with?",
  },
  request_blood: {
    intent: "request_blood",
    reply:
      "🩸 To request blood, go to the **Request Blood** page and fill in the patient details. Our system will automatically match the nearest eligible donors for you.",
    action: { label: "Request Blood →", href: "/request-blood" },
  },
  find_donor: {
    intent: "find_donor",
    reply:
      "🔍 You can search for available donors on the **Find Donor** page. Filter by blood group and city to find the best match near you.",
    action: { label: "Find Donor →", href: "/find-donor" },
  },
  donate_info: {
    intent: "donate_info",
    reply:
      "❤️ To become a donor:\n1. Register or login\n2. Complete the **Health Screening** form\n3. If eligible, you'll be listed as an active donor\n\nThe whole process takes less than 5 minutes!",
    action: { label: "Start Health Screening →", href: "/health-screening" },
  },
  eligibility: {
    intent: "eligibility",
    reply:
      "✅ Basic eligibility criteria to donate blood:\n• Age: 18–65 years\n• Weight: minimum 50 kg\n• No diabetes, heart disease, HIV, or Hepatitis B/C\n• No surgery or tattoo in the last 6 months\n• Not pregnant\n• No alcohol in the last 24 hours\n\nComplete the health screening form for a full check.",
    action: { label: "Check Eligibility →", href: "/health-screening" },
  },
  health_screening: {
    intent: "health_screening",
    reply:
      "📋 The **Health Screening** form is a quick medical questionnaire that checks if you are safe to donate blood. It takes about 2 minutes and is required before you can appear as an active donor.",
    action: { label: "Open Health Form →", href: "/health-screening" },
  },
  leaderboard: {
    intent: "leaderboard",
    reply:
      "🏆 Check out our **Leaderboard** to see the top donors ranked by total donations. Earn Bronze, Silver, or Gold badges based on how many times you've donated!",
    action: { label: "View Leaderboard →", href: "/leaderboard" },
  },
  campus_network: {
    intent: "campus_network",
    reply:
      "🎓 RedConnect has a **Campus Network** where colleges can register and students can join as campus donors. Join your college network to donate within your campus community!",
    action: { label: "Campus Network →", href: "/campus-network" },
  },
  contact_support: {
    intent: "contact_support",
    reply:
      "📞 For support, you can:\n• Email us at **support@redconnect.in**\n• Call our helpline: **1800-XXX-XXXX** (toll-free)\n• Use the contact form on our website\n\nWe're available 24/7 for emergencies.",
  },
  fallback: {
    intent: "fallback",
    reply:
      "🤔 Sorry, I didn't quite understand that. You can ask me about:\n• Finding a donor\n• Requesting blood\n• How to donate\n• Eligibility criteria\n• Health screening\n• Leaderboard\n• Campus network\n• Contact support",
  },
};

// ── Text normalisation ────────────────────────────────────────────────────────
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")   // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// ── Main intent detector ──────────────────────────────────────────────────────
export function detectIntent(rawText: string): BotResponse {
  const text = normalise(rawText);

  // Use compromise to extract nouns/verbs for richer matching
  const doc = nlp(text);
  const terms = doc.terms().out("array") as string[];
  const meaningful = terms.filter((t: string) => !STOPWORDS.has(t)).join(" ");
  const combined = `${text} ${meaningful}`;   // search both raw + NLP output

  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(combined)) {
        return RESPONSES[intent];
      }
    }
  }

  return RESPONSES.fallback;
}
