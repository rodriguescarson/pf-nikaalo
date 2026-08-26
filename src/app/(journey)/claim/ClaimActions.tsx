"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useT } from "@/i18n/useT";
import { Icon } from "@/components/Icon";
import { ActionBar, PrimaryButton } from "@/components/ActionBar";

export function ClaimActions() {
  const t = useT();
  const router = useRouter();
  return (
    <ActionBar>
      <PrimaryButton onClick={() => router.push("/claim/review")}>
        {t("claim.continue")}
        <Icon name="arrowRight" size={20} />
      </PrimaryButton>
    </ActionBar>
  );
}

/** A declaration, not a discount: the toggle rewrites the tax line on the server so the numbers never lie. */
export function Form121Toggle({ checked, action, label }: { checked: boolean; action: (fd: FormData) => Promise<void>; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-3"
      onChange={(e) => {
        const fd = new FormData(e.currentTarget);
        start(async () => {
          await action(fd);
          router.refresh();
        });
      }}
    >
      <label className={`flex items-start gap-3 cursor-pointer rounded-[var(--radius-sheet)] border p-3 ${checked ? "border-cloth bg-cloth-tint/50" : "border-rule hover:bg-paper-2"} ${pending ? "opacity-70" : ""}`}>
        <input type="checkbox" name="form121" defaultChecked={checked} className="mt-0.5 h-5 w-5 accent-[var(--color-cloth)]" disabled={pending} />
        <span className="text-[0.9375rem] text-ink leading-snug">{label}</span>
      </label>
    </form>
  );
}
