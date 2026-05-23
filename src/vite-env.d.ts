/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DEVELOPER_URL?: string
  readonly VITE_DEVELOPER_LABEL?: string
  /** כתובת האתר המפורסם (SEO, canonical) */
  readonly VITE_SITE_URL?: string
  /** קוד אימות מ-Google Search Console */
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
