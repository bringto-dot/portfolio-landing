import type { ContactKey } from "./types";

export type Contact = {
  key: ContactKey;
  /** Where the card's button goes. */
  href: string;
  /** The address itself, shown small under the name. */
  handle: string;
  /**
   * Discord has no public profile URL that resolves from a username, only from
   * a numeric id — and even that opens the app rather than a page for anyone
   * not signed in. So the handle is offered to the clipboard as well, which is
   * how people actually add each other there.
   */
  copyable?: boolean;
};

export const CONTACTS: readonly Contact[] = [
  { key: "telegram", href: "https://t.me/br1ngto", handle: "@br1ngto" },
  { key: "email", href: "mailto:timetofix90@gmail.com", handle: "timetofix90@gmail.com" },
  {
    key: "discord",
    href: "https://discord.com/users/1374359169146163251",
    handle: "uchenik_serafima",
    copyable: true,
  },
  { key: "github", href: "https://github.com/bringto-dot", handle: "bringto-dot" },
  { key: "kwork", href: "https://kwork.ru/user/timetofix90", handle: "timetofix90" },
];
