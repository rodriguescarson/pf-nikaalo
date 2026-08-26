/**
 * Seeded SYNTHETIC members. Every person, UAN, employer, account and amount here is fictional.
 * Login: any of these UANs + any 6-digit OTP.
 */
import type { Member } from "@/lib/rules/types";

export const DEMO_OTP_HINT = "any 6 digits";

export const MEMBERS: Record<string, Member> = {
  // 1 — the clean case: everything verified; short service so TDS applies unless Form 121.
  "100000000001": {
    uan: "100000000001",
    name: "Priya Sharma",
    dob: "1997-04-12",
    gender: "F",
    uanIssuedOn: "2023-03-05",
    uanActive: true,
    eNomination: true,
    aadhaar: { name: "Priya Sharma", dob: "1997-04-12", gender: "F", verified: true },
    pan: { seeded: true, verified: true, name: "Priya Sharma" },
    bank: { accountLast4: "4471", ifsc: "HDFC0001234", nameOnAccount: "Priya Sharma", kycStatus: "verified" },
    employments: [
      {
        establishmentId: "MHBAN0012345000",
        employer: "Nimbus Analytics Pvt Ltd",
        doj: "2023-03-01",
        doe: "2026-05-31",
        lastContributionMonth: "2026-05-01",
        wageBasicDA: 25_000,
      },
    ],
    passbook: { employeeShare: 96_000, employerShare: 78_000, interest: 36_000, epsContribution: 30_000 },
    priorClaims: [],
  },

  // 2 — the video case: name on EPFO record differs from Aadhaar (middle name). Self-serve fixable.
  "100000000002": {
    uan: "100000000002",
    name: "RAHUL VERMA",
    dob: "1995-11-03",
    gender: "M",
    uanIssuedOn: "2022-06-08",
    uanActive: true,
    eNomination: true,
    aadhaar: { name: "Rahul Kumar Verma", dob: "1995-11-03", gender: "M", verified: true },
    pan: { seeded: true, verified: true, name: "Rahul Kumar Verma" },
    bank: { accountLast4: "9082", ifsc: "SBIN0004321", nameOnAccount: "Rahul Kumar Verma", kycStatus: "verified" },
    employments: [
      {
        establishmentId: "DLCPM0098765000",
        employer: "Sarthak Logistics Ltd",
        doj: "2022-06-01",
        doe: "2024-03-31",
        lastContributionMonth: "2024-03-01",
        wageBasicDA: 24_000,
      },
      {
        establishmentId: "GJAHD0045678000",
        employer: "Kite Software LLP",
        doj: "2024-04-15",
        doe: "2026-05-31",
        lastContributionMonth: "2026-05-01",
        wageBasicDA: 32_000,
      },
    ],
    passbook: { employeeShare: 148_000, employerShare: 121_000, interest: 51_000, epsContribution: 46_000 },
    priorClaims: [],
  },

  // 3 — date of exit never marked by the employer; PAN not seeded (20 % TDS warning would apply if < 5 yrs).
  "100000000003": {
    uan: "100000000003",
    name: "Fatima Khan",
    dob: "1992-08-21",
    gender: "F",
    uanIssuedOn: "2020-01-10",
    uanActive: true,
    eNomination: false,
    aadhaar: { name: "Fatima Khan", dob: "1992-08-21", gender: "F", verified: true },
    pan: { seeded: false, verified: false },
    bank: { accountLast4: "2210", ifsc: "ICIC0007788", nameOnAccount: "Fatima Khan", kycStatus: "verified" },
    employments: [
      {
        establishmentId: "KABLR0034567000",
        employer: "Meridian Hospitality Services",
        doj: "2020-01-06",
        lastContributionMonth: "2026-04-01",
        wageBasicDA: 28_000,
      },
    ],
    passbook: { employeeShare: 221_000, employerShare: 176_000, interest: 83_000, epsContribution: 68_000 },
    priorClaims: [],
  },

  // 4 — bank KYC failed at NPCI; a previous Form 19 was rejected for "bank name differs".
  "100000000004": {
    uan: "100000000004",
    name: "Suresh Pillai",
    dob: "1988-02-14",
    gender: "M",
    uanIssuedOn: "2019-09-10",
    uanActive: true,
    eNomination: true,
    aadhaar: { name: "Suresh Pillai", dob: "1988-02-14", gender: "M", verified: true },
    pan: { seeded: true, verified: true, name: "Suresh Pillai" },
    bank: { accountLast4: "6633", ifsc: "UBIN0553344", nameOnAccount: "S. Pillai", kycStatus: "npci_failed" },
    employments: [
      {
        establishmentId: "TNMAS0011223000",
        employer: "Coromandel Auto Components",
        doj: "2019-09-02",
        doe: "2023-02-28",
        lastContributionMonth: "2023-02-01",
        wageBasicDA: 30_000,
      },
      {
        establishmentId: "KLKCH0099887000",
        employer: "Backwater Foods Pvt Ltd",
        doj: "2023-03-01",
        doe: "2026-05-15",
        lastContributionMonth: "2026-05-01",
        wageBasicDA: 40_000,
      },
    ],
    passbook: { employeeShare: 318_000, employerShare: 252_000, interest: 120_000, epsContribution: 92_000 },
    priorClaims: [
      { id: "CLM-2026-07-0001", form: "FORM_19", status: "rejected", reasonCode: "BANK_NAME_DIFFERS", date: "2026-07-02" },
    ],
  },
};

export const DEMO_UANS = Object.keys(MEMBERS);

export function getSeedMember(uan: string): Member | undefined {
  const m = MEMBERS[uan];
  return m ? structuredClone(m) : undefined;
}
