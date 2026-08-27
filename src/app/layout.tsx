import type { Metadata, Viewport } from "next";
import { Anek_Devanagari, Bricolage_Grotesque, Manrope } from "next/font/google";
import "./globals.css";
import { getLang, getUan } from "@/lib/session";
import { LocaleProvider } from "@/i18n/useT";
import { makeT } from "@/i18n";
import { Banner } from "@/components/Banner";
import { Header } from "@/components/Header";
import { OfflineBar } from "@/components/OfflineBar";

const anek = Anek_Devanagari({
  variable: "--font-anek",
  subsets: ["devanagari", "latin"],
  weight: ["500", "700"],
  display: "swap",
});
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "PF Nikaalo — reject-proof your PF claim", template: "%s · PF Nikaalo" },
  description:
    "An independent prototype that checks an EPFO withdrawal claim before you file it, picks the right form for you, shows the money and tax up front, and tracks the claim in plain language. Not EPFO. Synthetic data.",
  applicationName: "PF Nikaalo",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#b6f036",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const uan = await getUan();
  const t = makeT(lang);
  return (
    <html lang={lang} className={`${anek.variable} ${bricolage.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col text-ink">
        {/*
          THESIS: A PF claim is a ledger entry the shopkeeper checks before he writes it. PF Nikaalo refuses
          to file what will bounce and explains every line; it refuses the portal's accept-anything form.
          OWN-WORLD: lac-red cloth cover bands (header, sticky action bar, running totals); white ruled
          sheets with a red margin rule and hairline rows; blue-black ink; green-pen tick = clear, red-pencil
          circle = problem, ochre pencil note = caution; Anek Devanagari for heads, labels and tabular
          figures; system sans body.
          STORY: I see what will get my claim rejected, I fix it here, I know the money and the tax, I file,
          I know who is acting and when.
          FIRST VIEWPORT: the closed red cover with the title and one fact (1 in 3 rejected) and one action
          (open the ledger); then the sheet.
          SIGNATURE: pre-flight checks are written line by line; a failing line gets circled, a fix strikes
          it and rewrites it. seed:cf662711
        */}
        <LocaleProvider lang={lang}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-sheet focus:px-3 focus:py-2 focus:rounded"
          >
            {t("common.skipToContent")}
          </a>
          <Header lang={lang} signedIn={Boolean(uan)} />
          <Banner />
          <OfflineBar />
          <main id="main" className="flex-1 flex flex-col">
            {children}
          </main>
        </LocaleProvider>
      </body>
    </html>
  );
}
