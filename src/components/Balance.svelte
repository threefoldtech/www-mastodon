<svelte:options tag="tf-mastodon-balance" />

<script lang="ts">
  import { getBalance, mastodon } from "../utils";
  const { btn } = window.tfSvelteBulmaWc;

  const mnemonics = mastodon.get("mnemonics");
  let loading = false;
  let balance: { free: number; locked: number };

  $: mnemonics$ = $mnemonics;

  let __mnemonics: string;
  $: if (mnemonics$.valid && __mnemonics !== mnemonics$.value) {
    __mnemonics = mnemonics$.value;
    loadBalance();
  }

  async function loadBalance() {
    loading = true;
    getBalance(mnemonics$.value)
      .then(({ free, feeFrozen }) => {
        balance = { free, locked: feeFrozen };
      })
      .finally(() => {
        loading = false;
      });
  }
</script>

<b-box
  style:border="1px solid var(--main-purple)"
  style:background-color="transparent"
  style:box-shadow="none"
  class:is-flex={true}
  class:is-flex-direction-column={true}
  class:mb-2={true}
>
  {#if loading}
    <p>
      <strog>Loading...</strog>
    </p>
  {:else if balance}
    <p style:white-space="nowrap" class="mb-1">
      Balance: <strong>{balance.free} TFT</strong>
    </p>
    <p style:white-space="nowrap">
      <strong>
        <a
          href="https://library.threefold.me/info/manual/#/manual__tfchain_home?id=contract-grace-period"
          target="_blank"
          rel="noreferrer"
          class="is-underlined"
        >
          Locked
        </a>
      </strong>: <strong>{balance.locked} TFT</strong>
    </p>
  {:else}
    <p>Couldn't Load balance.</p>
  {/if}
  <div class="is-flex" style:margin-top="auto">
    <button
      use:btn={{
        color: "primary",
        outlined: true,
        fullwidth: true,
        loading,
      }}
      disabled={loading}
      class:py-0={true}
      on:click={loadBalance}
    >
      <b-icon icon="fa-solid fa-rotate-right">Reload</b-icon>
    </button>
  </div>
</b-box>
