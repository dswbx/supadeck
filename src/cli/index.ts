#!/usr/bin/env node

import { realpathSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runDevServer } from "./serve.js";
import { runExport } from "./export.js";
import { ensureStarterDeck, resolveDeckPath } from "./workspace.js";

export interface CliOptions {
   open: boolean;
   create: boolean;
   port: number | undefined;
   output: string | undefined;
   theme: string | undefined;
   input: string | undefined;
}

export interface ParsedArguments {
   command: "dev" | "export";
   options: CliOptions;
}

export function parseArguments(argv: string[]): ParsedArguments {
   const args = [...argv];
   const command: ParsedArguments["command"] =
      args[0] === "export" ? "export" : "dev";
   if (command === "export") {
      args.shift();
   }

   const options: CliOptions = {
      open: false,
      create: true,
      port: undefined,
      output: undefined,
      theme: undefined,
      input: undefined,
   };

   while (args.length > 0) {
      const token = args.shift();
      if (!token) {
         continue;
      }

      if (token === "--open") {
         options.open = true;
         continue;
      }

      if (token === "--no-create") {
         options.create = false;
         continue;
      }

      if (token === "--port") {
         const value = args.shift();
         options.port = value ? Number(value) : undefined;
         continue;
      }

      if (token.startsWith("--port=")) {
         options.port = Number(token.slice("--port=".length));
         continue;
      }

      if (token === "--output") {
         options.output = args.shift();
         continue;
      }

      if (token.startsWith("--output=")) {
         options.output = token.slice("--output=".length);
         continue;
      }

      if (token === "--theme") {
         options.theme = args.shift();
         continue;
      }

      if (token.startsWith("--theme=")) {
         options.theme = token.slice("--theme=".length);
         continue;
      }

      if (token.startsWith("--")) {
         throw new Error(`Unknown option: ${token}`);
      }

      if (!options.input) {
         options.input = token;
         continue;
      }

      throw new Error(`Unexpected argument: ${token}`);
   }

   return { command, options };
}

export function isDirectCliInvocation(
   argvEntry = process.argv[1],
   moduleUrl = import.meta.url
): boolean {
   if (!argvEntry) {
      return false;
   }

   try {
      return realpathSync(argvEntry) === realpathSync(fileURLToPath(moduleUrl));
   } catch {
      return pathToFileURL(argvEntry).href === moduleUrl;
   }
}

async function main(): Promise<void> {
   const { command, options } = parseArguments(process.argv.slice(2));
   const deckPath = resolveDeckPath(
      options.input,
      process.cwd(),
      process.env.SUPADECK_DEFAULT_INPUT
   );

   if (command === "dev" && options.create) {
      await ensureStarterDeck(deckPath);
   }

   if (command === "export") {
      await runExport({
         deckPath,
         outputPath: options.output
            ? path.resolve(process.cwd(), options.output)
            : path.resolve(
                 path.dirname(deckPath),
                 `${path.basename(deckPath, path.extname(deckPath))}.pdf`
              ),
         themeOverride: options.theme,
      });
      return;
   }

   await runDevServer({
      deckPath,
      port: options.port,
      open: options.open,
      themeOverride: options.theme,
   });
}

if (isDirectCliInvocation()) {
   main().catch((error) => {
      console.error(
         `\n[supadeck] ${
            error instanceof Error ? error.message : String(error)
         }`
      );
      if (process.env.DEBUG) {
         console.error(error);
      }
      process.exitCode = 1;
   });
}
