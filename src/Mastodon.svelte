<svelte:options tag="tf-mastodon" />

<script context="module" lang="ts">
  import { Tabs } from "tf-svelte-bulma-wc";
  import { fb, validators } from "tf-svelte-rx-forms";
  import { validateMnemonic } from "bip39";

  import Credentials from "./tabs/Credentials.svelte";
  import Advanced from "./tabs/Advanced.svelte";

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
    ],
    enableSShKey: [false],
    sshKey: ["", [validators.required("Public SSH Key is required.")]],

    name: [
      "",
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
    gateway: [""],
    nodeId: [null as number, [validators.required("Node ID is required.")]],
  });

  export type MastodonForm = typeof mastodon;
</script>

<script lang="ts">
  let active = "advanced";
  $: mastodon$ = $mastodon;
  $: showConfigs =
    (mastodon$.value.mnemonics.valid && mastodon$.value.sshKey.valid) ||
    (mastodon$.value.mnemonics.valid && !mastodon$.value.enableSShKey.value);
</script>

<b-box>
  <Tabs
    bind:active
    tabs={[
      { id: "credentials", label: "Credentials" },
      ...(showConfigs
        ? [
            { id: "basic", label: "Basic" },
            { id: "advanced", label: "Advanced" },
          ]
        : []),
    ]}
  />

  <Credentials {mastodon} show={active === "credentials"} />

  {#if showConfigs}
    <section style:display={active === "basic" ? "initial" : "none"}>
      basic
    </section>

    <Advanced {mastodon} show={active === "advanced"} />
  {/if}
</b-box>
