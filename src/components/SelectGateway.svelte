<svelte:options tag="tf-select-gateway" />

<script lang="ts">
  import { onMount } from "svelte";
  const { Select } = window.tfSvelteBulmaWc;
  import type { MastodonForm } from "../Mastodon.svelte";
  import { getGateways } from "../utils";

  export let mastodon: MastodonForm;
  let gateways: [string, string][] = [];

  onMount(async () => {
    const gws = await getGateways(mastodon.value.mnemonics);
    gateways = Object.keys(gws).map((id) => {
      return [(gws[id] as any).domain, id + ":" + (gws[id] as any).domain];
    });
    if (gateways.length) {
      mastodon.get("gateway").setValue(gateways[0][1]);
    }
  });

  $: mastodon$ = $mastodon;
</script>

{#if mastodon}
  <Select
    label="Select Gateway Node"
    placeholder="Please select a gateway node"
    controller={mastodon.get("gateway")}
    options={gateways.map(([label, value]) => ({ label, value }))}
  />
{/if}
