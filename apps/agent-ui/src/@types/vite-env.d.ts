/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGENT_BASEPATH: string;
  /** When `"saas"`, appliance-only UI (e.g. inventory export) is hidden. */
  readonly VITE_UI_HOSTING?: "appliance" | "saas";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
