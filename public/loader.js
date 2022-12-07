customElements.whenDefined("tf-mastodon-loader").then(() => {
  /** @type { any } */
  const appLoader = document.createElement("tf-mastodon-loader");
  appLoader.total = 9;
  document.body.appendChild(appLoader);

  /** @type { any } */
  const $w = window;
  $w.loader = appLoader;
});
