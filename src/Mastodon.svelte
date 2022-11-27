<svelte:options tag="tf-mastodon" />

<script context="module" lang="ts">
  const { Tabs, btn } = window.tfSvelteBulmaWc;
  const { events } = window.grid3_client;

  import Credentials from "./tabs/Credentials.svelte";
  import Advanced from "./tabs/Advanced.svelte";
  import {
    generateString,
    getGrid,
    deployVM,
    isValidSSH,
    checkNode,
    getDomainName,
    deployGateway,
    isMnemonics,
    mastodon,
  } from "./utils";
  import Basic from "./tabs/Basic.svelte";

  export type MastodonForm = typeof mastodon;
</script>

<script lang="ts">
  import MastodonModal from "./components/MastodonModal.svelte";
  import PriceCalculator from "./components/PriceCalculator.svelte";

  export let provider: string;

  let active = "credentials";
  $: mastodon$ = $mastodon;
  $: console.log(mastodon$.value.mnemonics);
  $: mnemonics = mastodon$.value.mnemonics;
  $: sshKey = mastodon$.value.sshKey;
  $: validCredentials = mnemonics.valid && sshKey.valid;

  let __sshKey: string;
  let __mnemonics: string;
  $: if (
    mnemonics.valid &&
    sshKey.valid &&
    (sshKey.value !== __sshKey || mnemonics.value !== __mnemonics)
  ) {
    __sshKey = sshKey.value;
    __mnemonics = mnemonics.value;

    const key = "metadata";
    const value = JSON.stringify({ sshkey: __sshKey });

    getGrid(__mnemonics).then(async (grid) => {
      const val: string = await grid.kvstore.get({ key });
      if (val !== "") return;
      await grid.kvstore.set({ key, value });
    });
  }

  let __read = false;
  $: if (mnemonics.valid && !sshKey.valid && !__read) {
    __read = true;

    const key = "metadata";

    getGrid(mnemonics.value).then(async (grid) => {
      const value = await grid.kvstore.get({ key });
      if (value !== "") {
        mastodon.get("sshKey").setValue(JSON.parse(value).sshkey);
      }
    });
  }

  let deploying = false;
  let error = false;
  let success = false;
  let message = "";
  let deployedData: any;
  async function onDeploy() {
    deploying = true;
    error = false;
    success = false;
    const { value } = mastodon;

    try {
      events.addListener("logs", (msg: any) => (message = msg));

      message = `Checking the status of Node(${value.nodeId})`;
      await checkNode(value.mnemonics, value.nodeId);
      message = `Node(${value.nodeId}) is online`;

      const domainName = await getDomainName(value.mnemonics, value.name);
      const [publicNodeId, nodeDomain] = value.gateway.split(":");

      const vm = await deployVM({
        ...mastodon.value,
        image: {
          flist:
            "https://hub.grid.tf/omda.3bot/mahmoudemmad-mastodon-latest.flist",
          entryPoint: "/sbin/zinit init",
        },
        rootFsSize: 2,
        disks: [
          {
            name: generateString(15, "disk"),
            mountPoint: "/var/lib/docker",
            size: value.disk,
          },
        ],
        envs: [
          { key: "LOCAL_DOMAIN", value: `${domainName}.${nodeDomain}` },
          { key: "SUPERUSER_USERNAME", value: value.admin.username },
          { key: "SUPERUSER_EMAIL", value: value.admin.email },
          { key: "SUPERUSER_PASSWORD", value: value.admin.password },
          { key: "SSH_KEY", value: value.sshKey },
          { key: "IS_TF_CONNECT", value: `${value.tfConnect}` },
          ...(value.smtp.enable
            ? [
                { key: "SMTP_SERVER", value: value.smtp.server },
                { key: "SMTP_LOGIN", value: value.smtp.email },
                { key: "SMTP_PASSWORD", value: value.smtp.password },
                { key: "SMTP_PORT", value: value.smtp.port.toString() },
              ]
            : []),
        ],
        solutionProviderID: +provider,
        metadata: JSON.stringify({
          type: "vm",
          name: mastodon.value.name,
          projectName: "Mastodon",
        }),
      });

      await deployGateway({
        domainName,
        mnemonics: value.mnemonics,
        planetaryIp: vm[0]["planetary"] as string,
        publicNodeId: +publicNodeId,
        solutionProviderID: +provider,
        metadata: JSON.stringify({
          type: "gateway",
          name: domainName,
          projectName: "Mastodon",
        }),
      });

      deployedData = vm;
      success = true;
    } catch (e) {
      message = e.message;
      error = true;
    }

    events.removeAllListeners("logs");
  }
</script>

<b-box>
  <b-content>
    <h2>Deploy a Mastodon Instance</h2>
    <p>
      Mastodon is free and open-source software for running self-hosted social
      networking services. It has microblogging features similar to the Twitter
      service, which are offered by a large number of independently run nodes,
      known as instances, each with its own code of conduct, terms of service,
      privacy options, and moderation policies.
    </p>
    <PriceCalculator {mastodon} />
    <hr />
  </b-content>
  <section class:d-none={deploying}>
    <Tabs
      bind:active
      tabs={[
        { id: "credentials", label: "Credentials" },
        ...(validCredentials
          ? [
              { id: "basic", label: "Basic" },
              { id: "advanced", label: "Advanced" },
            ]
          : []),
      ]}
    />
  </section>

  <form on:submit|preventDefault={onDeploy}>
    <section class:d-none={deploying}>
      <Credentials
        {mastodon}
        show={active === "credentials"}
        loadSSH={mnemonics.valid && !sshKey.valid && !__read}
      />

      {#if validCredentials}
        <Basic {mastodon} show={active === "basic"} />
        <Advanced {mastodon} show={active === "advanced"} />
      {/if}
    </section>

    <section class:d-none={!deploying}>
      <b-notification
        color={error ? "danger" : success ? "success" : "info"}
        light
      >
        [+] {message || "Loading.."}.
      </b-notification>
    </section>

    <b-btns align="right" class:mt-2={true}>
      <button
        use:btn={{
          color: deploying ? "info" : "primary",
          loading: deploying && !error && !success,
        }}
        type={deploying ? "button" : "submit"}
        disabled={!mastodon$.valid || (deploying && !error && !success)}
        on:click={deploying
          ? (e) => {
              e.preventDefault();
              deploying = false;
              success = false;
              error = false;
            }
          : undefined}
      >
        {deploying ? "Back" : "Deploy"}
      </button>
    </b-btns>
  </form>

  {#if deployedData}
    <MastodonModal
      on:close={() => (deployedData = undefined)}
      data={deployedData}
    />
  {/if}
</b-box>
