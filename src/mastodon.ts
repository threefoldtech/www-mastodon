const globalStyles = document.createElement("style");
globalStyles.setAttribute("data-global-styles", "");
globalStyles.appendChild(
  document.createTextNode(`
    @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
    @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");
    @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap");

    .d-none {
      display: none !important;
    }

    :host {
      --main-purple: #6261fb;
      --main-purple-darken: #4747f0;
      --main-purple-lighten: #9c9cf0;
      --main-purple-lighten-2: #efeef0;
    }

    strong {
      color: inherit !important;
    }

    .button.is-primary {
      background-color: var(--main-purple);
    }

    .button.is-primary:hover {
      background-color: var(--main-purple-darken);
    }

    .button.is-primary.is-outlined {
      border-color: var(--main-purple);
      color: var(--main-purple);
    }

    .button.is-primary.is-outlined:hover,
    .button.is-primary.is-outlined:active,
    .button.is-primary.is-outlined:focus {
      color: #fff;
      background-color: var(--main-purple);
      border-color: transparent;
    }

    .button.is-primary.is-outlined:active,
    .button.is-primary.is-outlined:focus {
      box-shadow: 0 0 0 2px var(--main-purple-lighten);
    }

    .button.is-primary.is-outlined[disabled] {
      border-color: var(--main-purple);
    }

    .button.is-primary.is-outlined.is-loading::after {
      border-color: transparent transparent var(--main-purple)
        var(--main-purple) !important;
    }

    .input.is-success,
    .textarea.is-success,
    .select.is-success select,
    .select.is-success:not(:hover)::after {
      border-color: var(--main-purple) !important;
    }

    .icon-text.has-text-success {
      color: var(--main-purple) !important;
    }

    .switch__input:checked + .slider {
      background-color: var(--main-purple);
    }

    .notification.is-success.is-light {
      background-color: var(--main-purple-lighten-2);
      color: var(--main-purple);
    }

    .button.is-primary[disabled] {
      background-color: var(--main-purple);
    }
`)
);
document.head.appendChild(globalStyles);

function download(name: string) {
  const msg = `Downloading ${name}...`;
  (<any>window).loader?.setMessage(msg);
}

export async function main() {
  download("Polkadot Api");
  window.polkadot_api = await import("@polkadot/api");

  download("Grid3 Client");
  await import("grid3_client");

  download("Threefold Svelte Bulma Reactive Forms");
  window.tfSvelteRxForms = await import("tf-svelte-rx-forms");

  download("Threefold Svelte Bulma Web Components");
  window.tfSvelteBulmaWc = await import("tf-svelte-bulma-wc");

  download("Typescript RMB Http Client");
  window.tsRmbHttpClient = await import("ts-rmb-http-client");

  download("Web SSH Keygen");
  window.webSshKeygen = await import("web-ssh-keygen");

  download("threefold Grid Graphql");
  window.tfgridGql = await import("tfgrid-gql");

  download("QrCode");
  window.qrcode = await import("qrcode");

  download("Mastodon Weblet");
  await import("./Mastodon.svelte");

  download("Mastodon List Weblet");
  await import("./MastodonList.svelte");

  (<any>window).loader?.remove();
}

main();
