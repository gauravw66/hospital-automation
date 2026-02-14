export function injectData(html: string, data: Record<string, string>): string {
  let result = html;

  // Define the common fields we expect in hospital forms
  const fieldMap: Record<string, string[]> = {
    uid: ["UID No", "UID", "Reg No", "U.I.D. No"],
    ipd: ["IPD No", "IPD", "Indoor No", "I.P.D. No"],
    admissionDate: [
      "Date & Time Of Admission",
      "Date &amp; Time Of Admission",
      "Date & Time of Admission",
      "Admission Date",
    ],
    name: [
      "Patient's Name",
      "Patient’s Name",
      "Name",
      "Patient Name",
      "Name of Patient",
    ],
    age: ["Age/Sex", "Age", "Sex", "Age / Sex"],
    consultant: ["Consultant", "Doctor", "Consultant Name", "Under Consultant"],
    diagnosis: ["Diagnosis", "Provisional Diagnosis", "Final Diagnosis"],
    bed: ["Bed No", "Ward/Bed", "Bed"],
    location: ["Location", "Ward", "ICU/Ward/Room"],
    duration: ["Duration"],
  };

  // For each field in the data, try to find its label and replace the following placeholder
  Object.entries(data).forEach(([key, value]) => {
    const labels = fieldMap[key] || [key];

    for (const label of labels) {
      // Improved regex:
      // 1. Matches the label
      // 2. Matches optional closing/opening tags and whitespace ([\\s\\S]*?)
      // 3. Matches underscores (_{2,}) OR dots/ellipsis (([.\u2026\u00b7]{2,}))
      // We limit the gap to 150 chars to avoid accidental matches with distant fields
      const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(
        `(${escapedLabel}[\\s\\S]{0,150}?)(_{2,}|[.\u2026\u00b7]{2,})`,
        "gi",
      );

      if (regex.test(result)) {
        result = result.replace(
          regex,
          `$1<span style="color: blue; text-decoration: underline; font-weight: bold; font-family: sans-serif; font-size: 1.05em;">${value || "&nbsp;"}</span>`,
        );
        break; // Stop after first match for this field
      }
    }
  });

  // Add print-specific CSS to ensure clean printing without browser headers/footers
  const printStyles = `
    <style>
      @media print {
        @page { 
          margin: 0; 
          size: A4 portrait;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* Hide everything by default */
        body > * {
          display: none !important;
        }
        /* Only show the actual form container */
        .pdf24_02 {
          display: block !important;
          /* Reduced negative margins to stop over-cropping */
          margin: -0.5cm auto 0 auto !important; 
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          /* Scale set to 1.0 to fill page without cutting off edges */
          transform: scale(1.0);
          transform-origin: top center;
          width: 210mm;
          min-height: 297mm;
        }
        /* Ensure images and backgrounds show */
        img {
          display: block !important;
        }
        /* Remove any potential shadows/borders from all source elements */
        * { 
          box-shadow: none !important; 
          text-shadow: none !important;
          -webkit-print-color-adjust: exact !important;
        }
        .no-print { display: none !important; }
      }
    </style>
  `;

  return result + printStyles;
}
