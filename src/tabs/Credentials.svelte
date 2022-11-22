<svelte:options tag="tf-credentials-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  import { Input, btn } from "tf-svelte-bulma-wc";
  import { getGrid, Session } from "../utils";
  import Qrcode from "../components/Qrcode.svelte";
  import { HTTPMessageBusClient } from "ts-rmb-http-client";
  import { generateKeyPair } from "web-ssh-keygen";

  export let show: boolean;
  export let mastodon: MastodonForm;
  export let loadSSH: boolean;
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

  let creatingAccount = false;
  let createdMessage: string;
  async function onCreateAccount() {
    creatingAccount = true;
    const { GridClient, NetworkEnv } = window.grid3_client;
    const rmb = new HTTPMessageBusClient(0, "", "", "");
    const client = new GridClient(NetworkEnv.dev, "", "test", rmb);
    client._connect();
    const createdAccount = await client.tfchain.createAccount("::1");
    mastodon.get("mnemonics").setValue(createdAccount.mnemonic);
    await mastodon.get("mnemonics").validate();
    createdMessage = "Please make sure to buy some tfts.";
    creatingAccount = false;
  }

  let sshMessage: string;
  async function onGenerateSSH() {
    loadSSH = true;

    const keys = await generateKeyPair({
      alg: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
      name: "Threefold",
      size: 4096,
    });

    try {
      const grid = await getGrid(mastodon$.value.mnemonics.value);
      await grid.kvstore.set({
        key: `dev.${mastodon$.value.mnemonics.value}`,
        value: keys.publicKey,
      });
    } catch (e) {
      sshMessage = "Balance is not enough to store your Public SSH key.";
    }

    mastodon.get("sshKey").setValue(keys.publicKey);
    await mastodon.get("sshKey").validate();

    loadSSH = false;
  }
</script>

{#if mastodon}
  <section style:display={show ? "initial" : "none"}>
    <div class="is-flex is-jutify-content-center">
      <div style:width="100%">
        <Input
          label="Mnemonics"
          placeholder="Mnemonics"
          type="password"
          controller={mastodon.get("mnemonics")}
          disabled={mastodon$.value.mnemonics.pending || creatingAccount}
          validation={!mastodon$.value.mnemonics.pending && !creatingAccount}
          hint={mastodon$.value.mnemonics.pending
            ? "Validating mnemonics..."
            : createdMessage}
        />
      </div>
      <button
        type="button"
        class:ml-2={true}
        style:margin-top="30px"
        use:btn={{
          color: "info",
          size: "small",
          loading: mastodon$.value.mnemonics.pending || creatingAccount,
        }}
        on:click={onCreateAccount}
        disabled={valid || mastodon$.value.mnemonics.pending || creatingAccount}
      >
        Create Account
      </button>
    </div>

    <div class="is-flex is-jutify-content-center mb-2">
      <div style:width="100%">
        <Input
          label="Public SSH Key"
          type="textarea"
          placeholder="Your public SSH Key"
          controller={mastodon.get("sshKey")}
          disabled={loadSSH}
          loading={loadSSH}
          hint={sshMessage}
        />
      </div>

      <button
        type="button"
        class:ml-2={true}
        style:margin-top="30px"
        use:btn={{
          color: "info",
          size: "small",
          loading: loadSSH,
        }}
        on:click={onGenerateSSH}
        disabled={!valid || !twinId || mastodon$.value.sshKey.valid || loadSSH}
      >
        Generate Public SSH Key
      </button>
    </div>

    {#if valid && twinId}
      <Qrcode
        data="TFT:GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG?message=twin_{twinId}&sender=me&amount=100"
      />
    {/if}
  </section>
{/if}
