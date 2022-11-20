/// <reference types="svelte" />
/// <reference types="vite/client" />

import type * as grid3_client from "grid3_client/dist/node";

declare global {
  interface Window {
    grid3_client: GridClient;
  }
}
