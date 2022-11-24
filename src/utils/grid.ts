const { GridClient, NetworkEnv, Nodes } = window.grid3_client;
import { HTTPMessageBusClient } from "ts-rmb-http-client";
import type {
  GridClient as GC,
  FilterOptions,
  NodeInfo,
} from "grid3_client/dist/node";

export function getGrid(mnemonic: string) {
  const grid = new GridClient(
    NetworkEnv.dev,
    mnemonic,
    mnemonic,
    new HTTPMessageBusClient(0, "", "", ""),
    "mastodon"
  );
  return grid.connect().then(() => grid);
}

export function getNodes(grid: GC) {
  const { network, rmbClient } = grid;
  const { graphql, rmbProxy } = grid.getDefaultUrls(network);
  return new Nodes(graphql, rmbProxy, rmbClient);
}

export async function findNodes(
  mnemonic: string,
  filters: FilterOptions
): Promise<NodeInfo[]> {
  const grid = await getGrid(mnemonic);
  const nodes = getNodes(grid);
  return nodes
    .filterNodes({
      availableFor: await grid.twins.get_my_twin_id(),
      ...filters,
    })
    .catch(() => []);
}

export function getGateways(mnemonic: string) {
  return getGrid(mnemonic)
    .then(getNodes)
    .then((n) => n.getAccessNodes());
}
