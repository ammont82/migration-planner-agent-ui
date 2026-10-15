/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGENT_BASEPATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
