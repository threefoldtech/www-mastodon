<svelte:options tag="tf-mastodon-modal" />

<script lang="ts">
  import { onDestroy, onMount, createEventDispatcher } from "svelte";
  import type { FormControl } from "tf-svelte-rx-forms";

  const { btn, Input, CheckBox } = window.tfSvelteBulmaWc;
  const { fb } = window.tfSvelteRxForms;
  const dispatch = createEventDispatcher<{ close: void }>();

  export let data: any;

  interface Detail {
    label: string;
    controller: FormControl<any>;
    cmp: any;
  }

  let tab = "JSON";
  const inputs: Detail[] = [];

  // prettier-ignore
  onMount(() => {
    const v = data[0];
    inputs.push({ label: "Name", controller: fb.control(v.name), cmp: Input });
    inputs.push({ label: "Node ID", controller: fb.control(v.nodeId), cmp: Input });
    inputs.push({ label: "Contract ID", controller: fb.control(v.contractId), cmp: Input });
    inputs.push({ label: "Flist", controller: fb.control(v.flist), cmp: Input });

    if (v.publicIP.ip) inputs.push({ label: "IPv4", controller: fb.control(v.publicIP.ip), cmp: Input });
    else inputs.push({ label: "IPv4", controller: fb.control(false), cmp: CheckBox });

    inputs.push({ label: "IPv6", controller: fb.control(v.publicIP.ip6), cmp: Input });
    inputs.push({ label: "Planetary", controller: fb.control(v.planetary), cmp: Input });
    inputs.push({ label: "CPU(vCores)", controller: fb.control(v.capacity.cpu), cmp: Input });
    inputs.push({ label: "Memory(MB)", controller: fb.control(v.capacity.memory), cmp: Input });
    inputs.push({ label: "Domain", controller: fb.control(`https://${v.env.LOCAL_DOMAIN}`), cmp: Input });
    inputs.push({ label: "Super Username", controller: fb.control(v.env.SUPERUSER_USERNAME), cmp: Input });
    inputs.push({ label: "Super Email", controller: fb.control(v.env.SUPERUSER_EMAIL), cmp: Input });
    inputs.push({ label: "Super Password", controller: fb.control(v.env.SUPERUSER_PASSWORD), cmp: Input });
  });
  onDestroy(() => {
    inputs.forEach((i) => i.controller.destroy());
  });

  let copying = false;
  function onCopy() {
    copying = true;

    const ta = document.createElement("textarea");
    ta.value = JSON.stringify(data);
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    ta.remove();

    setTimeout(() => {
      copying = false;
    }, 2000);
  }
</script>

{#if data}
  <b-modal open>
    <b-modal-header>
      <b-btns align="centered" addons>
        {#each ["JSON", "Details"] as t}
          <button
            type="button"
            use:btn={{ color: tab === t ? "primary" : undefined }}
            on:click|preventDefault={() => (tab = t)}>{t}</button
          >
        {/each}
      </b-btns>
    </b-modal-header>
    <b-modal-body>
      {#if tab === "JSON"}
        <div style:white-space="pre">
          {JSON.stringify(data, undefined, 4)}
        </div>
      {:else}
        {#each inputs as input}
          <div class="is-flex is-align-items-end">
            <div style:width="100%">
              <svelte:component
                this={input.cmp}
                {...input}
                disabled
                validation={false}
              />
            </div>
            {#if input.label === "Domain"}
              <button
                type="button"
                on:click={() => window.open(input.controller.value, "_blank")}
                use:btn={{ color: "link", size: "small" }}
                class:ml-2={true}
              >
                Open
              </button>
            {/if}
          </div>
        {/each}
      {/if}
    </b-modal-body>
    <b-modal-actions>
      <b-btns align="right" size="small">
        <button
          use:btn={{ color: "link" }}
          disabled={copying}
          on:click={onCopy}
          type="button"
        >
          {copying ? "Copied" : "Copy"}
        </button>
        <button
          use:btn={{ color: "danger" }}
          on:click={() => dispatch("close")}
          type="button"
        >
          Close
        </button>
      </b-btns>
    </b-modal-actions>
  </b-modal>
{/if}
