import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import { Container, Section } from "../components/layout/Section";
import { Accented, plain } from "../components/ui/Accented";
import { Button } from "../components/ui/Button";
import { CONTACTS } from "../content/contacts";
import type { ContactKey } from "../content/types";
import { useI18n } from "../i18n";
import { EASE, stagger } from "../lib/anim";
import { parseHex } from "../lib/color";
import { surfaceVars } from "../lib/surface";
import { useFitScale, useMediaQuery } from "../lib/useMediaQuery";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useStageSection } from "../stage/useStageSection";
import { ContactCard } from "./contact/ContactCard";

/** The one card size. Everything else is this, scaled about its own centre. */
const CARD_W = 380;
const CARD_H = 540;

/** Width of the whole row at scale 1, from the outermost card edges. */
const FAN_W = 1568;

type Seat = { x: number; scale: number; z: number };

/**
 * Five cards in a row, largest in the middle, set edge to edge.
 *
 * Edge to edge and not overlapping, which took two tries to get right: two
 * translucent fills composited on top of each other land near opaque, so every
 * seam came out brighter than either card and the row read as a set of white
 * stripes. Panes of glass standing side by side do the same job without that.
 *
 * Telegram is the main way to reach me, so it is the card at full size in the
 * centre — and it is not a sixth card that appears, it is the invitation card
 * turning over. The other four leave from underneath it, two each way.
 */
const SEATS: Record<ContactKey, Seat> = {
  github: { x: -647, scale: 0.72, z: 10 },
  email: { x: -350, scale: 0.84, z: 20 },
  telegram: { x: 0, scale: 1, z: 40 },
  discord: { x: 350, scale: 0.84, z: 20 },
  kwork: { x: 647, scale: 0.72, z: 10 },
};

/**
 * Two colours per service: the mark, drawn on bright glass, and the light
 * thrown under the card, which lands on black.
 *
 * They are the same value four times out of five. GitHub's is black, and black
 * cannot be a light source — so its mark stays black and the pool under it is
 * the silver its logo reads as, which is the only version of "black" that a
 * lamp can actually be.
 */
const MARK: Record<ContactKey, string> = {
  telegram: "#29a9ea",
  discord: "#5865f2",
  kwork: "#22b573",
  email: "#e0a41c",
  github: "#17171b",
};

const GLOW: Record<ContactKey, string> = {
  telegram: "#29a9ea",
  discord: "#5865f2",
  kwork: "#22b573",
  email: "#f0b429",
  github: "#c6c6d4",
};

const CARD_SURFACE = surfaceVars(parseHex("#ececed")) as CSSProperties;

const SATELLITES = CONTACTS.filter((contact) => contact.key !== "telegram");

/** How quickly a card answers the pointer. Short enough to feel like a catalogue. */
const HOVER = { duration: 0.2, ease: EASE.hover };

/**
 * The light a card throws when it is the one being chosen.
 *
 * Under the card, not on it: a pool centred on its lower edge and spilling
 * below, the way a lit object sits on a dark surface. Painting the colour over
 * the card itself only tints the glass.
 */
function Glow({ colour, on }: { colour: string; on: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-x-[-24%] top-[70%] bottom-[-30%] -z-10"
      style={{
        // The bright centre has to sit *below* the card's lower edge. Centred
        // on the card the card covers it, and all that escapes is the faint
        // outer falloff — which is why the first version looked like nothing.
        background: `radial-gradient(52% 58% at 50% 62%, ${colour}, transparent 74%)`,
        filter: "blur(38px)",
      }}
      animate={{ opacity: on ? 1 : 0 }}
      transition={HOVER}
    />
  );
}

