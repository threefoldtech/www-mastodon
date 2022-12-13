<svelte:options tag="tf-app-loader" />

<script lang="ts">
  export let total: number;
  let message: string;
  let current = 0;
  export function setMessage(msg: string) {
    current++;
    message = msg;
  }
</script>

<div
  style:height="100vh"
  style:width="100%"
  style:display="flex"
  style:justify-content="center"
  style:align-items="center"
>
  <p style:text-align="center">{message} | {current}/{total}</p>
</div>
