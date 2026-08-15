// Builds a self-contained, print-ready patient invoice from data already loaded
// on the patient profile (patient + this hospital's conditions, medicines and
// recommendation notes), opens it in a new window and triggers the browser's
// print dialog so the user can save it as a PDF. No PDF dependency required.

import { format } from "date-fns";

// Escape user-supplied text before inlining it into the invoice HTML.
function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeDate(value: unknown, pattern: string): string {
  if (!value) return "—";
  const d = new Date(value as string);
  if (isNaN(d.getTime())) return "—";
  return format(d, pattern);
}

// A medicine timing is either a plain "HH:mm" string or a { timing } object
// holding a datetime — mirror how the profile page renders them.
function formatTiming(t: any): string {
  if (typeof t === "string") return t;
  if (t?.timing) {
    const d = new Date(t.timing);
    return isNaN(d.getTime()) ? "" : format(d, "HH:mm");
  }
  return "";
}

function ageFromDob(dob: unknown): string {
  if (!dob) return "—";
  const d = new Date(dob as string);
  if (isNaN(d.getTime())) return "—";
  const years = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${years} yrs`;
}

interface InvoiceHospital {
  name?: string;
  address?: string;
  contactNumber?: string;
  helplineNumber?: string;
  email?: string;
}

// Prefer the authenticated hospital's own profile for the letterhead; fall back
// to the hospital attached to the patient's first condition.
function resolveHospital(patient: any, hospital?: InvoiceHospital): InvoiceHospital {
  if (hospital && hospital.name) return hospital;
  const fromCondition = patient?.conditions?.find((c: any) => c.hospital)?.hospital;
  return fromCondition || {};
}

// Alivepost brand mark, inlined so the invoice is self-contained (the public
// logo.svg is ~2 MB — too big to embed per document). Fills are hard-coded
// (rather than the asset's prefers-color-scheme rules) so it prints on paper.
const ALIVEPOST_LOGO_SVG = `<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alivepost logo" class="logo-mark">
  <rect width="180" height="180" rx="37" fill="#111827"/>
  <path fill="#ffffff" d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z"/>
  <path fill="#ffffff" d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z"/>
</svg>`;

export function buildInvoiceHtml(patient: any, hospital?: InvoiceHospital): string {
  const hosp = resolveHospital(patient, hospital);
  const conditions: any[] = patient?.conditions || [];
  const history: any[] = patient?.medicalHistory || [];

  // A stable, human-readable invoice reference. No persistence — this is a care
  // summary document, so the reference is derived from the patient + issue date.
  const issuedOn = new Date();
  const invoiceRef = `AP-${patient?.id ?? "000"}-${format(issuedOn, "yyyyMMdd")}`;

  // Emergency contact for the patient: the hospital's helpline is the 24×7 line;
  // fall back to the general contact number if no helpline is on record.
  const emergencyContact = hosp.helplineNumber || hosp.contactNumber || "";

  // Alivepost wordmark, served from the app's own origin at the stable public
  // path (not the fingerprinted /_next/ URL, whose hash changes every rebuild).
  // Absolute so it resolves in both the print iframe and the Blob-URL fallback.
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoSrc = `${origin}/logo.svg`;

  const conditionBlocks = conditions
    .map((c, idx) => {
      const meds: any[] = c.medicineAlloted || [];
      const medRows =
        meds.length === 0
          ? `<tr><td colspan="4" class="empty">No medicines prescribed for this condition.</td></tr>`
          : meds
            .map((m) => {
              const timings = (m.timings || [])
                .map(formatTiming)
                .filter(Boolean)
                .join(", ");
              const dosage = [m.medicine?.dosageStrength, m.medicine?.dosageForm]
                .filter(Boolean)
                .join(" ");
              return `<tr>
                  <td>
                    <strong>${esc(m.medicine?.brandName || `Medicine #${m.medicineId}`)}</strong>
                    ${m.medicine?.genericName ? `<span class="muted"> (${esc(m.medicine.genericName)})</span>` : ""}
                    ${dosage ? `<div class="muted small">${esc(dosage)}</div>` : ""}
                  </td>
                  <td class="center">${esc(m.quantity ?? "—")}</td>
                  <td>${timings ? esc(timings) : "—"}</td>
                  <td>${safeDate(m.tillDate, "dd MMM yyyy")}</td>
                </tr>`;
            })
            .join("");

      const doctorNote = c.DoctorReccommendation;
      const invoiceNote = c.invoiceRecommendation;

      return `<section class="condition">
        <div class="condition-head">
          <h3>${idx + 1}. ${esc(c.disease?.name || `Condition #${c.diseaseId}`)}</h3>
          <div class="condition-meta">
            ${c.doctor?.name ? `<span>Dr. ${esc(c.doctor.name)}</span>` : ""}
            <span>${safeDate(c.startDate, "dd MMM yyyy")}${c.endDate ? " – " + safeDate(c.endDate, "dd MMM yyyy") : " – Present"}</span>
          </div>
        </div>

        <table class="meds">
          <thead>
            <tr><th>Medicine</th><th class="center">Qty</th><th>Timings</th><th>Till</th></tr>
          </thead>
          <tbody>${medRows}</tbody>
        </table>

        ${doctorNote
          ? `<div class="note"><span class="note-label">Do's</span><p>${esc(doctorNote)}</p></div>`
          : ""
        }
        ${invoiceNote
          ? `<div class="note"><span class="note-label">Don'ts</span><p>${esc(invoiceNote)}</p></div>`
          : ""
        }
      </section>`;
    })
    .join("");

  const historyBlock =
    history.length === 0
      ? ""
      : `<section class="history">
          <h2>Medical History</h2>
          <table class="meds">
            <thead><tr><th>Condition</th><th>Period</th><th>Notes</th></tr></thead>
            <tbody>
              ${history
        .map(
          (h) => `<tr>
                    <td><strong>${esc(h.disease?.name || `Disease #${h.diseaseId}`)}</strong></td>
                    <td>${safeDate(h.startDate, "dd MMM yyyy")}${h.endDate ? " – " + safeDate(h.endDate, "dd MMM yyyy") : ""}</td>
                    <td>${h.description ? esc(h.description) : "—"}</td>
                  </tr>`
        )
        .join("")}
            </tbody>
          </table>
        </section>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice — ${esc(patient?.name || "Patient")}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1a1a2e;
    margin: 0;
    padding: 32px;
    font-size: 13px;
    line-height: 1.5;
    background: #fff;
    /* Keep coloured backgrounds/badges (emergency box, notes, logo) when saved
       as a PDF — browsers drop backgrounds on print without this. */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sheet { max-width: 800px; margin: 0 auto; }
  .brandbar {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 3px solid #6d28d9; padding-bottom: 12px; margin-bottom: 16px;
  }
  .brandbar-left { display: flex; align-items: center; gap: 10px; }
  .logo-img { height: 36px; width: auto; display: block; }
  .logo-mark { width: 34px; height: 34px; display: block; flex-shrink: 0; }
  header {
    display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    border-bottom: 1px solid #ececf3; padding-bottom: 16px; margin-bottom: 24px;
  }
  .brand h1 { margin: 0; font-size: 20px; color: #6d28d9; letter-spacing: -0.3px; }
  .brand .hosp-detail { color: #555; font-size: 12px; margin-top: 4px; max-width: 340px; }
  .emergency {
    border: 1.5px solid #dc2626; background: #fef2f2; border-radius: 10px;
    padding: 10px 14px; text-align: right; flex-shrink: 0;
  }
  .emergency-label { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; color: #b91c1c; font-weight: 700; }
  .emergency-number { display: block; font-size: 18px; font-weight: 800; color: #dc2626; letter-spacing: 0.3px; margin-top: 2px; }
  .invoice-meta { text-align: right; font-size: 12px; color: #555; }
  .invoice-meta .doc-title { font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
  .invoice-meta .ref { font-family: ui-monospace, monospace; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #6d28d9; margin: 28px 0 10px; }
  .patient-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 24px;
    background: #f6f4fd; border: 1px solid #e6e0f7; border-radius: 10px; padding: 16px;
  }
  .field { display: flex; flex-direction: column; }
  .field .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #8a8aa0; }
  .field .value { font-weight: 600; }
  .condition { border: 1px solid #e4e4ef; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
  .condition-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .condition-head h3 { margin: 0; font-size: 14px; }
  .condition-meta { font-size: 12px; color: #555; display: flex; gap: 14px; flex-wrap: wrap; }
  table.meds { width: 100%; border-collapse: collapse; margin-top: 6px; }
  table.meds th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #8a8aa0; border-bottom: 1px solid #e4e4ef; padding: 6px 8px; }
  table.meds td { padding: 8px; border-bottom: 1px solid #f0f0f5; vertical-align: top; }
  table.meds td.center, table.meds th.center { text-align: center; }
  .muted { color: #777; font-weight: 400; }
  .small { font-size: 11px; }
  .empty { color: #999; font-style: italic; text-align: center; padding: 12px; }
  .note { margin-top: 10px; background: #fff8ec; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 8px 12px; }
  .note-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #b45309; font-weight: 700; }
  .note p { margin: 4px 0 0; }
  .no-conditions { color: #999; font-style: italic; padding: 16px; text-align: center; border: 1px dashed #ddd; border-radius: 10px; }
  footer { margin-top: 32px; border-top: 1px solid #e4e4ef; padding-top: 12px; font-size: 11px; color: #999; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .footer-brand { display: inline-flex; align-items: center; gap: 6px; }
  .footer-brand .logo-mark { width: 16px; height: 16px; }
  @media print {
    body { padding: 0; }
    .condition, .patient-grid { break-inside: avoid; }
    @page { margin: 16mm; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="brandbar">
      <div class="brandbar-left">
        <img src="${logoSrc}" alt="Alivepost" class="logo-img" />
      </div>
      <div class="invoice-meta">
        <div class="doc-title">Patient Invoice</div>
        <div>Ref: <span class="ref">${esc(invoiceRef)}</span></div>
        <div>Issued: ${format(issuedOn, "dd MMM yyyy")}</div>
      </div>
    </div>

    <header>
      <div class="brand">
        <h1>${esc(hosp.name || "Alivepost")}</h1>
        <div class="hosp-detail">
          ${hosp.address ? esc(hosp.address) : ""}
        </div>
      </div>
      ${emergencyContact
      ? `<div class="emergency">
              <span class="emergency-label"> Emergency / 24×7 Helpline</span>
              <span class="emergency-number">${esc(emergencyContact)}</span>
            </div>`
      : ""
    }
    </header>

    <h2>Patient Details</h2>
    <div class="patient-grid">
      <div class="field"><span class="label">Name</span><span class="value">${esc(patient?.name || "—")}</span></div>
      <div class="field"><span class="label">Mobile</span><span class="value">${esc(patient?.mobileNumber || "—")}</span></div>
      <div class="field"><span class="label">Date of Birth</span><span class="value">${safeDate(patient?.dateOfBirth, "dd MMM yyyy")} (${ageFromDob(patient?.dateOfBirth)})</span></div>
      <div class="field"><span class="label">Gender</span><span class="value">${esc(patient?.gender || "—")}</span></div>
      <div class="field"><span class="label">Blood Group</span><span class="value">${esc(patient?.bloodGroup || "—")}</span></div>
      <div class="field"><span class="label">${esc(patient?.idType || "ID")}</span><span class="value">${esc(patient?.idNumber || "—")}</span></div>
    </div>

    <h2>Conditions &amp; Prescribed Medicines</h2>
    ${conditionBlocks || `<div class="no-conditions">No conditions recorded under this hospital.</div>`}

    ${historyBlock}

    <footer>
      <span class="footer-brand">    <img src="${logoSrc}" alt="Alivepost" class="logo-img" /> Generated by Alivepost · ${format(issuedOn, "dd MMM yyyy, HH:mm")}</span>
      <span>This document is for informational purposes and is not a payment receipt.</span>
    </footer>
  </div>
</body>
</html>`;
}

// Renders the invoice and opens the browser's print dialog (Save as PDF).
// Primary path is a hidden iframe — no popup window, so it isn't affected by
// popup blockers and never leaves a stray blank tab. Falls back to opening a
// real tab (Blob URL) if the iframe can't be used. Returns false only if both
// paths fail (e.g. the fallback popup is blocked), so callers can hint.
export function downloadPatientInvoice(patient: any, hospital?: InvoiceHospital): boolean {
  const html = buildInvoiceHtml(patient, hospital);

  // ── Primary: print through a hidden same-document iframe ──
  try {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";

    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = win?.document;
    if (!win || !doc) throw new Error("iframe document unavailable");

    doc.open();
    doc.write(html);
    doc.close();

    let printed = false;
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      // Delay removal so we don't tear down the frame while the print dialog
      // is still reading from it.
      setTimeout(() => iframe.remove(), 1000);
    };
    const printOnce = () => {
      if (printed) return;
      printed = true;
      try {
        win.focus();
        win.print();
      } catch {
        /* ignore — cleanup still runs below */
      }
      win.addEventListener?.("afterprint", cleanup);
      // afterprint isn't guaranteed to fire; reclaim the node on a long timer.
      setTimeout(cleanup, 60000);
    };

    // Wait for the logo image to finish loading before printing, so it isn't
    // missing from the saved PDF. Prints immediately once all images are
    // complete; a safety timer prints anyway if an image stalls.
    const printWhenReady = () => {
      const imgs = Array.from(doc.images || []);
      const pending = imgs.filter((img) => !img.complete);
      if (pending.length === 0) {
        printOnce();
        return;
      }
      let remaining = pending.length;
      const oneLoaded = () => {
        if (--remaining <= 0) printOnce();
      };
      pending.forEach((img) => {
        img.addEventListener("load", oneLoaded);
        img.addEventListener("error", oneLoaded);
      });
      // Don't hang forever if the logo stalls — print without it after 4s.
      setTimeout(printOnce, 4000);
    };

    // The frame's document may already be laid out (synchronous write) or still
    // parsing; cover both, then wait on images.
    if (doc.readyState === "complete") {
      setTimeout(printWhenReady, 100);
    } else {
      win.onload = printWhenReady;
      setTimeout(printWhenReady, 800);
    }

    return true;
  } catch {
    // ── Fallback: open a real tab with a Blob URL (real, navigable content —
    // no document.write, no noopener so the tab actually renders). ──
    try {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) {
        URL.revokeObjectURL(url);
        return false;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return true;
    } catch {
      return false;
    }
  }
}
