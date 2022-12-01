<svelte:options tag="tf-mastodon-list" />

<script lang="ts">
  import { get_current_component } from "svelte/internal";
  import MastodonModal from "./components/MastodonModal.svelte";
  import { getGrid, mastodon } from "./utils";
  const { Table, btn } = window.tfSvelteBulmaWc;
  import { Decimal } from "decimal.js";
  import type { Table } from "tf-svelte-bulma-wc";

  const mnemonics = mastodon.get("mnemonics");
  $: mnemonics$ = $mnemonics;

  window.mastodonList = get_current_component();

  let loading = false;
  let deployedData: any;
  let instances: any[] = [];
  let billingRate: any[] = [];

  async function listMastodon() {
    loading = true;
    const grid = await getGrid(mnemonics$.value);
    const names = await grid.machines.list();
    const items = names.map((n) => grid.machines.getObj(n).catch(() => null));
    let _instances: any[] = [];
    let _billingRate: any[] = [];
    let rates: any[] = [];
    for await (const item of items) {
      const i = item?.at(0);
      if (i) {
        _instances.push(i);
        rates.push(grid.contracts.getConsumption({ id: i.contractId }));
      }
    }
    for await (const item of rates) {
      const value = +item;
      _billingRate.push(
        isNaN(value) || value <= 0
          ? "No Data Available"
          : new Decimal(value).toFixed() + " TFT/hour"
      );
    }
    instances = _instances;
    billingRate = _billingRate;
    loading = false;
  }

  let __mnemonicsValid: boolean = false;
  $: if (mnemonics$.valid !== __mnemonicsValid) {
    __mnemonicsValid = mnemonics$.valid;
    if (mnemonics$.valid) listMastodon();
  }

  let selected: number[] = [];
  let deleting = false;
  let deletingIndex: number;
  let table: Table;
  async function onDelete(index?: number) {
    deleting = true;
    const indexs = typeof index === "number" ? [index] : selected;
    let __instances = table.rows.slice();
    const grid = await getGrid(mnemonics$.value);
    for (const index of indexs) {
      deletingIndex = index;
      await grid.contracts.cancel({ id: instances[index].contractId });
      table.unselect(index);
      __instances[index] = null;
    }
    table.rows = __instances.filter((x) => x !== null);
    instances = instances.filter((_, i) => __instances[i] !== null);
    deletingIndex = undefined;
    deleting = false;
  }

  export function reload() {
    listMastodon();
  }
</script>

<b-box>
  <b-content>
    <div class="is-flex is-justify-content-space-between is-align-items-center">
      <h2>Deployment List (Mastodon)</h2>
      <div>
        <button
          class:mr-2={true}
          use:btn={{ color: "primary", loading, size: "small" }}
          disabled={loading || deleting || !mnemonics$.valid}
          on:click={listMastodon}
        >
          <b-icon icon="fa-solid fa-arrows-rotate" />
          Reload
        </button>
        <button
          use:btn={{ color: "danger", loading: deleting, size: "small" }}
          disabled={deleting || selected.length === 0}
          on:click={() => onDelete()}
        >
          <b-icon icon="fa-solid fa-trash" />
          Delete
        </button>
      </div>
    </div>
    <hr />
  </b-content>

  {#if !mnemonics$.valid}
    <b-notification color="info" light>
      Please insert your mnemonics.
    </b-notification>
  {:else}
    {#if loading}
      <b-notification color="primary" light>
        Listing Deployments ...
      </b-notification>
    {:else if instances.length === 0}
      <b-notification color="info" light>
        No deployments were found.
      </b-notification>
    {:else}
      <div style:width="100%" style:overflow-x="auto">
        <Table
          bind:this={table}
          disabled={deleting}
          selectable
          fullwidth
          headers={[
            "name",
            "Public IPv4",
            "Planetary Network IP",
            "Flist",
            "Billing Rate",
          ]}
          position={false}
          rows={instances.map((i, index) => {
            const ip = i.publicIP?.ip;
            return [
              i.name,
              ip || "None",
              i.planetary,
              i.flist,
              billingRate[index],
            ];
          })}
          actions={[
            {
              label: "Show Details",
              click(e) {
                deployedData = instances[e.index];
              },
              color: "primary",
              icon: "fa-solid fa-eye",
              disabled: () => deleting,
            },
            {
              label: "Open",
              click(e) {
                window.open(
                  `https://${instances[e.index].env.LOCAL_DOMAIN}`,
                  "_blank"
                );
              },
              color: "link",
              icon: "fa-solid fa-link",
              disabled: () => deleting,
            },
            {
              label: "Delete",
              click: ({ index }) => onDelete(index),
              color: "danger",
              icon: "fa-solid fa-trash",
              loading: ({ index }) => deletingIndex === index && deleting,
              disabled: () => deleting,
            },
          ]}
          on:select={({ detail }) => (selected = detail)}
        />
      </div>
    {/if}

    {#if deployedData}
      <MastodonModal
        on:close={() => (deployedData = undefined)}
        data={deployedData}
      />
    {/if}
  {/if}
</b-box>
