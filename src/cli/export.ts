import { build, preview } from "vite";
import { exportDeckToPdf } from "../export/pdf.js";
import { createSupadeckViteConfig } from "../runtime/vite-config.js";

interface RunExportOptions {
   deckPath: string;
   outputPath: string;
   themeOverride?: string;
}

export async function runExport({
   deckPath,
   outputPath,
   themeOverride,
}: RunExportOptions) {
   const config = createSupadeckViteConfig({
      deckPath,
      themeOverride,
      outputDirName: ".supadeck-dist",
   });

   await build(config);

   const previewServer = await preview({
      ...config,
      preview: {
         host: "127.0.0.1",
         port: 4173,
         strictPort: false,
      },
   });

   const urls = previewServer.resolvedUrls?.local ?? [];
   const baseUrl = urls[0];

   if (!baseUrl) {
      await previewServer.httpServer?.close();
      throw new Error("Unable to determine preview URL for PDF export.");
   }

   try {
      await exportDeckToPdf({
         url: `${baseUrl}?print=1`,
         outputPath,
      });
   } finally {
      await previewServer.httpServer?.close();
   }

   console.log(`[supadeck] PDF exported to ${outputPath}`);
}
