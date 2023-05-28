<svelte:options tag="tf-mastodon" />

<script context="module" lang="ts">
  const { Tabs } = window.tfSvelteBulmaWc;
  const { events } = window.grid3_client;

  import Credentials from "./tabs/Credentials.svelte";
  import Advanced from "./tabs/Advanced.svelte";
  import {
    generateString,
    deployVM,
    getDomainName,
    deployGateway,
    mastodon,
    smtpForm,
    listenUntillUp,
    checkNode,
  } from "./utils";
  import Basic from "./tabs/Basic.svelte";

  export type MastodonForm = typeof mastodon;
</script>

<script lang="ts">
  import MastodonModal from "./components/MastodonModal.svelte";
  import PriceCalculator from "./components/PriceCalculator.svelte";
  import type { FormControlValue } from "tf-svelte-rx-forms/dist/types";
  import { onMount } from "svelte";
  import { getRelays } from "./utils/helpers";
  const { Input, btn } = window.tfSvelteBulmaWc;

  export let provider: string;

  let active = "credentials";
  $: mastodon$ = $mastodon;
  $: mnemonics = mastodon$.value.mnemonics;
  $: sshKey = mastodon$.value.sshKey;
  $: validCredentials = mnemonics.valid && sshKey.valid;

  let deploying = false;
  let error = false;
  let success = false;
  let message = "";
  let deployedData: any;
  let showDeployedData = false;
  let listener: (() => void) | undefined;
  let isUp: boolean = false;

  async function onDeploy() {
    const { value } = mastodon;

    try {
      // Will throw and error if node currently Down.
      await checkNode(value.mnemonics, value.nodeId);
    } catch {
      // Revalidate nodeId to verify that node still up
      await mastodon.get("nodeId").validate();

      // Trigger validation for any fields of selectNodeID
      // to verify that node still UP
      mastodon.get("certified").setValue(mastodon$.value.certified.value);
    }

    if (!mastodon.valid || (smtp$.value.enable.value && !smtp$.valid) ) {
      mastodon.markAsDirty();
      mastodon.markAsTouched();
      smtpForm.markAsDirty();
      smtpForm.markAsTouched();

      requestAnimationFrame(() => {
        if (basicHasError) {
          requestAnimationFrame(() => {
            active = "basic";
            // prettier-ignore
            requestAnimationFrame(() => {
            if (!v$.name.valid) mastodon.get("name")["__input"]?.focus();
            else if (!v$.admin.value.email.valid) mastodon.get("admin").get("email")["__input"]?.focus();
          });
          });
        } else if (advancedHasError) {
          requestAnimationFrame(() => {
            active = "advanced";
            // prettier-ignore
            requestAnimationFrame(() => {
            if (!v$.cpu.valid) mastodon.get("cpu")["__input"]?.focus();
            else if (!v$.memory.valid) mastodon.get("memory")["__input"]?.focus();
            else if (!v$.disk.valid) mastodon.get("disk")["__input"]?.focus();
            else if (!v$.admin.value.username.valid) mastodon.get("admin").get("username")["__input"]?.focus();
            else if (!smtp$.value.email.valid) smtpForm.get("email")["__input"]?.focus();
            else if (!smtp$.value.password.valid) smtpForm.get("password")["__input"]?.focus();
            else if (!smtp$.value.server.valid) smtpForm.get("server")["__input"]?.focus();
            else if (!smtp$.value.port.valid) smtpForm.get("port")["__input"]?.focus();
          });
          });
        }
      });

      return;
    }

    deploying = true;
    window.mastodonList?.setDisabled(true);
    error = false;
    success = false;
    if (listener) {
      listener();
      listener = undefined;
    }
    isUp = false;

    try {
      events.addListener("logs", (msg: any) => (message = msg));

      const domainName = await getDomainName(value.mnemonics, value.name);
      const [publicNodeId, nodeDomain] = value.gateway.split(":");

      const vm = await deployVM({
        ...mastodon.value,
        image: {
          flist:
            "https://hub.grid.tf/tf-official-apps/mastodon-latest.flist",
          entryPoint: "/sbin/zinit init",
        },
        rootFsSize: 2,
        disks: [
          {
            name: generateString(15, "disk"),
            mountPoint: "/var/lib/docker",
            size: value.disk,
          },
        ],
        envs: [
          { key: "LOCAL_DOMAIN", value: `${domainName}.${nodeDomain}` },
          { key: "SUPERUSER_USERNAME", value: value.admin.username },
          { key: "SUPERUSER_EMAIL", value: value.admin.email },
          { key: "SUPERUSER_PASSWORD", value: value.admin.password },
          { key: "SSH_KEY", value: value.sshKey },
          { key: "IS_TF_CONNECT", value: `${value.tfConnect}` },
          { key: "RELAYS_LINKS", value: JSON.stringify(getRelays()) },
          ...(smtp$.value.enable.value
            ? [
                { key: "SMTP_SERVER", value: smtp$.value.server.value },
                { key: "SMTP_LOGIN", value: smtp$.value.email.value },
                { key: "SMTP_PASSWORD", value: smtp$.value.password.value },
                { key: "SMTP_PORT", value: smtp$.value.port.value.toString() },
              ]
            : []),
        ],
        solutionProviderID: value.solutionCode,
        metadata: JSON.stringify({
          type: "vm",
          name: mastodon.value.name,
          projectName: "Mastodon",
        }),
      });

      await deployGateway({
        domainName,
        mnemonics: value.mnemonics,
        planetaryIp: vm[0]["planetary"] as string,
        publicNodeId: +publicNodeId,
        solutionProviderID: value.solutionCode,
        metadata: JSON.stringify({
          type: "gateway",
          name: domainName,
          projectName: "Mastodon",
        }),
      });

      deployedData = vm;
      success = true;
      message = "Successfully deployed Mastodon instance.";

      const [up, done] = listenUntillUp(`https://${domainName}.${nodeDomain}`);
      listener = done;
      up.then(() => {
        window.mastodonList?.reload();
        window.mastodonList?.setDisabled(false);
        isUp = true;
        listener = undefined;
        showDeployedData = true;
      });
    } catch (e) {
      message = e.message;
      error = true;
    }

    events.removeAllListeners("logs");
  }

  function isNotValid(...fields$: FormControlValue<any>[]): boolean {
    for (const field$ of fields$) {
      if (!field$.valid && (field$.touched || field$.dirty)) {
        return true;
      }
    }
    return false;
  }

  $: v$ = mastodon$.value;
  $: smtp$ = $smtpForm;
  $: credentialsHasError = isNotValid(v$.mnemonics, v$.sshKey);
  $: basicHasError = isNotValid(
    v$.name,
    v$.admin.value.email,
    v$.region,
    v$.certified
  );
  $: advancedHasError =
    isNotValid(
      v$.cpu,
      v$.memory,
      v$.disk,
      v$.gateway,
      v$.nodeId,
      v$.admin.value.username,
      v$.admin.value.password
    ) ||
    (smtp$.value.enable.value
      ? isNotValid(
          smtp$.value.email,
          smtp$.value.password,
          smtp$.value.port,
          smtp$.value.server
        )
      : false);

  let providingSolutionCode = true;
  onMount(() => {
    if (typeof provider !== "undefined") {
      providingSolutionCode = false;
      mastodon.get("solutionCode").setValue(+provider);
    }
  });
