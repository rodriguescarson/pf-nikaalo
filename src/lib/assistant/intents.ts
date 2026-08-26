/**
 * Sahayak's scripted brain: a small intent router over the rules engine.
 * Deterministic on purpose — every answer is traceable to a rule and the member's own record.
 * Hindi and English (and Hinglish in Latin script) patterns side by side.
 */
export type IntentId =
  | "reject_risk"
  | "tds"
  | "timeline"
  | "form121"
  | "doe"
  | "forms"
  | "amount"
  | "who_fixes"
  | "greeting";

const P: Record<IntentId, RegExp[]> = {
  greeting: [/^(hi|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|हैलो|हाय)(?=[\s!,.।]|$)/i],
  reject_risk: [
    /reject|rejection|bounce|fail|risk|problem|wrong|galat|खारिज|रिजेक्ट|अस्वीकार|दिक्कत|समस्या|गड़बड़|क्यों नहीं|kyu(n)? nahi/i,
    /क्या क्लेम (हो|मिल)/i,
  ],
  form121: [/121|15\s?g|15\s?h|declar|घोषणा|फ़?ॉर्म ?121/i],
  tds: [/tds|tax|टैक्स|कर कट|कटेगा|deduct|कटौती|section ?192/i],
  timeline: [/when|kab|कब|how long|kitna time|kitne din|days?|दिन|समय|timeline|settle|पैसा कब|money come|aayega|आएगा/i],
  doe: [/exit|date of leaving|doe|mark exit|नियोक्ता|employer|एग्ज़िट|छोड़ने की तारीख|not updating|update nahi|नहीं भर/i],
  forms: [/which form|form (19|10c|31)|kaunsa form|कौन ?सा फ़?ॉर्म|फ़?ॉर्म (19|10सी|10c|31)|scheme certificate|स्कीम/i],
  amount: [/how much|kitna (paisa|milega|amount)|कितना (पैसा|मिलेगा)|balance|बैलेंस|amount|राशि|milega/i],
  who_fixes: [/who (fix|will)|kaun (theek|karega)|कौन (ठीक|करेगा)|whose job|kiska kaam/i],
};

/** Order matters: the more specific intents are tested before the broad ones. */
const ORDER: IntentId[] = ["greeting", "form121", "doe", "forms", "who_fixes", "tds", "timeline", "amount", "reject_risk"];

export function detectIntent(query: string): IntentId | null {
  const q = query.trim();
  if (!q) return null;
  for (const id of ORDER) if (P[id].some((re) => re.test(q))) return id;
  return null;
}
