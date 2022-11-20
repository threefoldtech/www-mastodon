const { GridClient, NetworkEnv, Nodes } = window.grid3_client;
import { HTTPMessageBusClient } from "ts-rmb-http-client";
import type { GridClient as GC, FilterOptions } from "grid3_client/dist/node";

export function getGrid(mnemonic: string) {
  const grid = new GridClient(
    NetworkEnv.dev,
    mnemonic,
    mnemonic,
    new HTTPMessageBusClient(0, "", "", "")
  );
  return grid.connect().then(() => grid);
}

export function getNodes(grid: GC) {
  const { network, rmbClient } = grid;
  const { graphql, rmbProxy } = grid.getDefaultUrls(network);
  return new Nodes(graphql, rmbProxy, rmbClient);
}

export function findNodes(mnemonic: string, filters: FilterOptions) {
  let _grid: GC;
  return getGrid(mnemonic)
    .then((grid) => (_grid = grid))
    .then(() => _grid.twins.get_my_twin_id())
    .then((availableFor) => {
      return getNodes(_grid).filterNodes({ ...filters, availableFor });
    })
    .catch(() => []);
}

export function getGateways(mnemonic: string) {
  return getGrid(mnemonic)
    .then(getNodes)
    .then((n) => n.getAccessNodes());
}
