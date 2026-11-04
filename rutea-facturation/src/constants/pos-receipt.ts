export const POS_80MM_PRINT_STYLES = `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #pos-80mm-printable-area,
          #pos-80mm-printable-area * {
            visibility: visible !important;
          }
          #pos-80mm-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 2mm 3mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `;

export const POS_RECEIPT_DIVIDER_TEXT = "----------------------------------------";

