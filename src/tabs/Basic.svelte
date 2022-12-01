<svelte:options tag="tf-basic-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  const { Input, Select, CheckBox } = window.tfSvelteBulmaWc;

  export let show: boolean;
  export let mastodon: MastodonForm;
</script>

{#if mastodon}
  <section style:display={show ? "initial" : "none"}>
    <Input
      label="Mastodon Instance Name"
      sublabel="Instance name is used for managing the deployed instance and to create a subdomain"
      placeholder="Instance name is used for managing the deployed instance and to create a subdomain"
      controller={mastodon.get("name")}
    />

    <Input
      label="Admin Email"
      placeholder="Admin Email"
      controller={mastodon.get("admin").get("email")}
    />

    <Select
      label="Region"
      controller={mastodon.get("region")}
      options={[
        { label: "All", value: null },
        ...[
          "Asia",
          "Europe",
          "Africa",
          "Oceania",
          "Americas",
          "Polar",
          "Antarctic Ocean",
          "Antarctic",
        ].map((r) => ({ label: r, value: r })),
      ]}
    />

    <b-tooltip
      class:is-block={true}
      class:mb-2={true}
      tooltip="Enable ThreeFold Connect on your Mastodon instance."
      flow="right"
    >
      <CheckBox
        label="Enable ThreeFold Connect"
        controller={mastodon.get("tfConnect")}
      />
    </b-tooltip>

    <b-tooltip
      tooltip="Deploys your instance on a Certified Threefold Node."
      flow="right"
    >
      <CheckBox label="Certified" controller={mastodon.get("certified")} />
    </b-tooltip>
  </section>
{/if}
