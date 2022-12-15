/// <reference types="svelte" />
/// <reference types="vite/client" />

import type * as grid3_client from "grid3_client/dist/node";
import type * as tfSvelteBulmaWc from "tf-svelte-bulma-wc";
import type * as tfSvelteRxForms from "tf-svelte-rx-forms";
import type * as tsRmbHttpClient from "ts-rmb-http-client";
import type * as webSshKeygen from "web-ssh-keygen";
import type * as tfgridGql from "tfgrid-gql";
import type qrcode from "qrcode";
import type MastodonList from "./MastodonList.svelte";
import type * as polkadot_api from "@polkadot/api";

declare global {
  interface Window {
    grid3_client: typeof grid3_client;
    tfSvelteBulmaWc: typeof tfSvelteBulmaWc;
    tfSvelteRxForms: typeof tfSvelteRxForms;
    tsRmbHttpClient: typeof tsRmbHttpClient;
    webSshKeygen: typeof webSshKeygen;
    tfgridGql: typeof tfgridGql;
    qrcode: typeof qrcode;
    mastodonList?: MastodonList;
    polkadot_api: typeof polkadot_api;

    config: {
      network: string;
    };
  }
}
