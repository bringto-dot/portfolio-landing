import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Container, Section } from "../components/layout/Section";
import { Accented, plain } from "../components/ui/Accented";
import { Button } from "../components/ui/Button";
import { GlassPanel } from "../components/ui/GlassPanel";
import { CONTACTS } from "../content/contacts";
import type { ContactKey } from "../content/types";
import { useI18n } from "../i18n";
import { EASE, stagger } from "../lib/anim";
import { useMediaQuery } from "../lib/useMediaQuery";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useStageSection } from "../stage/useStageSection";
import { ContactCard } from "./contact/ContactCard";

/** The one card size. Everything else is this, scaled. */
const CARD_W = 340;
const CARD_H = 440;

type Seat = { x: number; scale: number; rotate: number; z: number };

/**
 * Five cards in a row, largest in the middle, each overlapping its neighbour.
 *
 * Telegram is the main way to reach me, so it is the card at full size in the
 * centre — and it is not a sixth card that appears, it is the invitation card
 * turning over. The other four leave from underneath it, two each way.
 *
 * Every seat is the same card scaled about its own centre, which is why the
 * proportions stay identical across all five and the row reads as one object
 * rather than five different ones.
 */
const SEATS: Record<ContactKey, Seat> = {
  github: { x: -440, scale: 0.76, rotate: -3, z: 10 },
  email: { x: -240, scale: 0.88, rotate: -1.5, z: 20 },
  telegram: { x: 0, scale: 1, rotate: 0, z: 40 },
  discord: { x: 240, scale: 0.88, rotate: 1.5, z: 20 },
  kwork: { x: 440, scale: 0.76, rotate: 3, z: 10 },
};

/** Each service's own colour, for the mark on the card and the light under it. */
const ACCENT: Record<ContactKey, string> = {
  telegram: "#29a9ea",
  discord: "#5865f2",
  kwork: "#22b573",
  email: "#f0b429",
  github: "#3a3a40",
};

const SATELLITES = CONTACTS.filter((contact) => contact.key !== "telegram");
const TELEGRAM = CONTACTS.find((contact) => contact.key === "telegram")!;

/**
 * The light a card gives off when it is the one being looked at.
 *
 * Two layers: a wide, soft pool that spills past the card's edges, and a
 * tighter one that hugs it. One layer alone is either a flat colour wash or a
 * hard halo — the pair is what reads as something lit from behind.
 */
function Glow({ colour, on }: { colour: string; on: boolean }) {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-14 -z-10 transition-opacity duration-500 ease-[var(--ease-hover)]"
        style={{
          background: `radial-gradient(closest-side, ${colour}, transparent 72%)`,
          filter: "blur(44px)",
          opacity: on ? 0.5 : 0,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] transition-opacity duration-500 ease-[var(--ease-hover)]"
        style={{
          background: `radial-gradient(closest-side, ${colour}, transparent 68%)`,
          filter: "blur(18px)",
          opacity: on ? 0.55 : 0,
        }}
      />
    </>
  );
}

