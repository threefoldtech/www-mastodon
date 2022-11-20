<svelte:options tag="tf-mastodon" />

<script context="module" lang="ts">
  import { Tabs, Input, CheckBox } from "tf-svelte-bulma-wc";
  import { fb, validators } from "tf-svelte-rx-forms";
  import { validateMnemonic } from "bip39";
  import { Session } from "./utils";
</script>

<script lang="ts">
  let active = "basic";

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
    enableSShKey: [false],
    sshKey: ["", [validators.required("Public SSH Key is required.")]],
  });

  $: loginForm$ = $loginForm;
  $: showConfigs =
    loginForm$.valid ||
    (loginForm$.value.mnemonics.valid && !loginForm$.value.enableSShKey.value);

  let __init = false;
  $: {
    loginForm$;

    if (__init) {
      Session.write(Session.Keys.Credentials, loginForm.value);
    } else {
      __init = true;
      const value = Session.read(Session.Keys.Credentials);
      if (value) {
        loginForm.get("mnemonics").setValue(value.mnemonics);
        loginForm.get("enableSShKey").setValue(value.enableSShKey);
        loginForm.get("sshKey").setValue(value.sshKey);
      }
    }
  }
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
      type="password"
      controller={loginForm.get("mnemonics")}
    />

    <div class="is-flex">
      <div style:width="100%">
        <Input
          label="Public SSH Key"
          type="textarea"
          placeholder="Your public SSH Key"
          controller={loginForm.get("sshKey")}
          disabled={!loginForm$.value.enableSShKey.value}
          validation={loginForm$.value.enableSShKey.value}
        />
      </div>

      <div class="mt-6 ml-2">
        <b-tooltip
          tooltip="On disable the deployed solutions'll be inaccessible."
          flow="left"
        >
          <CheckBox controller={loginForm.get("enableSShKey")} />
        </b-tooltip>
      </div>
    </div>
  </section>

  <section style:display={active === "basic" ? "initial" : "none"}>
    basic
  </section>
</b-box>
