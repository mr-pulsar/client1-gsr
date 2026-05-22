import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

async function renderToCanvas(node, dpi = 300) {
  const scale = Math.max(1, dpi / 96);
  // Force use of node's full scroll size for accurate rendering
  const opts = {
    backgroundColor: '#ffffff',
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    scrollY: -window.scrollY,
    width: node.scrollWidth,
    height: node.scrollHeight,
  };
  return html2canvas(node, opts);
}

function mmToPx(mm, dpi) {
  return Math.round((mm / 25.4) * dpi);
}

function inchesToPx(inches, dpi) {
  return Math.round(inches * dpi);
}

async function exportImageCanvas(canvas, targetW, targetH, mime = 'image/png', quality = 1) {
  const out = document.createElement('canvas');
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext('2d');
  // white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);

  const scale = Math.min(targetW / canvas.width, targetH / canvas.height);
  const drawW = Math.round(canvas.width * scale);
  const drawH = Math.round(canvas.height * scale);
  const x = Math.round((targetW - drawW) / 2);
  const y = Math.round((targetH - drawH) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, x, y, drawW, drawH);
  return out.toDataURL(mime, quality);
}

export async function downloadAsPng(ref, filename = 'courier-label', options = { dpi: 300, format: '6x4' }) {
  const node = ref.current;
  const dpi = options.dpi || 300;
  const canvas = await renderToCanvas(node, dpi);

  let targetW = canvas.width;
  let targetH = canvas.height;

  if (options.format === '6x4') {
    // 6 x 4 inches target at requested DPI
    targetW = inchesToPx(6, dpi);
    targetH = inchesToPx(4, dpi);
  } else if (options.format === 'thermal-80') {
    // thermal 80mm width, auto height - convert mm to px at dpi
    targetW = mmToPx(80, dpi);
    // keep aspect ratio based on canvas
    targetH = Math.round((canvas.height / canvas.width) * targetW);
  }

  const dataUrl = await exportImageCanvas(canvas, targetW, targetH, 'image/png', 1);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.png`;
  link.click();
}

export async function downloadAsJpeg(ref, filename = 'courier-label', options = { dpi: 300, format: '6x4' }) {
  const node = ref.current;
  const dpi = options.dpi || 300;
  const canvas = await renderToCanvas(node, dpi);

  let targetW = canvas.width;
  let targetH = canvas.height;
  if (options.format === '6x4') {
    targetW = inchesToPx(6, dpi);
    targetH = inchesToPx(4, dpi);
  } else if (options.format === 'thermal-80') {
    targetW = mmToPx(80, dpi);
    targetH = Math.round((canvas.height / canvas.width) * targetW);
  }

  const dataUrl = await exportImageCanvas(canvas, targetW, targetH, 'image/jpeg', 0.95);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.jpg`;
  link.click();
}

export async function downloadAsPdf(ref, filename = 'courier-label', options = { dpi: 300, format: 'a4' }) {
  const node = ref.current;
  const canvas = await renderToCanvas(node, options.dpi);
  const imgData = canvas.toDataURL('image/png');

  if (options.format === 'thermal-80') {
    // Thermal 80mm width PDF
    const pdf = new jsPDF({ unit: 'mm', format: [80, (canvas.height * 80) / canvas.width] });
    pdf.addImage(imgData, 'PNG', 0, 0, 80, (canvas.height * 80) / canvas.width);
    pdf.save(`${filename}.pdf`);
    return;
  }
  // Support 6x4 inch labels plus default A4 - scale image to fit within page area without cropping
    const margin = 10; // mm
    let pageOuterWidth;
    let pageOuterHeight;
    if (options.format === '6x4') {
      // 6 inches x 4 inches -> mm
      pageOuterWidth = 6 * 25.4; // 152.4 mm
      pageOuterHeight = 4 * 25.4; // 101.6 mm
    } else {
      // Default A4
      pageOuterWidth = 210;
      pageOuterHeight = 297;
    }

    const pdf = new jsPDF({ orientation: pageOuterWidth >= pageOuterHeight ? 'landscape' : 'portrait', unit: 'mm', format: [pageOuterWidth, pageOuterHeight] });

    const pageInnerWidth = pageOuterWidth - margin * 2;
    const pageInnerHeight = pageOuterHeight - margin * 2;

    // preserve aspect ratio using canvas width/height
    const aspect = canvas.width / canvas.height;
    let drawW = pageInnerWidth;
    let drawH = drawW / aspect;
    if (drawH > pageInnerHeight) {
      drawH = pageInnerHeight;
      drawW = drawH * aspect;
    }

    const x = (pageOuterWidth - drawW) / 2;
    const y = (pageOuterHeight - drawH) / 2;

    pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);
    pdf.save(`${filename}.pdf`);
}

export function directPrint(ref, options = {}) {
  const node = ref.current;
  // include current document styles so Tailwind classes render in the print window
  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map((n) => n.outerHTML).join('\n');
  const html = `
    <html>
      <head>
        <title>Print</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        ${headStyles}
        <style>
          /* Ensure background colors and gradients are preserved when printing */
          html,body { margin: 0; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-only { display: block; }
          /* Make sure the page size is honored for thermal/6x4 labels */
          @media print { @page { size: ${options.format === 'thermal-80' ? '80mm auto' : (options.format === '6x4' ? '152.4mm 101.6mm' : 'A4')}; margin: 10mm; } }
        </style>
      </head>
      <body>${node.outerHTML}</body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=1200');
  if (!printWindow) {
    console.error('Unable to open print window');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  // try to center content and set no margins for thermal printing
  printWindow.onload = () => {
    printWindow.document.body.style.display = 'flex';
    printWindow.document.body.style.alignItems = 'center';
    printWindow.document.body.style.justifyContent = 'center';
    printWindow.print();
  };
}