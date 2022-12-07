const globalStyles = document.createElement("style");
globalStyles.setAttribute("data-global-styles", "");
globalStyles.appendChild(
  document.createTextNode(`
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");

  .d-none {
    display: none !important;
  }
`)
);
document.head.appendChild(globalStyles);

function download(name: string) {
  const msg = `Downloading ${name}...`;
  (<any>window).loader?.setMessage(msg);
}

export async function main() {
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
