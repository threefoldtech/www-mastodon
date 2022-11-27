import { getGrid } from "./grid";
import { generateString } from "./helpers";
import { isMnemonics, isValidSSH } from "./validators";

const { fb, validators } = window.tfSvelteRxForms;

export const mastodon = fb.group({
  mnemonics: [
    "",
    [validators.required("Mnemonics is required."), isMnemonics],
    [
      async (ctrl) => {
        try {
          await getGrid(ctrl.value);
        } catch {
          return { message: "Couldn't load grid using these mnemonic." };
        }
      },
    ],
  ],
  sshKey: [
    "",
    [
      validators.required("Public SSH Key is required."),
      isValidSSH("Public SSH Key doesn't seem to be valid."),
    ],
  ],

  name: [
    generateString(5, "md"),
    [
      validators.required("Mastodon instance's name is required."),
      validators.minLength("Name must be at least 2 chars.", 2),
      validators.maxLength("Name maxLength is 15 chars.", 15),
    ],
  ],
  cpu: [
    2,
    [
      validators.required("Cpu is required."),
      validators.isInt("Cpu must be a valid integer.", {
        allow_leading_zeroes: false,
      }),
      validators.min("Cpu min cores is 1.", 1),
      validators.max("Cpu max cores is 32.", 32),
    ],
  ],
  memory: [
    4096,
    [
      validators.required("Memory is required."),
      validators.isInt("Memory must be a valid integer.", {
        allow_leading_zeroes: false,
      }),
      validators.min("Minimum allowed memory is 256 MB.", 256),
      validators.max("Maximum allowed memory is 256 GB.", 262144),
    ],
  ],
  disk: [
    100,
    [
      validators.required("Disk is required."),
      validators.isInt("Disk must be a valid integer.", {
        allow_leading_zeroes: false,
      }),
      validators.min("Minimum allowed disk size is 10 GB.", 10),
      validators.max("Maximum allowed disk size is 10000 GB.", 10000),
    ],
  ],
  planetary: [true],
  ipv4: [false],
  gateway: [null as string, [validators.required("Gateway is required.")]],
  nodeId: [null as number, [validators.required("Node ID is required.")]],

  admin: fb.group({
    email: [
      "",
      [
        validators.required("Admin Email is required."),
        validators.isEmail("Invalid email format.", { require_tld: true }),
      ],
    ],
    username: [
      "admin",
      [
        validators.required("Admin Username is required."),
        validators.minLength("Username must be at least 2 chars.", 2),
        validators.maxLength("Username can't pass 15 chars.", 15),
      ],
    ],
    password: [
      generateString(15),
      [
        validators.required("Admin Password is required."),
        validators.minLength("Admin password must be at least 6 chars.", 6),
        validators.maxLength("Admin Password can't pass 15 chars.", 15),
      ],
    ],
  }),

  smtp: fb.group({
    enable: [false],
    email: [
      "",
      [
        validators.isEmail("Invalid email format.", {
          require_tld: true,
        }),
      ],
    ],
    password: [
      generateString(15),
      [
        validators.minLength("SMTP password must be at least 6 chars.", 6),
        validators.maxLength("SMTP Password can't pass 15 chars.", 15),
      ],
    ],
    server: [
      "",
      [validators.isURL("Invalid SMTP server.", { require_tld: true })],
    ],
    port: [null as number, [validators.isPort("Invalid SMTP port.")]],
  }),

  region: [null as string],

  certified: [false],

  tfConnect: [false],
});
