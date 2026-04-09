import { createServer } from "vite";
import { createSupadeckViteConfig } from "../runtime/vite-config.js";

interface RunDevServerOptions {
   deckPath: string;
   port?: number;
   open?: boolean;
   themeOverride?: string;
}

export async function runDevServer({
   deckPath,
   port,
   open,
   themeOverride,
}: RunDevServerOptions) {
   const server = await createServer(
      createSupadeckViteConfig({
         deckPath,
         port,
         open,
         themeOverride,
      })
   );

   await server.listen();
   server.printUrls();
}
