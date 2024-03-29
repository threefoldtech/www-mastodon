<svelte:options tag="tf-advanced-tab" />

<script lang="ts">
  import type { MastodonForm } from "../Mastodon.svelte";
  const { Input, CheckBox } = window.tfSvelteBulmaWc;
  import SelectNodeId from "../components/SelectNodeId.svelte";
  import SelectGateway from "../components/SelectGateway.svelte";
  import { toggleSMTPRequired, smtpForm } from "../utils";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "tf-svelte-rx-forms/dist/internals/rx_store";

  export let show: boolean;
  export let mastodon: MastodonForm;

  let unsubscribe: Unsubscriber;
  onDestroy(() => unsubscribe?.());
  onMount(function mount() {
    if (!mastodon) requestAnimationFrame(mount);
    let __enable: boolean;
    unsubscribe = smtpForm
      .get("enable")
      .subscribe((v) => {
        if (__enable === v.value) return;
        __enable = v.value;
        toggleSMTPRequired(smtpForm, __enable);
      });
  });

  $: smtp$ = $smtpForm;
  $: enableSmtp = smtp$ ? smtp$.value.enable.value : false;
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

    <div class="is-flex is-justify-content-right">
      <b-tooltip
        flow="left"
        tooltip="Mastodon does not require an SMTP server. If you want to use an SMTP server, you can configure it."
      >
        <CheckBox
          label="<strong>SMTP Server</strong>"
          controller={smtpForm.get("enable")}
        />
      </b-tooltip>
    </div>

    {#if enableSmtp}
      <Input
        label="SMTP Email"
        placeholder="SMTP Email"
        controller={smtpForm.get("email")}
      />

      <Input
        label="SMTP Password"
        placeholder="SMTP Password"
        type="password"
        controller={smtpForm.get("password")}
      />

      <Input
        label="SMTP Server"
        placeholder="SMTP Server"
        controller={smtpForm.get("server")}
      />

      <Input
        label="SMTP Port"
        placeholder="SMTP Port"
        type="number"
        controller={smtpForm.get("port")}
      />
    {/if}
  </section>
{/if}
