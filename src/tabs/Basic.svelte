<svelte:options tag="tf-basic-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  import { regions } from "../regions";
  const { Input, Select, CheckBox } = window.tfSvelteBulmaWc;

  export let show: boolean;
  export let mastodon: MastodonForm;
</script>

{#if mastodon}
  <section style:display={show ? "initial" : "none"}>
    <Input
      label="Mastodon Instance Name"
      sublabel="Instance name is used for managing the deployed instance and to create a subdomain"
      placeholder="Instance name is used for managing the deployed instance and to create a subdomain"
      controller={mastodon.get("name")}
    />

    <Input
      label="Admin Email"
      placeholder="Admin Email"
      controller={mastodon.get("admin").get("email")}
    />

    <Select
      label="Region"
      controller={mastodon.get("region")}
      options={[
        { label: "All", value: null },
        ...Object.keys(regions).map((r) => ({ label: r, value: r })),
      ]}
    />

    <div class="is-flex">
      <CheckBox
        label="<strong>Enable<a href='https://library.threefold.me/info/threefold/#/tokens/threefold__threefold_connect' target='_blank' class='ml-1'>ThreeFold Connect</a></strong>"
        controller={mastodon.get("tfConnect")}
      />
      <b-tooltip
        class:is-hidden-touch={true}
        class:is-block={true}
        class:mb-2={true}
        tooltip="Users of your instance will be required to log in with ThreeFold Connect to enable another level of security and authenticity."
        flow="right"
      >
        <div style:margin-top="6px">
          <b-icon icon="fa-solid fa-circle-question" />
        </div>
      </b-tooltip>
    </div>

    <div class="is-flex">
      <CheckBox
        label="<strong><a href='https://library.threefold.me/info/threefold/#/tfgrid/pricing/threefold__certified_farming' target='_blank' class='mr-1'>Certified</a>Hardware</strong>"
        controller={mastodon.get("certified")}
      />
      <b-tooltip
        class:is-hidden-touch={true}
        tooltip="Deploy your instance on a Certified 3Node. Certified 3Nodes come with greater levels of security and performance along with other benefits."
        flow="right"
      >
        <div style:margin-top="6px">
          <b-icon icon="fa-solid fa-circle-question" />
        </div>
      </b-tooltip>
    </div>
  </section>
{/if}
