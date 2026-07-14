// ─── Age / Junior ────────────────────────────────────────────────────────────
export const isJunior = (dob) => {
  if (!dob) return false;
  const birth = new Date(dob);
  if (isNaN(birth)) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());
  if (!hasBirthdayPassed) age--;
  return age < 20;
};

// ─── Committee membership ──────────────────────────────────────────────────
// A "committee member" is anyone whose designation is set to something other
// than "Member" (the designation select stores the plain member option as
// the lowercase value "member").
export const isCommitteeMember = (designation) => {
  if (!designation) return false;
  return designation.trim().toLowerCase() !== "member";
};

// ─── Aadhaar formatting ─────────────────────────────────────────────────────
// Displays a 12-digit Aadhaar number as "XXXX XXXX XXXX" if possible,
// otherwise returns the raw value.
export const formatAadhaar = (value) => {
  if (!value) return "—";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 12) {
    return digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
  }
  return String(value);
};

// ─── Phone number country-code splitting ───────────────────────────────────
export const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+974", label: "🇶🇦 +974" },
  { code: "+973", label: "🇧🇭 +973" },
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+965", label: "🇰🇼 +965" },
  { code: "+968", label: "🇴🇲 +968" },
  { code: "+60", label: "🇲🇾 +60" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+61", label: "🇦🇺 +61" },
];

export function splitPhone(full = "") {
  const cleaned = full.trim();
  const sorted = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length,
  );

  for (const { code } of sorted) {
    if (cleaned.startsWith(code)) {
      let number = cleaned.slice(code.length).replace(/\D/g, "");
      const codeDigits = code.replace("+", "");
      if (number.startsWith(codeDigits)) {
        number = number.slice(codeDigits.length);
      }
      return { code, number };
    }
  }

  const stripped = cleaned.replace(/^\+\d{1,4}/, "").replace(/\D/g, "");
  return { code: "+91", number: stripped };
}
