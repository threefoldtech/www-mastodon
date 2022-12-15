const { validators } = window.tfSvelteRxForms;
import type { FormControl, FormGroup } from "tf-svelte-rx-forms";

const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const ALPHA = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
const ALL = [...NUMBERS, ...ALPHA];
const relays = [
  "https://mastodon-relay.moew.science/inbox",
  "https://relay.beckmeyer.us/inbox",
  "https://relay.fedi.agency/inbox",
  "https://relay.fedinet.social/inbox",
  "https://relay.flm9.me/inbox",
  "https://relay.froth.zone/inbox",
  "https://relay.gruenehoelle.nl/inbox",
  "https://relay.homunyan.com/inbox",
  "https://relay.intahnet.co.uk/inbox",
  "https://relay.libranet.de/inbox",
  "https://relay.masto.la/inbox",
  "https://relay.minecloud.ro/inbox",
  "https://relay.mistli.net/inbox",
  "https://relay.pissdichal.de/inbox",
  "https://relay.toot.yukimochi.jp/inbox",
  "https://relay.uggs.io/inbox",
  "https://relay.wagnersnetz.de/inbox",
  "https://relay.wig.gl/inbox",
  "https://relay.dog/inbox",
  "https://relay.darmstadt.social/inbox",
  "https://relay.douzepoints.social/inbox"
]

export function getRelays(){
  return relays
}

export function generateString(
  length: number = 10,
  prefix: string = getRandomValue(ALPHA)
): string {
  length = length - prefix.length;
  for (let i = 0; i < length; i++) prefix += getRandomValue(ALL);
  return prefix;
}

export function getRandomValue<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

const emailReq = validators.required("SMTP Email is required.");
const passwordReq = validators.required("SMTP Password is required.");
const serverReq = validators.required("SMTP Server is required.");
const portReq = validators.required("SMTP Port is required.");
export function toggleSMTPRequired(
  mastodon: FormGroup<{
    smtp: FormGroup<{
      email: FormControl<string>;
      password: FormControl<string>;
      server: FormControl<string>;
      port: FormControl<number>;
    }>;
  }>,
  required: boolean
) {
  const smtp = mastodon.get("smtp");
  const email = smtp.get("email");
  const password = smtp.get("password");
  const server = smtp.get("server");
  const port = smtp.get("port");

  if (required) {
    email.addValidator(emailReq, 0);
    password.addValidator(passwordReq, 0);
    server.addValidator(serverReq, 0);
    port.addValidator(portReq, 0);
  } else {
    email.removeValidator(emailReq);
    password.removeValidator(passwordReq);
    server.removeValidator(serverReq);
    port.removeValidator(portReq);
  }

  smtp.validate();
}

export function listenUntillUp(url: string): [Promise<true>, () => void] {
  let interval: any;
  return [
    new Promise<true>((resolve) => {
      interval = setInterval(() => {
        fetch(`${url}/api/v1/trends/statuses`)
          .then((res) => {
            if (res.status === 200) {
              resolve(true);
              clearInterval(interval);
            }
          })
          .catch(() => null);
      }, 10000);
    }),
    () => clearInterval(interval),
  ];
}
