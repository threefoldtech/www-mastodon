const { MachineModel, DiskModel, MachinesModel, NetworkModel } =
  window.grid3_client;
import { getGrid } from "./grid";
import { generateString } from "./helpers";

export interface Network {
  name: string;
  ipRange: string;
  addAccess?: boolean;
}

export interface Disk {
  name: string;
  size: number;
  mountPoint: string;
}

export interface Image {
  flist: string;
  entryPoint: string;
}

export interface Env {
  key: string;
  value: string;
}

export interface VMOptions {
  mnemonics: string;
  name: string;
  network?: Network;
  disks?: Disk[];
  nodeId: number;
  rootFsSize?: number;
  ipv4?: boolean;
  ipv6?: boolean;
  planetary?: boolean;
  cpu: number;
  memory: number;
  image: Image;
  envs?: Env[];
  ip?: string;
}

function __createDisks(disks: Disk[] = []) {
  return disks.map(({ name, size, mountPoint }) => {
    const disk = new DiskModel();
    disk.name = name;
    disk.size = size;
    disk.mountpoint = mountPoint;
    return disk;
  });
}

function __createEnvs(envs: Env[] = []) {
  return envs.reduce((res, env) => {
    res[env.key] = env.value;
    return res;
  }, {});
}

function __createNetwork() {
  const network = new NetworkModel();
  network.name = generateString(15, "NW");
  network.ip_range = "10.20.0.0/16";
  network.addAccess = false;
  return network;
}

export async function deployVM(options: VMOptions) {
  const vm = new MachineModel();
  vm.name = options.name;
  vm.node_id = options.nodeId;
  vm.disks = __createDisks(options.disks);
  vm.public_ip = options.ipv4 || false;
  vm.public_ip6 = options.ipv6 || false;
  vm.planetary = options.planetary || true;
  vm.cpu = options.cpu;
  vm.memory = options.memory;
  vm.rootfs_size = options.rootFsSize;
  vm.flist = options.image.flist;
  vm.entrypoint = options.image.entryPoint;
  vm.env = __createEnvs(options.envs);

  const vms = new MachinesModel();
  vms.name = options.name;
  vms.network = __createNetwork();
  vms.machines = [vm];

  const grid = await getGrid(options.mnemonics);
  return grid.machines.deploy(vms);
}
