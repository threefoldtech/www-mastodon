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

<!-- {#if free != undefined && locked != undefined}
  <div
    class="card"
    style:padding="10px"
    style:background="rgb(245 245 245)"
    style:text-align="center"
  >
    <p>
      Balance: <span style:font-weight="bold">{free.toFixed(3) + " TFT"}</span>
    </p>
    <a
      style:color="#000"
      href="https://library.threefold.me/info/manual/#/manual__tfchain_home?id=contract-grace-period"
      target="_blank"
      rel="noreferrer"
    >
      <b-tooltip flow="left" tooltip="Click to read about locked balance.">
        Locked:
      </b-tooltip>
    </a>
    <span style:font-weight="bold">
      {locked.toFixed(3) + " TFT"}
    </span>
    <button
      class="btn"
      style:border="none"
      style:background="rgb(0 0 0 / 0%)"
      style:width="100%"
      style:outline="none"
      style:cursor="pointer"
      on:click={refreshBalance}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        class="bi bi-arrow-clockwise"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
        />
        <path
          d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"
        />
      </svg>
    </button>
  </div>
{/if} -->
