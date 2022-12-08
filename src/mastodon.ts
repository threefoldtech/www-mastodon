// without any split
// import "grid3_client";
// import "./Mastodon.svelte";
import "./components/AppLoader.svelte";

const appLoader: any = document.createElement("tf-app-loader");
appLoader.total = 10;
document.body.append(appLoader);

function download(name: string) {
  const msg = `Downloading ${name}...`;
  console.log(msg);
  appLoader.setMessage(msg);
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

  appLoader.remove();
}

main();
