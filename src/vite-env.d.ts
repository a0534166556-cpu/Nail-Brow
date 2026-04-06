/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DEVELOPER_URL?: string
  readonly VITE_DEVELOPER_LABEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
