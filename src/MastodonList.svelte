<svelte:options tag="tf-mastodon-list" />

<script lang="ts">
  import MastodonModal from "./components/MastodonModal.svelte";
  import { getGrid, mastodon } from "./utils";
  const { Table } = window.tfSvelteBulmaWc;

  const mnemonics = mastodon.get("mnemonics");
  $: mnemonics$ = $mnemonics;

  let loading = false;
  let deployedData: any;
  let instances: any[] = [];

  async function listMastodon() {
    loading = true;
    const grid = await getGrid(mnemonics$.value);
    const names = await grid.machines.list();
    const items = names.map((n) => grid.machines.getObj(n).catch(() => null));
    let _instances: any[] = [];
    for await (const item of items) {
      if (item?.at(0)) _instances.push(item.at(0));
    }
    instances = _instances;
    loading = false;
  }

  let __mnemonicsValid: boolean = false;
  $: if (mnemonics$.valid !== __mnemonicsValid) {
    __mnemonicsValid = mnemonics$.valid;
    if (mnemonics$.valid) listMastodon();
  }
</script>

<b-box>
  <b-content>
    <h2>Deployment List (Mastodon)</h2>
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
          fullwidth
          headers={[
            "name",
            "Public IPv4",
            "Planetary Network IP",
            "Flist",
            "Billing Rate",
          ]}
          position={false}
          rows={instances.map((i) => {
            const ip = i.publicIP?.ip;
            return [
              i.name,
              ip || "None",
              i.planetary,
              i.flist,
              "Should be implemented",
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
            },
          ]}
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
