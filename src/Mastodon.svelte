<svelte:options tag="tf-mastodon" />

<script context="module" lang="ts">
  const { Tabs, btn } = window.tfSvelteBulmaWc;
  const { fb, validators } = window.tfSvelteRxForms;
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
  } from "./utils";
  import Basic from "./tabs/Basic.svelte";

  export type MastodonForm = any;
</script>

<script lang="ts">
  import MastodonModal from "./components/MastodonModal.svelte";
  import PriceCalculator from "./components/PriceCalculator.svelte";
  import { onMount } from "svelte";
  import type { FormGroupValue } from "tf-svelte-rx-forms/dist/types";
  const { Input } = window.tfSvelteBulmaWc;
  const { form } = window.tfSvelteRxForms;

  export let provider: string;
  const mastodon = fb.group({
    mnemonics: [
      "",
      [validators.required("Mnemonics is required."), isMnemonics],
      [
        async (ctrl) => {
          try {
            await getGrid(ctrl.value);
          } catch {
            return { message: "Couldn't load grid using these mnemonic." };
          }
        },
      ],
    ],
    sshKey: [
      "",
      [
        validators.required("Public SSH Key is required."),
        isValidSSH("Public SSH Key doesn't seem to be valid."),
      ],
    ],

    name: [
      generateString(5, "md"),
      [
        validators.required("Mastodon instance's name is required."),
        validators.minLength("Name must be at least 2 chars.", 2),
        validators.maxLength("Name maxLength is 15 chars.", 15),
      ],
    ],
    cpu: [
      2,
      [
        validators.required("Cpu is required."),
        validators.isInt("Cpu must be a valid integer.", {
          allow_leading_zeroes: false,
        }),
        validators.min("Cpu min cores is 1.", 1),
        validators.max("Cpu max cores is 32.", 32),
      ],
    ],
    memory: [
      4096,
      [
        validators.required("Memory is required."),
        validators.isInt("Memory must be a valid integer.", {
          allow_leading_zeroes: false,
        }),
        validators.min("Minimum allowed memory is 256 MB.", 256),
        validators.max("Maximum allowed memory is 256 GB.", 262144),
      ],
    ],
    disk: [
      100,
      [
        validators.required("Disk is required."),
        validators.isInt("Disk must be a valid integer.", {
          allow_leading_zeroes: false,
        }),
        validators.min("Minimum allowed disk size is 10 GB.", 10),
        validators.max("Maximum allowed disk size is 10000 GB.", 10000),
      ],
    ],
    planetary: [true],
    ipv4: [false],
    gateway: [null as string, [validators.required("Gateway is required.")]],
    nodeId: [null as number, [validators.required("Node ID is required.")]],

    admin: fb.group({
      email: [
        "",
        [
          validators.required("Admin Email is required."),
          validators.isEmail("Invalid email format.", { require_tld: true }),
        ],
      ],
      username: [
        "admin",
        [
          validators.required("Admin Username is required."),
          validators.minLength("Username must be at least 2 chars.", 2),
          validators.maxLength("Username can't pass 15 chars.", 15),
        ],
      ],
      password: [
        generateString(15),
        [
          validators.required("Admin Password is required."),
          validators.minLength("Admin password must be at least 6 chars.", 6),
          validators.maxLength("Admin Password can't pass 15 chars.", 15),
        ],
      ],
    }),

    smtp: fb.group({
      enable: [false],
      email: [
        "",
        [
          validators.isEmail("Invalid email format.", {
            require_tld: true,
          }),
        ],
      ],
      password: [
        generateString(15),
        [
          validators.minLength("SMTP password must be at least 6 chars.", 6),
          validators.maxLength("SMTP Password can't pass 15 chars.", 15),
        ],
      ],
      server: [
        "",
        [validators.isURL("Invalid SMTP server.", { require_tld: true })],
      ],
      port: [null as number, [validators.isPort("Invalid SMTP port.")]],
    }),

    region: [null as string],

    certified: [false],

    tfConnect: [false],
  });

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
      });

      await deployGateway({
        domainName,
        mnemonics: value.mnemonics,
        planetaryIp: vm[0]["planetary"] as string,
        publicNodeId: +publicNodeId,
        solutionProviderID: +provider,
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
