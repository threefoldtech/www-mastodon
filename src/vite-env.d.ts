/// <reference types="svelte" />
/// <reference types="vite/client" />

import type * as bip39 from "bip39";
import type * as grid3_client from "grid3_client/dist/node";
import type * as tfSvelteBulmaWc from "tf-svelte-bulma-wc";
import type * as tfSvelteRxForms from "tf-svelte-rx-forms";
import type * as tsRmbHttpClient from "ts-rmb-http-client";
import type * as webSshKeygen from "web-ssh-keygen";
import type * as tfgridGql from "tfgrid-gql";
import type qrcode from "qrcode";

declare global {
  interface Window {
    grid3_client: typeof grid3_client;
    bip39: typeof bip39;
    tfSvelteBulmaWc: typeof tfSvelteBulmaWc;
    tfSvelteRxForms: typeof tfSvelteRxForms;
    tsRmbHttpClient: typeof tsRmbHttpClient;
    webSshKeygen: typeof webSshKeygen;
    tfgridGql: typeof tfgridGql;
    qrcode: typeof qrcode;
  }
}
