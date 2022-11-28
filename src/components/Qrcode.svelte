<svelte:options tag="tf-qrcode" />

<script lang="ts">
  const qrcode = window.qrcode;

  export let data: string = "hello world";
  let loading = false;
  let src: string;

  async function createQrcode() {
    loading = true;
    src = await qrcode.toDataURL(data, { width: 250 });
    loading = false;
  }

  const downloads = [
    {
      src: "android.svg",
      alt: "play-store",
      url: "https://play.google.com/store/apps/details?id=org.jimber.threebotlogin&hl=en&gl=US",
    },
    {
      src: "ios.svg",
      alt: "app-store",
      url: "https://apps.apple.com/us/app/threefold-connect/id1459845885",
    },
  ];

  $: if (data) createQrcode();
</script>

<div class="mt-5 is-block">
  {#if loading}
    <p>Loading...</p>
  {:else if !data}
    <p>Please Pass some data</p>
  {:else if src}
    <h4 class="has-text-centered has-text-weight-bold">
      Scan QRcode using <a
        target="_blank"
        href="https://library.threefold.me/info/threefold#/tokens/threefold__threefold_connect"
        rel="noreferrer"
      >
        Threefold connect
      </a> to fund your account
    </h4>
    <div class="is-flex is-justify-content-center">
      <img {src} alt="qrcode" />
    </div>
    <div class="has-text-centered">
      {#each downloads as { src, alt, url }, index}
        <img
          {src}
          width="150"
          {alt}
          class:mr-2={index === 0}
          style:cursor="pointer"
          on:mousedown={() => window.open(url, "_blank")}
        />
      {/each}
    </div>
  {/if}
</div>
