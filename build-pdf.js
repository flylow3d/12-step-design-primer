/**
 * build-pdf.js — render index.html to a selectable, accessible PDF using
 * headless Chromium (Puppeteer). The @media print block in index.html
 * controls layout: hides UI chrome, reveals every slide, forces a page
 * break per slide.
 *
 * Run:    npm run build-pdf
 * Output: 12-step-design-primer.pdf  (committed to the repo so GitHub
 *         Pages serves it via the "Download PDF" button)
 */
const puppeteer = require('puppeteer');
const path = require('path');

const OUT = '12-step-design-primer.pdf';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();

    const url = 'file://' + path.resolve(__dirname, 'index.html');
    console.log(`[build-pdf] loading ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Match the print stylesheet so @media print rules apply
    await page.emulateMediaType('print');

    // Give any deferred image loads a beat to settle
    await new Promise(r => setTimeout(r, 750));

    console.log(`[build-pdf] rendering ${OUT}`);
    await page.pdf({
      path: OUT,
      landscape: true,
      printBackground: true,        // keep colored boxes / table headers
      preferCSSPageSize: true,      // honors @page { size: landscape; margin: ... }
      displayHeaderFooter: false,   // we have our own footer per slide
    });
    console.log(`[build-pdf] saved ${OUT}`);
  } finally {
    await browser.close();
  }
})();
