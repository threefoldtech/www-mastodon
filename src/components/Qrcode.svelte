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
        href="https://play.google.com/store/apps/details?id=org.jimber.threebotlogin&hl=en&gl=US&pli=1"
        rel="noreferrer"
      >
        Threefold connect
      </a> to fund your account
    </h4>
    <div class="is-flex is-justify-content-center">
      <img {src} alt="qrcode" />
    </div>
  {/if}
</div>