</script>

<b-box
  class:p-6={true}
  class:mt-3={true}
  class:is-size-5={true}
  style:font-family="'Lato', sans-serif"
>
  <b-content>
    <h2 class="has-text-centered is-size-1 mt-0 ">
      Deploy a Mastodon Instance
    </h2>
    <p>
      Mastodon is free and open-source software for running self-hosted social
      networking services. It has microblogging features similar to the Twitter
      service, which are offered by a large number of independently run nodes,
      known as instances, each with its own code of conduct, terms of service,
      privacy options, and moderation policies.
    </p>
    <PriceCalculator {mastodon} />
    <hr />
  </b-content>
  {#if providingSolutionCode}
    <Input
      label="Solution Code"
      placeholder="Solution Code"
      controller={mastodon.get("solutionCode")}
      validation={!mastodon$.value.solutionCode.pending}
      loading={mastodon$.value.solutionCode.pending}
    />
    <b-btns align="centered">
      <button
        use:btn={{
          color: "primary",
          loading: mastodon$.value.solutionCode.pending,
        }}
        disabled={!mastodon$.value.solutionCode.valid}
        on:click={() => (providingSolutionCode = false)}
      >
        Continue
      </button>
      <button
        use:btn={{ color: "info" }}
        disabled={mastodon$.value.solutionCode.valid ||
          mastodon$.value.solutionCode.pending}
        on:click={() => {
          mastodon.get("solutionCode").setValue(1);
          providingSolutionCode = false;
        }}
      >
        Don't have Code ?
      </button>
    </b-btns>
  {:else}
    <section class:d-none={providingSolutionCode}>
      <section class:d-none={deploying} style:margin-top="35px">
        <Tabs
          bind:active
          tabs={[
            {
              id: "credentials",
              label: "Credentials",
              error: credentialsHasError,
            },
            ...(validCredentials
              ? [
                  { id: "basic", label: "Basic", error: basicHasError },
                  {
                    id: "advanced",
                    label: "Advanced",
                    error: advancedHasError,
                  },
                ]
              : []),
          ]}
        />
      </section>

      <form on:submit|preventDefault={onDeploy} class="p-2">
        <section class:d-none={deploying}>
          <Credentials show={active === "credentials"} />

          {#if validCredentials}
            <Basic {mastodon} show={active === "basic"} />
            <Advanced {mastodon} show={active === "advanced"} />
          {/if}
        </section>

        <section class:d-none={!deploying}>
          <b-notification
            color={error ? "danger" : success ? "success" : "info"}
            light
          >
            [+] {message || "Loading.."}.
          </b-notification>
        </section>

        <div class="is-flex mt-2 is-align-items-center">
          <button
            use:btn={{
              color: deploying ? "info" : "primary",
              loading: deploying && !error && !success,
            }}
            class:py-0={true}
            type={deploying ? "button" : "submit"}
            disabled={credentialsHasError ||
              (deploying && !error && !success) ||
              deployedData ||
              showDeployedData}
            on:click={deploying
              ? (e) => {
                  e.preventDefault();
                  deploying = false;
                  success = false;
                  error = false;
                  isUp = false;
                  if (listener) {
                    listener();
                    listener = undefined;
                  }
                }
              : undefined}
          >
            {deploying ? "Back" : "Deploy"}
          </button>
          <div style:width="100%" class="ml-2">
            {#if listener}
              <b-notification color="warning" light>
                <b-icon icon="fas fa-spinner fa-pulse" /> Waiting for your mastodon
                instance to be up and running...
              </b-notification>
            {:else if isUp}
              <b-notification color="success" light>
                <b-icon icon="fa-solid fa-circle-check" /> Your mastodon instance
                is up and running.
              </b-notification>
            {/if}
          </div>
        </div>
      </form>
    </section>
  {/if}

  {#if deployedData && showDeployedData}
    <MastodonModal
      on:close={() => {
        deployedData = undefined;
        showDeployedData = false;
      }}
      data={deployedData}
    />
  {/if}
</b-box>
