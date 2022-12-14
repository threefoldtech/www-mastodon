<svelte:options tag="tf-mastodon-list" />

<script lang="ts">
  import { get_current_component } from "svelte/internal";
  import MastodonModal from "./components/MastodonModal.svelte";
  import MastodonDeleteModal from "./components/MastodonDeleteModal.svelte";
  import { getGrid, getNameAndGatewayContracts, mastodon } from "./utils";
  import { Decimal } from "decimal.js";
  import type { Table } from "tf-svelte-bulma-wc";

  const { Table, btn } = window.tfSvelteBulmaWc;
  const mnemonics = mastodon.get("mnemonics");
  $: mnemonics$ = $mnemonics;

  window.mastodonList = get_current_component();

  let loading = false;
  let _openDeleteModal = false;
  let deployedData: any;
  let instances: any[] = [];
  let billingRate: any[] = [];
  let _index: number;
  let selectedInstances: string[] = [];

  function openDeleteModal(index?: number) {
    const indexs = typeof index === "number" ? [index] : selected;
    for (const index of indexs) {
      if (!selectedInstances.includes(instances[index].name)) {
        selectedInstances.push(instances[index].name);
      }
    }

    _openDeleteModal = true;
    _index = index;
  }

  async function onDelete(index?) {
    deleting = true;
    const indexs = typeof index === "number" ? [index] : selected;
    let __instances = table.rows.slice();
    const grid = await getGrid(mnemonics$.value);

    for (const index of indexs) {
      deletingIndex = index;
      let contractIds = await getNameAndGatewayContracts(
        mnemonics$.value,
        instances[index].name
      );
      contractIds = contractIds.concat(instances[index].contractId);
      await Promise.all(
        contractIds.map((id) => {
          return grid.contracts.cancel({ id }).catch(() => null);
        })
      );
      table.unselect(index);
      __instances[index] = null;
    }

    table.rows = __instances.filter((x) => x !== null);
    instances = instances.filter((_, i) => __instances[i] !== null);
    deletingIndex = undefined;
    deleting = false;
  }

  async function listMastodon() {
    loading = true;
    const grid = await getGrid(mnemonics$.value);
    const names = await grid.machines.list();
    const items = names.map((n) => grid.machines.getObj(n).catch(() => null));
    let _instances: any[] = [];
    let _billingRate: any[] = [];
    let rates: Promise<Decimal>[] = [];
    for await (const item of items) {
      const i = item?.at(0);
      if (i) {
        _instances.push(i);
        rates.push(
          Promise.all(
            (await getNameAndGatewayContracts(mnemonics$.value, i.name))
              .concat(i.contractId)
              .map((id) => grid.contracts.getConsumption({ id }))
          ).then((p) => p.reduce((a, b) => a.add(b), new Decimal("0")))
        );
      }
    }
    for await (const item of rates) {
      _billingRate.push(
        item.isNaN() || item.lessThanOrEqualTo(0)
          ? "No Data Available"
          : item.toFixed() + " TFT/hour"
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
  let disableReload = false;
  let deletingIndex: number;
  let table: Table;

  export function reload() {
    listMastodon();
  }

  export function setDisabled(value: boolean) {
    disableReload = value;
  }
</script>

<b-box class:mb-6={true} class:p-6={true} style:font-family="'Lato', sans-serif">
  <b-content>
    <div class="is-flex is-justify-content-space-between is-align-items-center">
      <h2>Deployment List (Mastodon)</h2>
      {#if mnemonics$.valid}
        <div>
          <button
            class:mr-2={true}
            use:btn={{ color: "primary", loading, size: "small" }}
            disabled={loading || deleting || !mnemonics$.valid || disableReload}
            on:click={listMastodon}
          >
            <b-icon icon="fa-solid fa-arrows-rotate" />
            Reload
          </button>
          <button
            use:btn={{ color: "danger", loading: deleting, size: "small" }}
            disabled={deleting || selected.length === 0}
            on:click={() => openDeleteModal()}
          >
            <b-icon icon="fa-solid fa-trash" />
            Delete
          </button>
        </div>
      {/if}
    </div>
    <hr />
  </b-content>

  {#if !mnemonics$.valid}
    <b-notification color="info" light>
      Please create account or insert your mnemonics in
      <strong> Credentials </strong> tab.
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
            "Billing Rate",
          ]}
          position={false}
          rows={instances.map((i, index) => {
            const ip = i.publicIP?.ip;
            return [i.name, ip || "None", i.planetary, billingRate[index]];
          })}
          actions={[
            {
              label: "Show Details",
              click(e) {
                deployedData = instances[e.index];
              },
              color: "primary",
              icon: "fa-solid fa-eye",
              disabled: () => deleting || disableReload,
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
              disabled: () => deleting || disableReload,
            },
            {
              label: "Delete",
              click: ({ index }) => openDeleteModal(index),
              color: "danger",
              icon: "fa-solid fa-trash",
              loading: ({ index }) => deletingIndex === index && deleting,
              disabled: () => deleting || disableReload,
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

    {#if _openDeleteModal}
      <MastodonDeleteModal
        on:close={() => (_openDeleteModal = undefined)}
        on:isDelete={({ detail }) => {
          _openDeleteModal = false;
          selectedInstances = [];
          detail === true ? onDelete(_index) : false;
        }}
        on:close={() => {
          selectedInstances = [];
        }}
        {selectedInstances}
      />
    {/if}
  {/if}
</b-box>
