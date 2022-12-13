<svelte:options tag="tf-price-calculator" />

<script lang="ts">
  import debounce from "lodash/debounce.js";
  import { getGrid } from "../utils";
  import type { MastodonForm } from "../Mastodon.svelte";
  import Balance from "./Balance.svelte";

  export let mastodon: MastodonForm;

  let balance: string;
  let price0K: number;
  let loading = true;

  $: mastodon$ = $mastodon;
  let __challenge: string;
  const calcPrice = debounce(async function () {
    const { cpu, memory, disk, mnemonics } = mastodon$.value;
    if (!(cpu.valid && memory.valid && disk.valid)) return;

    const challenge = `${cpu.value}:${memory.value}:${disk.value}`;
    if (__challenge === challenge) return;
    loading = true;
    __challenge = challenge;

    const grid = await getGrid(mnemonics.value);

    balance = await grid.balance.getMyBalance().then((b) => b.free.toFixed(2));

    price0K = (
      await grid.calculator.calculate({
        cru: cpu.value,
        sru: disk.value + 2,
        mru: memory.value / 1024,
        hru: 0,
        balance: 0,
      })
    ).sharedPrice;
    loading = false;
  }, 1000);
  $: if (mastodon$ && mastodon$.value.mnemonics.valid) calcPrice();
</script>

<div>
  {#if mastodon}
    {#if mastodon$.value.mnemonics.valid}
      <div class="is-flex-desktop">
        <div class="is-flex" style:width="100%">
          <b-box
            style:width="100%"
            style:background-color="var(--main-purple)"
            class:has-text-white={true}
            class:mb-2={true}
            class:is-flex={true}
            class:is-align-items-center={true}
          >
            <div>
              <div style:line-height="45px">
                Based on your specifications and TFChain TFT balance, your
                deployment cost is <strong
                  >{loading
                    ? "Calculating..."
                    : price0K
                    ? price0K
                    : "Failed to calculate standard price"}</strong
                >
                USD/Month.<br />
                <strong>
                  <a
                    href="https://library.threefold.me/info/threefold#/cloud/threefold__pricing?id=discount-levels"
                    target="_blank"
                    rel="noreferrer"
                    class="has-text-white is-underlined"
                  >
                    Learn how to unlock discounts</a
                  >
                </strong>.
              </div>
            </div>
          </b-box>
        </div>
        <div style:width="1.25rem" class="is-hidden-touch" />
        <Balance />
      </div>
    {/if}
  {/if}
</div>
