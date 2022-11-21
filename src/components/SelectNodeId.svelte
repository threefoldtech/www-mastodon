<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { MastodonForm } from "../Mastodon.svelte";
  import { findNodes, getGrid } from "../utils";
  import { Select } from "tf-svelte-bulma-wc";
  import { fb, FormControl, FormGroup, validators } from "tf-svelte-rx-forms";
  import debounce from "lodash/debounce.js";
  import type { Unsubscriber } from "tf-svelte-rx-forms/dist/internals/rx_store";
  import type {
    FarmInfo,
    FilterOptions,
    GridClient,
    NodeInfo,
  } from "grid3_client/dist/node";
  import TFGridGqlClient, { Networks } from "tfgrid-gql";

  export let mastodon: MastodonForm;
  const controller = fb.control<number>(null, [
    validators.required("Node ID is required."),
  ]);
  const farmName = fb.control<string>(null);
  const region = fb.control<string>(null);
  let nodes: NodeInfo[] = [];
  let farms: FarmInfo[] = [];
  let regions: string[] = [];

  const loadNodes = debounce(
    async (
      form: FormGroup<{
        cru: FormControl<number>;
        mru: FormControl<number>;
        sru: FormControl<number>;
        publicIPs: FormControl<boolean>;
      }>
    ) => {
      nodes = [];
      loading = true;
      form.setDisabled(true);
      const nodeId = controller.value;
      controller.setValue(null);

      const filters: FilterOptions = form.value;
      filters.mru /= 1024;
      nodes = await findNodes(mastodon.value.mnemonics, filters);

      if (nodes.some((n) => n.nodeId === nodeId)) {
        controller.setValue(nodeId);
      } else if (nodes.length > 0) {
        controller.setValue(nodes[0].nodeId);
      }

      loading = false;
      form.setDisabled(false);
    },
    1500
  );

  //   async function loadRegions(grid: GridClient) {
  //     const gql = new TFGridGqlClient(grid.network as unknown as Networks);
  //     const countries = await gql.countries({ subregion: true });
  //     regions = Array.from(new Set(countries.map((c) => c.subregion)));
  //     regionLoaded = true;
  //   }

  async function loadFarms(grid: GridClient) {
    farms = await grid.capacity.getAllFarms();
    farmLoaded = true;
    loadNodes(f);
  }

  let loading: boolean = false;
  let farmLoaded: boolean = false;
  let regionLoaded: boolean = true;
  let unsubscribe: Unsubscriber;
  let f: any;
  onDestroy(() => unsubscribe?.());
  onMount(async () => {
    const grid = await getGrid(mastodon.value.mnemonics);
    // loadRegions(grid);
    loadFarms(grid);
  });
  onMount(() => {
    f = new FormGroup({
      cru: mastodon.get("cpu"),
      mru: mastodon.get("memory"),
      sru: mastodon.get("disk"),
      publicIPs: mastodon.get("ipv4"),
      farmName,
    });
    unsubscribe = f.subscribe(() => {
      if (farmLoaded && regionLoaded) {
        loading = true;
        mastodon.get("nodeId").setValue(null);
        loadNodes(f);
      }
    });
  });

  $: controller$ = $controller;
  $: if (mastodon && controller$.valid) {
    mastodon.get("nodeId").setValue(controller$.value);
  }
</script>

{#if mastodon}
  <Select
    label="Select a farm"
    options={[
      { label: "Select a farm", value: null },
      ...farms.map((f) => ({ label: f.name, value: f.name })),
    ]}
    controller={farmName}
    validation={false}
    loading={!farmLoaded}
    disabled={!farmLoaded}
  />

  <!-- <Select
    label="Select a region"
    options={[{ label: "Select a region", value: null }].concat(
      regions.map((r) => ({ label: r, value: r }))
    )}
    controller={region}
    validation={false}
    loading={!regionLoaded}
    disabled={!regionLoaded}
  /> -->

  <Select
    label="Select Node ID"
    placeholder="Select Node ID to deploy"
    validation={!loading}
    {loading}
    disabled={loading}
    {controller}
    options={nodes.map((node) => ({
      label: `Node ID(${node.nodeId})`,
      value: node.nodeId,
    }))}
  />
{/if}
