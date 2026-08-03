import { useEffect, useState } from "react";
import { GlassPanel } from "../../components/ui/GlassPanel";
import type { Contact } from "../../content/contacts";
import type { ContactCopy } from "../../content/types";

/**
 * The fan is symmetric, so its content is too.
 *
 * A card's name lives in one top corner, and in a fan the middle card covers
 * the inner edge of everything beside it. Left-align all five and the two on
 * the right lose the one word that says what they are. Mirroring the pair on
 * the right puts their names on their outer edge, where nothing is over them —
 * and a symmetric composition with symmetric contents is the reading the
 * layout was asking for anyway.
 */
export function ContactCard({
  contact,
  copy,
  copiedLabel,
  focusable,
  align = "left",
}: {
  contact: Contact;
  copy: ContactCopy;
  copiedLabel: string;
  focusable: boolean;
  align?: "left" | "right";
}) {
  const [copied, setCopied] = useState(false);
  const mirrored = align === "right";

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handle = contact.copyable ? (
    <button
      type="button"
      tabIndex={focusable ? 0 : -1}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(contact.handle);
          setCopied(true);
        } catch {
          // Clipboard access can be refused; the link below still works, so
          // there is nothing to recover from and nothing worth shouting about.
        }
      }}
      className="text-[0.82rem] text-[var(--stage-fg-3)] underline decoration-dotted underline-offset-4 transition-colors duration-300 hover:text-[var(--stage-fg-2)]"
    >
      {copied ? copiedLabel : contact.handle}
    </button>
  ) : (
    <p className="text-[0.82rem] text-[var(--stage-fg-3)]">{contact.handle}</p>
  );

  return (
    <GlassPanel
      sheen
      radius="1.25rem"
      className={`flex h-full w-full flex-col justify-between p-6 ${
        mirrored ? "items-end text-right" : ""
      }`}
    >
      <div className="relative z-[3]">
        <p className="font-display text-[1.15rem] font-extrabold tracking-[-0.03em]">
          {copy.name}
        </p>
        <div className="mt-1.5">{handle}</div>
        <p className="mt-5 text-[0.88rem] leading-[1.55] text-[var(--stage-fg-2)]">
          {copy.note}
        </p>
      </div>

      <a
        href={contact.href}
        target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noreferrer"
        tabIndex={focusable ? 0 : -1}
        className={`group/action relative z-[3] mt-6 inline-flex items-center gap-2 text-[0.9rem] font-medium transition-opacity duration-300 hover:opacity-70 ${
          mirrored ? "self-end" : "self-start"
        }`}
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
