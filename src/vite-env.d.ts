/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FILES_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_EMAIL_SERVICE_ID?: string;
  readonly VITE_EMAIL_TEMPLATE_ID?: string;
  readonly VITE_EMAIL_PUBLIC_KEY?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
