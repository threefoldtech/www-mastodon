<svelte:options tag="tf-mastodon-list" />

<script lang="ts">
  import MastodonModal from "./components/MastodonModal.svelte";
  import { getGrid, isMnemonics } from "./utils";
  const { fb, validators } = window.tfSvelteRxForms;
  const { Input, btn, Table } = window.tfSvelteBulmaWc;

  let listing = false;
  const mnemonics = fb.control(
    "",
    [validators.required("Mnemonics is required."), isMnemonics],
    [
      async (ctrl) => {
        try {
          await getGrid(ctrl.value);
        } catch {
          return { message: "Couldn't load grid using these mnemonic." };
        }
      },
    ]
  );

  $: mnemonics$ = $mnemonics;

  let deployedData: any;
  let instances: any[] = [];
  let loading = false;
  let __init = false;
  $: if (listing && !__init) listMastodon();
  async function listMastodon() {
    __init = true;
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
</script>

<b-box>
  <b-content>
    <h2>Deployment List (Mastodon)</h2>
    <hr />
  </b-content>

  {#if !listing}
    <form on:submit={() => (listing = true)}>
      <Input
        label="Mnemonics"
        type="password"
        controller={mnemonics}
        disabled={mnemonics$.pending}
        validation={!mnemonics$.pending}
        hint={mnemonics$.pending ? "Validating mnemonics..." : undefined}
      />

      <button
        type="submit"
        use:btn={{
          color: "info",
          loading: mnemonics$.pending,
          fullwidth: true,
        }}
        disabled={!mnemonics$.valid}
      >
        List
      </button>
    </form>
  {:else}
    {#if loading}
      <b-notification color="primary" light>
        Listing Deployments ...
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
