import fs from "node:fs/promises";
import path from "node:path";
import type { Browser } from "playwright";
import { chromium } from "playwright";

interface ExportDeckToPdfOptions {
   url: string;
   outputPath: string;
}

export async function exportDeckToPdf({
   url,
   outputPath,
}: ExportDeckToPdfOptions): Promise<void> {
   await fs.mkdir(path.dirname(outputPath), { recursive: true });

   let browser: Browser | undefined;
   try {
      browser = await chromium.launch({ headless: true });
   } catch (error) {
      throw new Error(
         `Chromium is not available for PDF export. Run "npx playwright install chromium" and try again.\n\nOriginal error: ${
            error instanceof Error ? error.message : String(error)
         }`
      );
   }

   try {
      const page = await browser.newPage({
         viewport: {
            width: 1600,
            height: 900,
         },
      });

      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__SUPADECK_READY__ === true);
      await page.emulateMedia({ media: "screen" });
      await page.pdf({
         path: outputPath,
         landscape: true,
         printBackground: true,
         preferCSSPageSize: false,
         format: "A4",
         margin: {
            top: "0",
            right: "0",
            bottom: "0",
            left: "0",
         },
      });
   } finally {
      await browser?.close();
   }
}
