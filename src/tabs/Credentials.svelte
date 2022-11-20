<svelte:options tag="tf-credentials-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  import { Input, CheckBox } from "tf-svelte-bulma-wc";
  import { Session } from "../utils";

  export let show: boolean;
  export let mastodon: MastodonForm;

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
          mastodon.get("enableSShKey").setValue(value.enableSShKey);
          mastodon.get("sshKey").setValue(value.sshKey);
        }
      });
    }
  }
</script>

{#if mastodon}
  <section style:display={show ? "initial" : "none"}>
    <Input
      label="Mnemonics"
      placeholder="Mnemonics"
      type="password"
      controller={mastodon.get("mnemonics")}
    />

    <div class="is-flex">
      <div style:width="100%">
        <Input
          label="Public SSH Key"
          type="textarea"
          placeholder="Your public SSH Key"
          controller={mastodon.get("sshKey")}
          disabled={!mastodon$.value.enableSShKey.value}
          validation={mastodon$.value.enableSShKey.value}
        />
      </div>

      <div class="mt-6 ml-2">
        <b-tooltip
          tooltip="On disable the deployed solutions'll be inaccessible."
          flow="left"
        >
          <CheckBox controller={mastodon.get("enableSShKey")} />
        </b-tooltip>
      </div>
    </div>
  </section>
{/if}
