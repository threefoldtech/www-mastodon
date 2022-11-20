<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { MastodonForm } from "../Mastodon.svelte";
  import { findNodes } from "../utils";
  import { Select } from "tf-svelte-bulma-wc";
  import { fb, validators } from "tf-svelte-rx-forms";
  import debounce from "lodash/debounce.js";
  import type { Unsubscriber } from "tf-svelte-rx-forms/dist/internals/rx_store";

  export let mastodon: MastodonForm;
  const controller = fb.control<number>(null, [
    validators.required("Node ID is required."),
  ]);

  let unsubscribe: Unsubscriber;
  onDestroy(unsubscribe);
  onMount(() => {
    unsubscribe = mastodon.subscribe(
      debounce((value) => {
        findNodes(mastodon.value.mnemonics, {}).then(console.log);
      }, 1000)
    );
  });
</script>

{#if mastodon}
  <Select label="Select Node ID" {controller} />
{/if}
