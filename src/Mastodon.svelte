<svelte:options tag="tf-mastodon" />

<script context="module" lang="ts">
  import { Tabs, Input, CheckBox } from "tf-svelte-bulma-wc";
  import { fb, validators } from "tf-svelte-rx-forms";
  import { validateMnemonic } from "bip39";
</script>

<script lang="ts">
  let active = "credentials";

  const enableSShKey = fb.control(false);
  const loginForm = fb.group({
    mnemonics: [
      "",
      [
        validators.required("Mnemonics is required."),
        (ctrl) => {
          if (!validateMnemonic(ctrl.value)) {
            return { message: "Mnemonic doesn't seem to be valid." };
          }
        },
      ],
    ],
    sshKey: ["", [validators.required("Public SSH Key is required.")]],
  });

  $: enableSShKey$ = $enableSShKey;
  $: loginForm$ = $loginForm;
  $: showConfigs =
    loginForm$.valid ||
    (loginForm$.value.mnemonics.valid && !enableSShKey$.value);
</script>

<b-box>
  <Tabs
    bind:active
    tabs={[
      { id: "credentials", label: "Credentials" },
      ...(showConfigs
        ? [
            { id: "basic", label: "Basic" },
            { id: "advanced", label: "Advanced" },
          ]
        : []),
    ]}
  />

  <section style:display={active === "credentials" ? "initial" : "none"}>
    <Input
      label="Mnemonics"
      placeholder="Mnemonics"
      controller={loginForm.get("mnemonics")}
    />

    <div class="is-flex">
      <div style:width="100%">
        <Input
          label="Public SSH Key"
          type="textarea"
          placeholder="Your public SSH Key"
          controller={loginForm.get("sshKey")}
          disabled={!enableSShKey$.value}
          validation={enableSShKey$.value}
        />
      </div>

      <div class="mt-6 ml-2">
        <b-tooltip
          tooltip="On disable the deployed solutions'll be inaccessible."
          flow="left"
        >
          <CheckBox controller={enableSShKey} />
        </b-tooltip>
      </div>
    </div>
  </section>

  <section style:display={active === "basic" ? "initial" : "none"}>
    basic
  </section>
</b-box>
