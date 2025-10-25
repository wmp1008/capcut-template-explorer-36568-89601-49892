import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-expect-error - vite-plugin-obfuscator types are declared in vite-env.d.ts
import obfuscatorPlugin from "vite-plugin-obfuscator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === "production" && obfuscatorPlugin({
      options: {
        stringArray: true,
        rotateStringArray: true,
        stringArrayThreshold: 0.75,
        stringArrayEncoding: ['base64'],
        splitStrings: true,
        splitStringsChunkLength: 10
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
