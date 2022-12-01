<svelte:options tag="tf-price-calculator" />

<script lang="ts">
  import debounce from "lodash/debounce.js";
  import { getGrid } from "../utils";
  import type { MastodonForm } from "../Mastodon.svelte";
  import Balance from "./Balance.svelte";

  export let mastodon: MastodonForm;

  let price: number;
  let price50K: number;
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
    price = (
      await grid.calculator.calculateWithMyBalance({
        cru: cpu.value,
        sru: disk.value + 2,
        mru: memory.value / 1024,
        hru: 0,
      })
    ).sharedPrice;

    price50K = (
      await grid.calculator.calculate({
        cru: cpu.value,
        sru: disk.value + 2,
        mru: memory.value / 1024,
        hru: 0,
        balance: 50 * 10e3,
      })
    ).sharedPrice;
    loading = false;
  }, 1000);
  $: if (mastodon$ && mastodon$.value.mnemonics.valid) calcPrice();
</script>

<div>
  {#if mastodon}
    {#if mastodon$.value.mnemonics.valid}
      <Balance />
      {#each [price, price50K] as p, index}
        <div style:margin-bottom={index === 0 ? -5 : undefined}>
          <b-tags addons align="centered" size="large">
            <b-tag>
              {mastodon$.value.mnemonics.valid && !loading
                ? "The deployment will cost "
                : ""}
              <strong class="mr-1 ml-1">
                {loading ? "Loading..." : p}
              </strong>
              {mastodon$.value.mnemonics.valid
                ? `USD/Month ${
                    index === 1 ? "with a 50k balance of TFT, after applying discount" : ""
                  }`
                : ""}
            </b-tag>
          </b-tags>
        </div>
      {/each}
    {/if}
  {/if}
</div>
