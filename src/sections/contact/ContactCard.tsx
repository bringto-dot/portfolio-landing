import { useEffect, useState } from "react";
import { GlassPanel } from "../../components/ui/GlassPanel";
import type { Contact } from "../../content/contacts";
import type { ContactCopy } from "../../content/types";

/**
 * One contact, as a portrait card.
 *
 * Everything is centred. In a fan the middle card covers the inner edge of the
 * ones beside it, so anything set against a card's left or right edge is the
 * first thing to disappear — centred, a name sits at the card's midpoint, which
 * is the one part of it nothing else is ever on top of.
 */
export function ContactCard({
  contact,
  copy,
  copiedLabel,
  accent,
  focusable,
  opaque = false,
}: {
  contact: Contact;
  copy: ContactCopy;
  copiedLabel: string;
  /** The service's own colour, used for the mark and the glow behind. */
  accent: string;
  focusable: boolean;
  /** Solid rather than translucent — required on a face that flips. */
  opaque?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <GlassPanel
      sheen
      flat={opaque}
      radius="1.5rem"
      className="flex h-full w-full flex-col items-center justify-between p-7 text-center"
      style={
        opaque
          ? { background: "color-mix(in srgb, var(--stage-fg) 4%, var(--stage))" }
          : undefined
      }
    >
      <div className="relative z-[3] flex flex-col items-center">
        {/* The service's colour, once, at the size of a full stop. Enough to
            tell the five cards apart at a glance without any of them becoming
            a brand advertisement. */}
        <span
          aria-hidden
          className="mb-5 block h-[7px] w-[7px] rounded-full"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
        <p className="font-display text-[1.3rem] font-extrabold tracking-[-0.035em]">
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
            className="pointer-events-auto mt-1.5 text-[0.82rem] text-[var(--stage-fg-3)] underline decoration-dotted underline-offset-4 transition-colors duration-300 hover:text-[var(--stage-fg-2)]"
          >
            {copied ? copiedLabel : contact.handle}
          </button>
        ) : (
          <p className="mt-1.5 text-[0.82rem] text-[var(--stage-fg-3)]">{contact.handle}</p>
        )}
      </div>

      <p className="relative z-[3] max-w-[22ch] text-[0.9rem] leading-[1.55] text-[var(--stage-fg-2)]">
        {copy.note}
      </p>

      <a
        href={contact.href}
        target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noreferrer"
        tabIndex={focusable ? 0 : -1}
        className="group/action pointer-events-auto relative z-[3] inline-flex items-center gap-2 text-[0.92rem] font-medium transition-opacity duration-300 hover:opacity-70"
      >
        {copy.action}
        <span
          aria-hidden
          className="transition-transform duration-300 ease-[var(--ease-hover)] group-hover/action:translate-x-[3px]"
        >
          →
        </span>
      </a>
    </GlassPanel>
  );
}
