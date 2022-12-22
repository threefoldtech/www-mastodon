<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { MastodonForm } from "../Mastodon.svelte";
  import { findNodes, getErrorFromCtx, isNodeUp } from "../utils";
  const { Select } = window.tfSvelteBulmaWc;
  const { fb, FormGroup, validators } = window.tfSvelteRxForms;
  import debounce from "lodash/debounce.js";
  import type { Unsubscriber } from "tf-svelte-rx-forms/dist/internals/rx_store";
  import type { NodeInfo } from "grid3_client/dist/node";
  import { regions } from "../regions";
  const { default: TFGridGqlClient } = window.tfgridGql;
  import type { FormControl, FormGroup } from "tf-svelte-rx-forms";
  import type { Networks } from "tfgrid-gql";

  export let mastodon: MastodonForm;
  const controller = fb.control<number>(
    null,
    [getErrorFromCtx, validators.required("Node ID is required.")],
    [isNodeUp]
  );

  let farmId = fb.control<number>(null, [getErrorFromCtx]);
  let nodes: NodeInfo[] = [];
  let farms: { name: string; farmID: number }[] = [];

  const loadNodes = debounce(
    async (
      form: FormGroup<{
        cru: FormControl<number>;
        mru: FormControl<number>;
        sru: FormControl<number>;
        publicIPs: FormControl<boolean>;
        region: FormControl<string>;
        certified: FormControl<boolean>;
        farmId: FormControl<number>;
      }>
    ) => {
      nodes = [];
      loading = true;
      form.setDisabled(true);
      const nodeId = controller.value;
      controller.setValue(null);
      farmId = form.get("farmId");
      const filters = form.value;
      delete filters.region;
      filters.mru /= 1024;
      // delete filters.farmId;

      nodes = await findNodes(mastodon.value.mnemonics, filters);
      if (farmId.value) {
        nodes = nodes.filter((node) => node.farmId === farmId.value);
        if (nodes.length === 0) {
          const error = `No nodes satisfy the requirement with farm(${farmId.value}) were found.`;
          controller.setValue(null, { error });
          if (farmId.getValue().error !== error) {
            farmId.setValue(farmId.value, { error });
          }
        }
      }

      if (form.get("certified").value) {
        nodes = nodes.filter((node) => node.certificationType === "Certified");
        if (nodes.length === 0) {
          const error = "No certified nodes were found.";
          controller.setValue(null, { error });
          if (form.get("certified").getValue().error !== error)
            form.get("certified").setValue(true, { error });
        }
      }

      const region = form.get("region").value;
      if (region !== null) {
        const allowedCountried = regions[region];
        nodes = nodes.filter((node) =>
          allowedCountried?.includes(node.location.country)
        );

        if (nodes.length === 0) {
          const error = `No nodes were found in '${region}' region.`;
          controller.setValue(null, { error });
          if (form.get("region").getValue().error !== error) {
            form.get("region").setValue(region, { error });
          }
        }
      }

      if (nodes.some((n) => n.nodeId === nodeId)) {
        controller.setValue(nodeId);
      } else if (nodes.length > 0) {
        controller.setValue(nodes[0].nodeId);
      }

      controller.markAsTouched();
      controller.markAsDirty();
      loading = false;
      form.setDisabled(false);
    },
    1500
  );

  async function loadFarms() {
    const gql = new TFGridGqlClient(window.config.network as Networks);

    const where = { updatedAt_gt: Date.now() - 1 * 60 * 60 * 1000 };
    const orderBy: ["nodeID_ASC"] = ["nodeID_ASC"];

    const { totalCount: limit } = await gql.nodesConnection(
      { totalCount: true },
      { where, orderBy }
    );

    farms =
      limit === 0
        ? []
        : await gql
            .nodes({ farmID: true }, { where, orderBy, limit })
            .then((nodes) => {
              return gql.farms(
                { name: true, farmID: true },
                {
                  where: {
                    farmID_in: Array.from(new Set(nodes.map((n) => n.farmID))),
                  },
                  orderBy: ["farmID_ASC"],
                }
              );
            });

    farmLoaded = true;
    loadNodes(f);
  }

  let loading: boolean = false;
  let farmLoaded: boolean = false;
  let unsubscribe: Unsubscriber;
  let f: any;
  onDestroy(() => unsubscribe?.());
  onMount(async () => {
    await loadFarms();

    f = new FormGroup({
      cru: mastodon.get("cpu"),
      mru: mastodon.get("memory"),
      sru: mastodon.get("disk"),
      publicIPs: mastodon.get("ipv4"),
      region: mastodon.get("region"),
      certified: mastodon.get("certified"),
      farmId,
    });
    unsubscribe = f.subscribe(() => {
      if (farmLoaded) {
        loading = true;
        mastodon.get("nodeId").setValue(null);
        loadNodes(f);
      }
    });
  });

  $: controller$ = $controller;
  $: if (mastodon && controller$.valid) {
    mastodon.get("nodeId").setValue(controller$.value);
    mastodon.get("nodeId").markAsDirty();
  }
</script>

{#if mastodon}
  <Select
    label="Select farm id"
    options={[
      { label: "All", value: null },
      ...farms.map((f) => ({
        label: `${f.name}(${f.farmID})`,
        value: f.farmID,
      })),
    ]}
    controller={farmId}
    loading={!farmLoaded}
    disabled={!farmLoaded}
  />

  <Select
    label="Select Node ID"
    placeholder="Select Node ID to deploy"
    validation={!loading && !controller$.pending}
    loading={loading || controller$.pending}
    disabled={loading || controller$.pending}
    {controller}
    options={nodes.map((node) => ({
      label: `Node ID(${node.nodeId})`,
      value: node.nodeId,
    }))}
    hint={controller$.pending ? "Checking node status (Up/Down)..." : undefined}
  />
{/if}
