/**
 * The contract between the two languages.
 *
 * One typed dictionary per language rather than an i18n library: a missing
 * string becomes a compile error instead of a blank spot in whichever language
 * nobody thinks to check.
 */

export type ProjectSlug =
  | "ai-sales"
  | "prmpt"
  | "japanese-restaurant"
  | "stipula-legal"
  | "nimbus-crm"
  | "productivity-bot"
  | "pag-commodities";

export type ContactKey = "telegram" | "email" | "discord" | "github" | "kwork";

export type ProjectCopy = {
  /** The product's own name. */
  title: string;
  /** What kind of thing it is, in the reader's language. */
  kind: string;
  description: string;
};

export type ContactCopy = {
  name: string;
  note: string;
  action: string;
};

export type Dict = {
  documentTitle: string;
  metaDescription: string;

  nav: {
    about: string;
    projects: string;
    services: string;
    faq: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    skipToContent: string;
  };

  hero: {
    /** Split in two because the halves are animated differently. */
    lineOne: string;
    lineTwo: string;
    invite: string;
    primary: string;
    secondary: string;
  };

  about: {
    title: string;
    paragraphs: readonly string[];
    /** Caption under the point field. */
    figure: string;
  };

  projects: {
    title: string;
    counterOf: string;
    flipHint: string;
    previous: string;
    next: string;
    open: string;
    back: string;
    items: Record<ProjectSlug, ProjectCopy>;
  };

  services: {
    title: string;
    lead: string;
    primaryTitle: string;
    primary: readonly string[];
    secondaryTitle: string;
    secondary: readonly string[];
  };

  approach: {
    /** Names the section for screen readers; the page shows the two lists. */
    title: string;
    negativeTitle: string;
    negative: readonly string[];
    positiveTitle: string;
    positive: readonly string[];
  };

  faq: {
    title: string;
    items: readonly { question: string; answer: string }[];
  };

  contact: {
    title: string;
    lead: string;
    cta: string;
    collapse: string;
    copied: string;
    items: Record<ContactKey, ContactCopy>;
  };

  finale: {
    line: string;
    sub: string;
    copyright: string;
    signature: string;
  };
};
