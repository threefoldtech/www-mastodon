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

{#if loading}
  <p>Loading...</p>
{:else if !data}
  <p>Please Pass some data</p>
{:else if src}
  <h4 class="has-text-centered has-text-weight-bold">
    Scan code using Threefold connect to send tokens
  </h4>
  <div class="is-flex is-justify-content-center">
    <img {src} alt="qrcode" />
  </div>
{/if}
