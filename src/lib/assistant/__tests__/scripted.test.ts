import { describe, expect, it, vi } from "vitest";
import { translate } from "@/i18n";
import { applyFix } from "@/lib/rules";
import { MEMBERS } from "@/mock/members";

vi.mock("server-only", () => ({}));

const { scriptedAnswer } = await import("@/lib/assistant/provider");

const AS_OF = "2026-08-26";
const context = (member: (typeof MEMBERS)[string], lang: "en" | "hi" = "en", form121 = false) => ({
  member,
  intent: "full_withdrawal" as const,
  asOf: AS_OF,
  lang,
  form121,
});

describe("scriptedAnswer", () => {
  it("explains Rahul's name-match block, then clears it after the profile fix", () => {
    const blocked = scriptedAnswer("why rejected", context(MEMBERS["100000000002"]));
    expect(blocked.text).toContain("Name matches Aadhaar");
    expect(blocked.provider).toBe("scripted");

    const fixed = applyFix(MEMBERS["100000000002"], "UPDATE_PROFILE", AS_OF);
    expect(scriptedAnswer("why rejected", context(fixed)).text).toBe(translate("en", "assistant.answers.rejectRisk_clear"));
  });

  it("shows Priya's 10% TDS and removes it when Form 121 is declared", () => {
    expect(scriptedAnswer("how much tax will be cut", context(MEMBERS["100000000001"])).text).toContain("10%");
    expect(scriptedAnswer("how much tax will be cut", context(MEMBERS["100000000001"])).text).toContain("21,000");
    expect(scriptedAnswer("how much tax will be cut", context(MEMBERS["100000000001"], "en", true)).text).toContain("No tax");
  });

  it("shows Priya's PF balance", () => {
    expect(scriptedAnswer("how much will I get", context(MEMBERS["100000000001"])).text).toContain("2,10,000");
  });

  it("uses the fallback text for an unknown question", () => {
    expect(scriptedAnswer("what is the weather", context(MEMBERS["100000000001"])).text).toBe(translate("en", "assistant.fallback"));
  });

  it("returns the Hindi greeting translation", () => {
    expect(scriptedAnswer("namaste", context(MEMBERS["100000000001"], "hi")).text).toBe(translate("hi", "assistant.answers.greeting"));
  });
});
