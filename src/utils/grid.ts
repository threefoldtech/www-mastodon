const { GridClient, Nodes, BackendStorageType } = window.grid3_client;
import type {
  GridClient as GC,
  FilterOptions,
  NodeInfo,
  NetworkEnv
} from "@threefold/grid_client";

export function getGrid(mnemonic: string) {
  const grid = new GridClient({
    network: window.config.network as NetworkEnv,
    mnemonic,
    storeSecret: mnemonic,
    projectName: 'mastodon',
    backendStorageType: BackendStorageType.tfkvstore
  });
  return grid.connect().then(() => grid);
}

export function getNodes(grid: GC) {
  const { rmbClient } = grid;
  const { graphql, rmbProxy } = grid.getDefaultUrls(grid.clientOptions!.network);
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

export function getBalance(mnemonic: string) {
  return getGrid(mnemonic)
  .then(grid => grid.balance.getMyBalance())
}