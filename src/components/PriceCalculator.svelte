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
              {#if loading}
                <strong>Loading...</strong>
              {:else if typeof price0K == "number" && typeof price == "number"}
                <div style:line-height="45px">
                  Based on your specifications, the standard deployment cost is <strong
                    >{price0K}</strong
                  >
                  USD/month.<br /> Because you have <strong>{balance}</strong>
                  TFT in your TF Chain Wallet, your cost is
                  <strong>{price}</strong>
                  USD/month.
                  <strong>
                    <a
                      href="https://library.threefold.me/info/threefold#/cloud/threefold__pricing?id=discount-levels"
                      target="_blank"
                      rel="noreferrer"
                      class="has-text-white is-underlined"
                    >
                      Learn more</a
                    >
                  </strong>.
                </div>
              {:else}
                Failed to load the required data.
              {/if}
            </div>
          </b-box>
        </div>
        <div style:width="1.25rem" class="is-hidden-touch" />
        <Balance />
      </div>
      <!-- <div class="columns is-vcentered" style:margin-bottom="10px">
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
      </div> -->
    {/if}
  {/if}
</div>
