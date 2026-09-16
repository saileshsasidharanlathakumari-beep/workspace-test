/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOCAL_ENGINE?: string;
  readonly VITE_PROGRAM_ID?: string;
  readonly VITE_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
