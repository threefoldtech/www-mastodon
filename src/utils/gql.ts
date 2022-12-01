import { getGrid } from "./grid";
import type { Networks } from "tfgrid-gql";
const { default: TFGridGqlClient } = window.tfgridGql;

export async function getNameAndGatewayContracts(
  mnemonics: string,
  name: string
): Promise<number[]> {
  const grid = await getGrid(mnemonics);
  const twinId = await grid.twins.get_my_twin_id();
  const gql = new TFGridGqlClient(window.config.network as unknown as Networks);
  const contracts = await gql.merge({
    nodeContracts: [
      { contractID: true },
      {
        where: {
          twinID_eq: twinId,
          deploymentData_contains: `\"projectName\":\"Mastodon\"`,
          AND: {
            deploymentData_contains: `\"name\":\"md${twinId}${name}\"`,
          },
        },
      },
    ],
    nameContracts: [
      { contractID: true },
      { where: { twinID_eq: twinId, name_eq: `md${twinId}${name}` } },
    ],
  });
  return [
    ...contracts.nameContracts.map((x) => +x.contractID),
    ...contracts.nodeContracts.map((x) => +x.contractID),
  ];
}
