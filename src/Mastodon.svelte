<svelte:options tag="tf-mastodon" />

<script context="module" lang="ts">
  const { Tabs, btn } = window.tfSvelteBulmaWc;
  const { fb, validators } = window.tfSvelteRxForms;
  const { validateMnemonic } = window.bip39;

  import Credentials from "./tabs/Credentials.svelte";
  import Advanced from "./tabs/Advanced.svelte";
  import {
    generateString,
    getGrid,
    deployVM,
    isValidSSH,
    checkNode,
  } from "./utils";
  import Basic from "./tabs/Basic.svelte";

  const mastodon = fb.group({
    mnemonics: [
      "",
      [
        validators.required("Mnemonics is required."),
        (ctrl) => {
          if (!validateMnemonic(ctrl.value)) {
            return { message: "Mnemonic doesn't seem to be valid." };
          }
        },
      ],
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
      generateString(15, "MD"),
      [
        validators.required("Mastodon instance's name is required."),
        validators.minLength("Name must be at least 2 chars.", 2),
        validators.maxLength("Name maxLength is 15 chars.", 15),
      ],
    ],
    cpu: [
      4,
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
    ipv6: [true],
    gateway: [null as number, [validators.required("Gateway is required.")]],
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
  });

  export type MastodonForm = typeof mastodon;
</script>

<script lang="ts">
  let active = "credentials";
  $: mastodon$ = $mastodon;
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

    const key = `dev.${__mnemonics}`;
    const value = __sshKey;

    getGrid(__mnemonics).then(async (grid) => {
      const val: string = await grid.kvstore.get({ key });
      if (val !== "") return;
      await grid.kvstore.set({ key, value });
    });
  }

  let __read = false;
  $: if (mnemonics.valid && !sshKey.valid && !__read) {
    __read = true;

    const key = `dev.${mnemonics.value}`;

    getGrid(mnemonics.value).then(async (grid) => {
      const value = await grid.kvstore.get({ key });
      if (value !== "") {
        mastodon.get("sshKey").setValue(value);
      }
    });
  }

  async function onDeploy() {
    console.log(mastodon.value);

    console.log({ checkNode: await checkNode(mastodon.value.nodeId) });

    // const { value } = mastodon;
    // deployVM({
    //   ...mastodon.value,
    //   image: {
    //     entryPoint: "/sbin/zinit init",
    //     flist:
    //       "https://hub.grid.tf/omda.3bot/mahmoudemmad-mastodon-latest.flist",
    //   },
    //   rootFsSize: value.disk,
    // }).then(console.log);
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
      privacy options, and moderation policies. <a
        href="https://library.threefold.me/info/manual/#/manual__weblets_mastodon"
        target="_blank"
        rel="noreferrer"
      >
        Quick start documentation
      </a>
    </p>
    <hr />
  </b-content>
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

  <form on:submit|preventDefault={onDeploy}>
    <Credentials
      {mastodon}
      show={active === "credentials"}
      loadSSH={mnemonics.valid && !sshKey.valid && !__read}
    />

    {#if validCredentials}
      <Basic {mastodon} show={active === "basic"} />
      <Advanced {mastodon} show={active === "advanced"} />
    {/if}

    <b-btns align="right" class:mt-2={true}>
      <button
        use:btn={{ color: "primary" }}
        type="submit"
        disabled={!mastodon$.valid}
      >
        Deploy
      </button>
    </b-btns>
  </form>
</b-box>
