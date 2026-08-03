import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Container, Section } from "../components/layout/Section";
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

const CARD_W = 250;
const CARD_H = 280;

/**
 * Where each card sits once the fan is open, measured from the centre.
 *
 * Telegram is the main way to reach me, so it is the one at full size, square
 * on, and in front. The other four sit behind it at the corners — and the
 * overlap is the point: a card's backdrop blur then has the card behind it to
 * work on, which is the only honest way to do glass on a white page.
 *
 * The lower pair is pushed out far enough that its names clear Telegram's
 * edge. A card's name sits at its top left, so tucking the right-hand ones
 * under the middle by even a little hides the one word that says what they
 * are — the geometry has to be solved from the text outwards.
 */
const FAN: Record<ContactKey, { x: number; y: number; rotate: number; scale: number; z: number }> =
  {
    telegram: { x: 0, y: 0, rotate: 0, scale: 1, z: 50 },
    github: { x: -250, y: 22, rotate: -5, scale: 0.9, z: 20 },
    email: { x: 250, y: 22, rotate: 5, scale: 0.9, z: 20 },
    kwork: { x: -142, y: 150, rotate: -3, scale: 0.84, z: 34 },
    discord: { x: 142, y: 150, rotate: 3, scale: 0.84, z: 34 },
  };

/** Which side of its card the name sits on, so nothing covers it. */
const ALIGN: Record<ContactKey, "left" | "right"> = {
  telegram: "left",
  github: "left",
  kwork: "left",
  email: "right",
  discord: "right",
};

/** Reaches the bottom of the lowest card, which scales about its own centre. */
const FAN_HEIGHT =
  FAN.kwork.y + CARD_H / 2 + (CARD_H * FAN.kwork.scale) / 2 + 20;

export function Contact() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const fans = useMediaQuery("(min-width: 1024px)");

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<ContactKey | null>(null);

  useStageSection(ref, "#ffffff");

  return (
    <Section
      id="contact"
      ref={ref}
      labelledBy="contact-title"
      className="flex min-h-[100svh] flex-col justify-center py-28 md:py-32"
    >
      <h2 id="contact-title" className="sr-only">
        {t.contact.title}
      </h2>

      <Container>
        <div
          className="relative mx-auto w-full max-w-[600px] lg:max-w-none"
          style={fans ? { height: FAN_HEIGHT } : undefined}
        >
          <AnimatePresence initial={false}>
            {!open ? (
              <motion.div
                key="invite"
                className="lg:absolute lg:inset-x-0 lg:top-[6%]"
                initial={still ? undefined : { opacity: 0, scale: 0.96 }}
                animate={still ? undefined : { opacity: 1, scale: 1 }}
                exit={still ? undefined : { opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: EASE.settle }}
              >
                <GlassPanel
                  sheen
                  radius="1.75rem"
                  className="mx-auto flex w-full max-w-[600px] flex-col items-center p-9 text-center md:p-12"
                >
                  <p className="font-display relative z-[3] max-w-[14ch] text-[clamp(1.8rem,4vw,2.9rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
                    {t.contact.title}
                  </p>
                  <p className="relative z-[3] mt-5 max-w-[38ch] text-[clamp(0.95rem,1.2vw,1.06rem)] text-[var(--stage-fg-2)]">
                    {t.contact.lead}
                  </p>
                  <div className="relative z-[3] mt-9">
                    <Button onClick={() => setOpen(true)} arrow>
                      {t.contact.cta}
                    </Button>
                  </div>
                </GlassPanel>
              </motion.div>
            ) : (
              <motion.div
                key="fan"
                className="flex flex-col gap-4 lg:block"
                onMouseLeave={() => setHovered(null)}
              >
                {CONTACTS.map((contact, index) => {
                  const seat = FAN[contact.key];
                  const lifted = hovered === contact.key;
                  const dimmed = hovered !== null && !lifted;

                  // Every card starts stacked at dead centre, exactly where the
                  // invitation card was, so the fan reads as that one card
                  // opening rather than as five new ones appearing.
                  const placed = fans
                    ? {
                        opacity: dimmed ? 0.42 : 1,
                        x: seat.x,
                        y: seat.y - (lifted ? 18 : 0),
                        rotate: seat.rotate * (lifted ? 0.25 : 1),
                        scale: seat.scale * (lifted ? 1.05 : 1),
                      }
                    : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 };

                  return (
                    <motion.div
                      key={contact.key}
                      className="lg:absolute lg:top-0 lg:left-1/2"
                      style={
                        fans
                          ? {
                              width: CARD_W,
                              height: CARD_H,
                              marginLeft: -CARD_W / 2,
                              zIndex: lifted ? 60 : seat.z,
                            }
                          : undefined
                      }
                      initial={
                        still || !fans
                          ? { opacity: 0 }
                          : { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.84 }
                      }
                      animate={placed}
                      exit={
                        still || !fans
                          ? { opacity: 0 }
                          : { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.84 }
                      }
                      transition={{
                        duration: still ? 0 : 0.8,
                        delay: still ? 0 : stagger(index, 0.05, 0.22),
                        ease: EASE.settle,
                      }}
                      onMouseEnter={() => fans && setHovered(contact.key)}
                    >
                      <ContactCard
                        contact={contact}
                        copy={t.contact.items[contact.key]}
                        copiedLabel={t.contact.copied}
                        focusable
                        align={fans ? ALIGN[contact.key] : "left"}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="mt-10 flex justify-center lg:mt-14"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: EASE.settle }}
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
