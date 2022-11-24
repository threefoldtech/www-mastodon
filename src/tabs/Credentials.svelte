<svelte:options tag="tf-credentials-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  const { Input, btn } = window.tfSvelteBulmaWc;
  import { getGrid, Session } from "../utils";
  import Qrcode from "../components/Qrcode.svelte";
  const { HTTPMessageBusClient } = window.tsRmbHttpClient;
  const { generateKeyPair } = window.webSshKeygen;

  export let show: boolean;
  export let mastodon: MastodonForm;
  export let loadSSH: boolean;
  let twinId: number;

  let __init = false;
  $: mastodon$ = $mastodon;
  $: if (mastodon) {
    mastodon$;

    if (__init) {
      Session.write(Session.Keys.Credentials, mastodon.value.mnemonics);
    } else {
      requestAnimationFrame(() => {
        __init = true;
        const value = Session.read(Session.Keys.Credentials);
        if (value) {
          mastodon.get("mnemonics").setValue(value);
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
    const client = new GridClient(NetworkEnv.main, "", "test", rmb);
    client._connect();
    const createdAccount = await client.tfchain.createAccount("::1");
    mastodon.get("mnemonics").setValue(createdAccount.mnemonic);
    await mastodon.get("mnemonics").validate();
    createdMessage = "Please fund your account to be able to store ssh key";
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
        key: "metadata",
        value: JSON.stringify({ sshkey: keys.publicKey }),
      });
    } catch (e) {
      sshMessage = "Balance is not enough to store your Public SSH key.";
    }

    mastodon.get("sshKey").setValue(keys.publicKey);
    await mastodon.get("sshKey").validate();

    const data = `data:text/raw;charset=utf-8,${encodeURIComponent(
      keys.privateKey
    )}`;
    const a = document.createElement("a");
    a.download = "id_rsa";
    a.href = data;
    document.body.appendChild(a);
    a.click();
    a.remove();

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
            : "Please make sure to store your mnemonics somewhere safe to be able to access your deployments"}
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

    {#if valid && twinId}
      <Qrcode
        data="TFT:GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC?message=twin_{twinId}&sender=me&amount=100"
      />
    {/if}

    <div class="is-flex is-jutify-content-center mb-2">
      <div style:width="100%">
        <Input
          label="Public SSH Key"
          type="textarea"
          placeholder="Your public SSH Key"
          controller={mastodon.get("sshKey")}
          disabled={loadSSH || !!createdMessage || creatingAccount || !valid}
          loading={loadSSH}
          hint={createdMessage || sshMessage}
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
        Generate SSH Key
      </button>
    </div>
  </section>
{/if}
