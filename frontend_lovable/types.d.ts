// Global type shims to satisfy TypeScript for config and external tooling modules.
// These are intentionally loose (`any`) and only used for tooling / configs.

declare module "react-router-dom";
declare module "@vitejs/plugin-react-swc";
declare module "lovable-tagger";
declare module "tailwindcss";
declare module "path";

// Node-style globals used in Vite/Tailwind configs
declare const __dirname: string;
declare function require(name: string): any;



