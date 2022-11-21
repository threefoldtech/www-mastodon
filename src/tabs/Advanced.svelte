<svelte:options tag="tf-advanced-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  import { Input, CheckBox } from "tf-svelte-bulma-wc";
  import SelectNodeId from "../components/SelectNodeId.svelte";
  import SelectGateway from "../components/SelectGateway.svelte";

  export let show: boolean;
  export let mastodon: MastodonForm;
</script>

{#if mastodon}
  <section style:display={show ? "initial" : "none"}>
    <Input
      label="CPU (vCores)"
      placeholder="CPU in vCores"
      type="number"
      controller={mastodon.get("cpu")}
    />

    <Input
      label="Memory (MB)"
      placeholder="Memory in MB"
      type="number"
      controller={mastodon.get("memory")}
    />

    <Input
      label="Disk (GB)"
      placeholder="Disk in GB"
      type="number"
      controller={mastodon.get("disk")}
    />

    <CheckBox
      label="Planetary Network"
      controller={mastodon.get("planetary")}
    />
    <CheckBox label="Public IPv4" controller={mastodon.get("ipv4")} />
    <CheckBox label="Public IPv6" controller={mastodon.get("ipv6")} />

    <SelectGateway {mastodon} />

    <SelectNodeId {mastodon} />

    <Input
      label="Admin Username"
      placeholder="Admin Username"
      controller={mastodon.get("admin").get("username")}
    />

    <Input
      label="Admin Password"
      placeholder="Admin Password"
      type="password"
      controller={mastodon.get("admin").get("password")}
    />
  </section>
{/if}
