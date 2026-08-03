import { useEffect, useState, type CSSProperties } from "react";
import { Button } from "../../components/ui/Button";
import type { Contact } from "../../content/contacts";
import type { ContactCopy } from "../../content/types";
import { parseHex } from "../../lib/color";
import { surfaceVars } from "../../lib/surface";
import { Mark } from "./marks";

/**
 * The cards are bright glass on a black screen, so they cannot inherit the
 * page's foreground — that one is white, and white on white is nothing. Each
 * card is its own surface and derives its own text colours from the material
 * it is actually made of.
 */
const CARD_SURFACE = surfaceVars(parseHex("#ececed")) as CSSProperties;

/**
 * One contact, as a portrait card.
 *
 * Everything is centred. In a row that overlaps, whatever sits against a
 * card's left or right edge is the first thing the card in front of it covers;
 * a name at the midpoint is the one part nothing is ever on top of.
 */
export function ContactCard({
  contact,
  copy,
  copiedLabel,
  accent,
  primary = false,
  focusable,
}: {
  contact: Contact;
  copy: ContactCopy;
  copiedLabel: string;
  /** The service's own colour, for the mark. */
  accent: string;
  /** Telegram: the one card that carries a filled button. */
  primary?: boolean;
  focusable: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div
      className="card-glass flex h-full w-full flex-col items-center justify-between rounded-[2rem] px-6 py-9 text-center"
      style={CARD_SURFACE}
    >
      <div className="relative z-[3] flex flex-col items-center">
        <span
          className="card-tile mb-7 grid h-[74px] w-[74px] place-items-center rounded-[22px]"
          style={{ color: accent }}
        >
          <Mark service={contact.key} className="h-[34px] w-[34px]" />
        </span>

        <p className="font-display text-[1.45rem] leading-[1.15] font-extrabold tracking-[-0.035em] text-[var(--stage-fg)]">
          {copy.name}
        </p>

        {contact.copyable ? (
          <button
            type="button"
            tabIndex={focusable ? 0 : -1}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(contact.handle);
                setCopied(true);
              } catch {
                // Clipboard access can be refused; the link below still works,
                // so there is nothing to recover from and nothing worth saying.
              }
            }}
            className="mt-2.5 text-[0.8rem] text-[var(--stage-fg-3)] underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-[var(--stage-fg-2)]"
          >
            {copied ? copiedLabel : contact.handle}
          </button>
        ) : (
          <p className="mt-2.5 text-[0.8rem] text-[var(--stage-fg-3)]">{contact.handle}</p>
        )}

        <p className="mt-6 max-w-[20ch] text-[0.92rem] leading-[1.5] text-[var(--stage-fg-2)]">
          {copy.note}
        </p>
      </div>

      <div className="relative z-[3]">
        <Button
          href={contact.href}
          target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noreferrer"
          variant={primary ? "solid" : "ghost"}
          size="sm"
          arrow
          tabIndex={focusable ? 0 : -1}
        >
          {copy.action}
        </Button>
      </div>
    </div>
  );
}