export function Contact() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const fanScale = useFitScale(FAN_W);

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<ContactKey | null>(null);

  // Ink, not paper. The questions above end on white, and bright glass cards on
  // a white page are invisible — this is the one section whose material needs a
  // dark room to be seen in.
  useStageSection(ref, "#0a0a0b");

  /**
   * The two animations are on two elements on purpose.
   *
   * The outer one runs the opening: cards travel out from the centre, staggered.
   * The inner one answers the pointer, and it must not inherit that stagger —
   * with both on one element, hovering a card waited out the opening delay
   * before anything moved, so the row felt slow to the touch. Split, the
   * choreography stays leisurely and the response is immediate.
   */
  const response = (key: ContactKey) => {
    const lifted = hovered === key;
    const dimmed = hovered !== null && !lifted;
    return { y: lifted ? -26 : 0, scale: lifted ? 1.05 : 1, opacity: dimmed ? 0.55 : 1 };
  };

  const card = (key: ContactKey) => {
    const contact = CONTACTS.find((entry) => entry.key === key)!;
    return (
      <ContactCard
        contact={contact}
        copy={t.contact.items[key]}
        copiedLabel={t.contact.copied}
        accent={MARK[key]}
        primary={key === "telegram"}
        focusable={open}
      />
    );
  };

  return (
    <Section
      id="contact"
      ref={ref}
      labelledBy="contact-title"
      className="flex min-h-[100svh] flex-col justify-center py-20"
    >
      <h2 id="contact-title" className="sr-only">
        {plain(t.contact.title)}
      </h2>

      <Container>
        {wide ? (
          <div
            className="contact-fan relative left-1/2"
            style={{
              width: FAN_W,
              height: CARD_H,
              marginLeft: -FAN_W / 2,
              // Give back the height the scale took, so the section below is
              // not left with a gap the row no longer occupies.
              marginBottom: (fanScale - 1) * CARD_H,
              ["--fan-scale" as string]: fanScale,
            }}
          >
            {/* The room the glass is standing in.
                A frosted pane is only bright if something is lighting it, and
                on a black screen there is nothing — the cards came out grey.
                This is the ambient pool they sit in, and the reason the fill
                can stay light enough that overlapping two of them does not
                blow out. */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-[6%] top-[6%] bottom-[-4%] -z-20"
              style={{
                background:
                  "radial-gradient(56% 60% at 50% 50%, rgb(255 255 255 / 0.4), rgb(255 255 255 / 0.1) 58%, transparent 76%)",
                filter: "blur(60px)",
              }}
              animate={{ opacity: open ? 1 : 0.7 }}
              transition={{ duration: 0.8, ease: EASE.settle }}
            />

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
                    ? { opacity: 1, x: SEATS[contact.key].x, scale: SEATS[contact.key].scale }
                    : { opacity: 0, x: 0, scale: 0.86 }
                }
                transition={{
                  duration: still ? 0 : 0.85,
                  delay: still || !open ? 0 : 0.32 + stagger(index, 0.06, 0.2),
                  ease: EASE.settle,
                }}
                inert={!open}
              >
                <motion.div
                  className="relative h-full w-full"
                  animate={response(contact.key)}
                  transition={HOVER}
                  onMouseEnter={() => open && setHovered(contact.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Glow colour={GLOW[contact.key]} on={hovered === contact.key} />
                  {card(contact.key)}
                </motion.div>
              </motion.div>
            ))}

            {/* The middle card. One object with two faces: the invitation, and
                Telegram on its reverse. */}
            <motion.div
              className="absolute top-0 left-1/2"
              style={{
                width: CARD_W,
                height: CARD_H,
                marginLeft: -CARD_W / 2,
                zIndex: hovered === "telegram" ? 60 : SEATS.telegram.z,
              }}
            >
              <motion.div
                className="relative h-full w-full"
                // The perspective belongs to the flip container's direct
                // parent. One level higher and the browser applies none, so the
                // card turned flat instead of through space.
                style={{ perspective: 2000 }}
                animate={open ? response("telegram") : { y: 0, scale: 1, opacity: 1 }}
                transition={HOVER}
                onMouseEnter={() => open && setHovered("telegram")}
                onMouseLeave={() => setHovered(null)}
              >
                <Glow colour={GLOW.telegram} on={hovered === "telegram"} />

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
                    {card("telegram")}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[400px] flex-col gap-5">
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
                  className="relative"
                  style={{ height: 400 }}
                  initial={still ? { opacity: 0 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: still ? 0 : 0.6,
                    delay: still ? 0 : stagger(index, 0.06, 0.3),
                    ease: EASE.settle,
                  }}
                >
                  <Glow colour={GLOW[contact.key]} on />
                  {card(contact.key)}
                </motion.div>
              ))
            )}
          </div>
        )}

        <AnimatePresence>
          {open && (
            <motion.div
              className="mt-14 flex justify-center"
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

/** The face that turns into Telegram. Same size, same material, same shape. */
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
    <div
      className="card-glass flex h-full w-full flex-col items-center justify-center rounded-[2rem] px-8 text-center"
      style={CARD_SURFACE}
    >
      <p className="font-display relative z-[3] text-[clamp(1.8rem,2.6vw,2.35rem)] leading-[1.08] font-extrabold tracking-[-0.035em] text-[var(--stage-fg)]">
        <Accented text={title} />
      </p>
      <p className="relative z-[3] mt-6 max-w-[24ch] text-[0.98rem] leading-[1.55] text-[var(--stage-fg-2)]">
        {lead}
      </p>
      <div className="relative z-[3] mt-10">
        <Button onClick={onOpen} arrow tabIndex={focusable ? 0 : -1}>
          {cta}
        </Button>
      </div>
    </div>
  );
}
