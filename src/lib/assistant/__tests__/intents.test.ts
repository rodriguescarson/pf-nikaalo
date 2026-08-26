import { describe, expect, it } from "vitest";
import { detectIntent } from "@/lib/assistant/intents";

describe("detectIntent", () => {
  it.each([
    ["reject_risk", "why would my claim be rejected"],
    ["reject_risk", "मेरा क्लेम क्यों रिजेक्ट होगा"],
    ["reject_risk", "claim kyu reject hoga"],
    ["tds", "how much tax will be cut"],
    ["tds", "कितना टैक्स कटेगा"],
    ["tds", "tds kitna"],
    ["timeline", "when will the money come"],
    ["timeline", "पैसा कब आएगा"],
    ["timeline", "paisa kab aayega"],
    ["form121", "what is form 121"],
    ["form121", "फ़ॉर्म 121 क्या है"],
    ["form121", "121 kya hai"],
    ["doe", "my employer is not updating my exit date"],
    ["doe", "नियोक्ता एग्ज़िट डेट नहीं भर रहा"],
    ["doe", "employer exit date update nahi kar raha"],
    ["forms", "which form"],
    ["forms", "कौन सा फ़ॉर्म चाहिए"],
    ["forms", "kaunsa form chahiye"],
    ["amount", "how much will i get"],
    ["amount", "कितना मिलेगा"],
    ["amount", "kitna milega"],
    ["who_fixes", "who will fix this"],
    ["who_fixes", "कौन ठीक करेगा"],
    ["who_fixes", "kaun theek karega"],
    ["greeting", "hello"],
    ["greeting", "namaste"],
  ])("routes %s for %s", (expected, query) => {
    expect(detectIntent(query)).toBe(expected);
  });

  it("gives forms precedence over TDS", () => {
    expect(detectIntent("which form do I need to avoid tds")).toBe("forms");
  });

  it("routes the Devanagari greeting नमस्ते to greeting", () => {
    expect(detectIntent("नमस्ते")).toBe("greeting");
    expect(detectIntent("नमस्ते, सहायक")).toBe("greeting");
    expect(detectIntent("हाय")).toBe("greeting");
  });

  it.each(["", "what is the weather"])("returns null for %j", (query) => {
    expect(detectIntent(query)).toBeNull();
  });
});
