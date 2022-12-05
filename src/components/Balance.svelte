<svelte:options tag="tf-mastodon-balance" />

<script lang="ts">
  import { getBalance, mastodon } from "../utils";

  let free: number;
  let locked: number;

  const mnemonics = mastodon.get("mnemonics");

  let __mnemonics: string;
  $: mnemonics$ = $mnemonics;
  $: if (mnemonics$.valid && __mnemonics !== mnemonics$.value) {
    __mnemonics = mnemonics$.value;
    getBalance(mnemonics$.value).then((balance) => {
      free = balance.free;
      locked = balance.feeFrozen;
    });
  } else if (!mnemonics$.valid) {
    free = undefined;
    locked = undefined;
  }

  async function refreshBalance() {
    getBalance(mnemonics$.value).then((balance) => {
      free = balance.free;
      locked = balance.feeFrozen;
    });
  }
</script>

{#if free != undefined && locked != undefined}
  <div
    class="card"
    style:padding="15px"
    style:background="rgb(245 245 245)"
    style:float="right"
    style:margin-top="-30px"
  >
    <p>
      Balance: <span style="font-weight: bold;"
        >{free.toFixed(3) + " TFT"}</span
      >
    </p>
    <p>
      Locked: <span style="font-weight: bold;"
        >{locked.toFixed(3) + " TFT"}</span
      >
    </p>
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
{/if}
