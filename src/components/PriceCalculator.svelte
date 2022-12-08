<svelte:options tag="tf-price-calculator" />

<script lang="ts">
  import debounce from "lodash/debounce.js";
  import { getGrid } from "../utils";
  import type { MastodonForm } from "../Mastodon.svelte";
  import Balance from "./Balance.svelte";

  export let mastodon: MastodonForm;

  let balance: number;
  let price: number;
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

    balance = await grid.balance.getMyBalance().then((b) => b.free);

    price = (
      await grid.calculator.calculateWithMyBalance({
        cru: cpu.value,
        sru: disk.value + 2,
        mru: memory.value / 1024,
        hru: 0,
      })
    ).sharedPrice;

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
      <div class="columns is-vcentered" style:margin-bottom="10px">
        <div class="column is-10">
          {#each [price0K, price] as p, index}
            <div style:margin-bottom={index === 0 ? -5 : undefined}>
              <b-tags addons align="centered" size="large">
                <b-tag>
                  {@html mastodon$.value.mnemonics.valid && !loading
                    ? index === 0
                      ? "Based on your specifications, the standard deployment cost is "
                      : `Because you have <strong class="mx-1"> ${balance.toFixed(
                          2
                        )}</strong> TFT in your TF Chain Wallet, your cost is`
                    : ""}
                  <strong class="mr-1 ml-1">
                    {loading ? "Loading..." : p.toFixed(2)}
                  </strong>
                  {mastodon$.value.mnemonics.valid ? "USD/Month" : ""}
                  {#if index === 1}
                    <a
                      href="https://library.threefold.me/info/threefold#/cloud/threefold__pricing?id=discount-levels"
                      target="_blank"
                      rel="noreferrer"
                      class="ml-1"
                    >
                      Learn More</a
                    >
                  {/if}
                </b-tag>
              </b-tags>
            </div>
          {/each}
        </div>
        <div class="column" style:display="flex" style:justify-content="end">
          <Balance />
        </div>
      </div>
    {/if}
  {/if}
</div>
