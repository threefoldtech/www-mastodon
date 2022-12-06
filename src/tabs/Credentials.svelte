<svelte:options tag="tf-credentials-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  import { getGrid, noBalanceMessage, Session } from "../utils";
  import Qrcode from "../components/Qrcode.svelte";
  import type { NetworkEnv } from "grid3_client";
  
  export let show: boolean;
  export let mastodon: MastodonForm;
  // export let loadSSH: boolean;

  const { Input, btn } = window.tfSvelteBulmaWc;
  const { HTTPMessageBusClient } = window.tsRmbHttpClient;
  const { generateKeyPair } = window.webSshKeygen;


  let __init = false;
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

  let bridge =
    window.config.network === "main"
      ? "GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC"
      : window.config.network === "test"
      ? "GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4"
      : "GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG";
  let twinId: number;
  let __mnemonics2: string;
  $: if (isMnemonicsValid && __mnemonics2 !== mnemonics$.value) {
    __mnemonics2 = mnemonics$.value;
    getGrid(mastodon$.value.mnemonics.value)
      .then((grid) => grid.twins.get_my_twin_id())
      .then((t) => (twinId = t));
  }

  let accountCreationStatus: "None" | "Creating" | "Error" | "Done" = "None";
  let creationMsg: string;
  async function onCreateAccount() {
    try {
      accountCreationStatus = "Creating";
      const { GridClient } = window.grid3_client;
      const rmb = new HTTPMessageBusClient(0, "", "", "");
      const client = new GridClient(
        window.config.network as NetworkEnv,
        "",
        "test",
        rmb
      );
      client._connect();
      const createdAccount = await client.tfchain.createAccount("::1");
      mastodon.get("mnemonics").setValue(createdAccount.mnemonic);
      await mastodon.get("mnemonics").validate();
      creationMsg =
        "Please make sure to store your mnemonics somewhere safe to be able to access your deployments later on. There is no way for neither you nor ThreeFold nor anybody else to recover lost mnemonics.";
      accountCreationStatus = "Done";
    } catch (e) {
      accountCreationStatus = "Error";
      creationMsg = e;
    }
  }

  let sshInfoMessage: string;
  let readingSSH = false;
  let __ssh: string;
  let __mnemonics: string;
  let __1 = false;
  $: if (mnemonics$?.valid && !sshKey$?.valid && !readingSSH && !__1) {
    __1 = true;
    readingSSH = true;
    sshInfoMessage = "Reading Your SSH Key...";
    const key = "metadata";
    getGrid(mnemonics$.value)
      .then(async (grid) => {
        const value = await grid.kvstore.get({ key });
        if (value !== "") {
          requestAnimationFrame(() => {
            __ssh = JSON.parse(value).sshkey;
            mastodon.get("sshKey").setValue(__ssh);
          });
        }
      })
      .finally(() => (readingSSH = false));
  }

  let storingSSH = false;
  $: if (
    mnemonics$?.valid &&
    sshKey$?.valid &&
    (sshKey$?.value !== __ssh || mnemonics$?.value !== __mnemonics) &&
    !storingSSH
  ) {
    __ssh = sshKey$.value;
    __mnemonics = mnemonics$.value;
    storingSSH = true;
    sshInfoMessage = "Storing Your SSH Key...";

    getGrid(mnemonics$.value)
      .then((grid) => {
        return grid.kvstore.set({
          key: "metadata",
          value: JSON.stringify({ sshkey: __ssh }),
        });
      })
      .finally(() => (storingSSH = false));
  }

  let sshMessage: string;
  let generatingSSH = false;
  async function onGenerateSSH() {
    generatingSSH = true;
    sshInfoMessage = "Generating Your SSH Key...";

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
      sshMessage = e.message;
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

    generatingSSH = false;
  }

  $: mastodon$ = $mastodon;
  $: mnemonics$ = mastodon$?.value.mnemonics;
  $: sshKey$ = mastodon$?.value.sshKey;
  $: pending = mnemonics$?.pending;
  $: creating = accountCreationStatus === "Creating";
  $: isMnemonicsValid = mnemonics$
    ? mnemonics$.valid ||
      (!mnemonics$.valid && mnemonics$.error === noBalanceMessage)
    : false;
</script>

{#if mastodon}
  <section style:display={show ? "initial" : "none"}>
    <div class="is-flex is-jutify-content-center">
      <div style:width="100%">
        <Input
          label="Mnemonics"
          placeholder="Mnemonics"
          sublabel="Mnemonics are your private key. They are used to represent you on the ThreeFold Grid. You can paste existing mnemonics or click the 'Create Account' button to create an account and generate mnemonics."
          type="password"
          controller={mastodon.get("mnemonics")}
          disabled={pending || creating}
          validation={!(pending || creating)}
          hint={mnemonics$.pending
            ? "Validating mnemonics..."
            : accountCreationStatus === "Error"
            ? creationMsg
            : undefined}
          hintColor={mnemonics$.pending
            ? "info"
            : accountCreationStatus === "Error"
            ? "danger"
            : undefined}
        />
      </div>
      <button
        type="button"
        class:ml-2={true}
        style:margin-top="78px"
        use:btn={{
          color: "info",
          size: "small",
          loading: pending || creating,
        }}
        on:click={onCreateAccount}
        disabled={mnemonics$.valid || pending || creating}
      >
        Create Account
      </button>
    </div>
    {#if accountCreationStatus === "Done" && creationMsg}
      <b-notification color="warning" light class:my-2={true}>
        <b-icon icon="fa-sharp fa-solid fa-triangle-exclamation" />
        {creationMsg}
      </b-notification>
    {/if}

    {#if (mnemonics$.valid || (!mnemonics$.valid && mnemonics$.error === noBalanceMessage)) && twinId}
      <Qrcode data="TFT:{bridge}?message=twin_{twinId}&sender=me&amount=100" />
    {/if}

    <div class="is-flex is-jutify-content-center mb-2">
      <div style:width="100%">
        <Input
          label="Public SSH Key"
          type="textarea"
          placeholder="Your public SSH Key"
          sublabel="SSH Keys are used to authenticate you to the Mastodon instance for management purposes. If you don't have an SSH Key or are not familiar, we can generate one for you."
          controller={mastodon.get("sshKey")}
          loading={readingSSH || generatingSSH || storingSSH}
          disabled={!mnemonics$.valid || readingSSH || generatingSSH || storingSSH}
          hint={sshMessage ||
            (readingSSH || generatingSSH || storingSSH
              ? sshInfoMessage
              : undefined)}
          validation={!(readingSSH || generatingSSH || storingSSH)}
          hintColor={readingSSH || generatingSSH || storingSSH
            ? "info"
            : undefined}
        />
      </div>

      <button
        type="button"
        class:ml-2={true}
        style:margin-top="78px"
        use:btn={{
          color: "info",
          size: "small",
          loading: readingSSH || generatingSSH || storingSSH,
        }}
        on:click={onGenerateSSH}
        disabled={!mnemonics$.valid || readingSSH || generatingSSH || storingSSH || sshKey$.valid}
      >
        Generate SSH Key
      </button>
    </div>
  </section>
{/if}