export function Contact() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<ContactKey | null>(null);

  useStageSection(ref, "#ffffff");

  const seatOf = (key: ContactKey) => {
    const seat = SEATS[key];
    const lifted = hovered === key;
    const dimmed = hovered !== null && !lifted;

    return {
      opacity: dimmed ? 0.5 : 1,
      x: seat.x,
      y: lifted ? -16 : 0,
      rotate: lifted ? 0 : seat.rotate,
      scale: seat.scale * (lifted ? 1.04 : 1),
    };
  };

  const card = (key: ContactKey, contact = CONTACTS.find((c) => c.key === key)!, opaque = false) => (
    <ContactCard
      contact={contact}
      copy={t.contact.items[key]}
      copiedLabel={t.contact.copied}
      accent={ACCENT[key]}
      focusable={open}
      opaque={opaque}
    />
  );

  return (
    <Section
      id="contact"
      ref={ref}
      labelledBy="contact-title"
      className="flex min-h-[100svh] flex-col justify-center py-24"
    >
      <h2 id="contact-title" className="sr-only">
        {plain(t.contact.title)}
      </h2>

      <Container>
        {wide ? (
          <div className="contact-fan relative mx-auto" style={{ height: CARD_H }}>
            {/* The four that leave from under the middle card. They start
                stacked dead centre at the size the invitation was, so the row
                reads as that one card opening rather than four new ones
                arriving from off-screen. */}
            {SATELLITES.map((contact, index) => (
              <motion.div
                key={contact.key}
                className="absolute top-0 left-1/2"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  marginLeft: -CARD_W / 2,
                  zIndex: hovered === contact.key ? 60 : SEATS[contact.key].z,
                }}
                initial={false}
                animate={
                  open
                    ? seatOf(contact.key)
                    : { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.86 }
                }
                transition={{
                  duration: still ? 0 : 0.85,
                  delay: still || !open ? 0 : 0.35 + stagger(index, 0.06, 0.2),
                  ease: EASE.settle,
                }}
                onMouseEnter={() => open && setHovered(contact.key)}
                onMouseLeave={() => setHovered(null)}
                inert={!open}
              >
                <Glow colour={ACCENT[contact.key]} on={hovered === contact.key} />
                {card(contact.key, contact)}
              </motion.div>
            ))}

            {/* The middle card. One object with two faces: the invitation, and
                Telegram on its reverse. Both faces are solid — a translucent
                face lets the one behind it show through mirror-imaged the
                moment the compositor flattens the 3D context. */}
            <motion.div
              className="absolute top-0 left-1/2"
              style={{
                width: CARD_W,
                height: CARD_H,
                marginLeft: -CARD_W / 2,
                perspective: 1800,
                zIndex: hovered === "telegram" ? 60 : SEATS.telegram.z,
              }}
              animate={open ? seatOf("telegram") : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              transition={{ duration: still ? 0 : 0.85, ease: EASE.settle }}
              onMouseEnter={() => open && setHovered("telegram")}
              onMouseLeave={() => setHovered(null)}
            >
              <Glow colour={ACCENT.telegram} on={hovered === "telegram"} />

              <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: open ? 180 : 0 }}
                transition={{ duration: still ? 0 : 1, ease: EASE.panel }}
              >
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  <Invite
                    title={t.contact.title}
                    lead={t.contact.lead}
                    cta={t.contact.cta}
                    onOpen={() => setOpen(true)}
                    focusable={!open}
                  />
                </div>

                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {card("telegram", TELEGRAM, true)}
                </div>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4">
            {!open ? (
              <div style={{ height: CARD_H }}>
                <Invite
                  title={t.contact.title}
                  lead={t.contact.lead}
                  cta={t.contact.cta}
                  onOpen={() => setOpen(true)}
                  focusable
                />
              </div>
            ) : (
              CONTACTS.map((contact, index) => (
                <motion.div
                  key={contact.key}
                  style={{ height: 300 }}
                  initial={still ? { opacity: 0 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: still ? 0 : 0.6,
                    delay: still ? 0 : stagger(index, 0.06, 0.3),
                    ease: EASE.settle,
                  }}
                >
                  {card(contact.key, contact)}
                </motion.div>
              ))
            )}
          </div>
        )}

        <AnimatePresence>
          {open && (
            <motion.div
              className="mt-12 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: EASE.settle }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setHovered(null);
                }}
                className="text-[0.85rem] text-[var(--stage-fg-3)] transition-colors duration-300 hover:text-[var(--stage-fg)]"
              >
                {t.contact.collapse}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Section>
  );
}

function Invite({
  title,
  lead,
  cta,
  onOpen,
  focusable,
}: {
  title: string;
  lead: string;
  cta: string;
  onOpen: () => void;
  focusable: boolean;
}) {
  return (
    <GlassPanel
      sheen
      flat
      radius="1.5rem"
      className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
      style={{ background: "color-mix(in srgb, var(--stage-fg) 4%, var(--stage))" }}
    >
      <p className="font-display relative z-[3] text-[clamp(1.6rem,2.4vw,2.1rem)] leading-[1.1] font-extrabold tracking-[-0.035em]">
        <Accented text={title} />
      </p>
      <p className="relative z-[3] mt-5 max-w-[24ch] text-[0.95rem] leading-[1.55] text-[var(--stage-fg-2)]">
        {lead}
      </p>
      <div className="relative z-[3] mt-9">
        <Button onClick={onOpen} arrow tabIndex={focusable ? 0 : -1}>
          {cta}
        </Button>
      </div>
    </GlassPanel>
  );
}
