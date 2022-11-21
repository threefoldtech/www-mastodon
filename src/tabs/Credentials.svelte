<svelte:options tag="tf-credentials-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  import { Input } from "tf-svelte-bulma-wc";
  import { getGrid, Session } from "../utils";
  import Qrcode from "../components/Qrcode.svelte";
  import { onMount } from "svelte";

  export let show: boolean;
  export let mastodon: MastodonForm;
  let twinId: number;

  let __init = false;
  $: mastodon$ = $mastodon;
  $: if (mastodon) {
    mastodon$;

    if (__init) {
      Session.write(Session.Keys.Credentials, mastodon.value);
    } else {
      requestAnimationFrame(() => {
        __init = true;
        const value = Session.read(Session.Keys.Credentials);
        if (value) {
          mastodon.get("mnemonics").setValue(value.mnemonics);
          mastodon.get("sshKey").setValue(value.sshKey);
        }
      });
    }
  }

  $: valid = mastodon ? mastodon$.value.mnemonics.valid : false;
  $: if (valid) {
    getGrid(mastodon$.value.mnemonics.value)
      .then((grid) => grid.twins.get_my_twin_id())
      .then((t) => (twinId = t));
  }
</script>

{#if mastodon}
  <section style:display={show ? "initial" : "none"}>
    <Input
      label="Mnemonics"
      placeholder="Mnemonics"
      type="password"
      controller={mastodon.get("mnemonics")}
      loading={mastodon$.value.mnemonics.pending}
      disabled={mastodon$.value.mnemonics.pending}
      validation={!mastodon$.value.mnemonics.pending}
      hint={mastodon$.value.mnemonics.pending
        ? "Validating mnemonics..."
        : undefined}
    />

    <Input
      label="Public SSH Key"
      type="textarea"
      placeholder="Your public SSH Key"
      controller={mastodon.get("sshKey")}
    />

    {#if valid && twinId}
      <Qrcode
        data="TFT:GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG?message=twin_{twinId}&sender=me&amount=100"
      />
    {/if}
  </section>
{/if}
