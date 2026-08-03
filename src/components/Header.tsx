import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { EASE, stagger } from "../lib/anim";
import { useActiveSection } from "../lib/useActiveSection";
import { Button } from "./ui/Button";

const SECTIONS = ["about", "projects", "services", "faq"] as const;

/** Past this many pixels the bar earns its glass. */
const SETTLED = 32;

export function Header() {
  const { t, lang, toggleLang } = useI18n();
  const [settled, setSettled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(SECTIONS);

  useEffect(() => {
    const onScroll = () => setSettled(window.scrollY > SETTLED);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // An open sheet owns the screen: the page behind it must not scroll, and
  // Escape has to close it for anyone who opened it from the keyboard.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const labels: Record<(typeof SECTIONS)[number], string> = {
    about: t.nav.about,
    projects: t.nav.projects,
    services: t.nav.services,
    faq: t.nav.faq,
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-full bg-[var(--stage-fg)] px-5 py-3 text-[var(--stage)] focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100]"
      >
        {t.nav.skipToContent}
      </a>

      {/* The pill is inset by its own padding so that the wordmark lands on
          the same vertical as the page gutter rather than 30px inside it.
          Hence the odd numbers: the outer padding and the max width are the
          container's, pulled back by the padding the pill adds inside. */}
      <header className="fixed inset-x-0 top-0 z-50 px-[calc(var(--gutter)-1rem)] pt-3 md:pt-5">
        <nav
          aria-label={t.nav.projects}
          className="relative mx-auto flex h-14 w-full max-w-[1232px] items-center md:h-16"
        >
          {/* The glass is a layer of its own so it can fade in once the page
              has moved. Over the hero the bar is just type on white — the
              first screen has nothing behind the header worth refracting, and
              a blur over flat white is only a grey rectangle. */}
          <div
            aria-hidden
            className={`glass absolute inset-0 rounded-full transition-opacity duration-500 ease-[var(--ease-hover)] ${
              settled ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="relative z-[3] flex w-full items-center gap-4 px-4">
            <a
              href="#top"
              className="font-display text-[1.05rem] font-extrabold tracking-[-0.04em] text-[var(--stage-fg)] transition-opacity duration-300 hover:opacity-70"
            >
              bringto
            </a>

            <ul className="ml-6 hidden items-center gap-1 lg:flex">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active === id ? "true" : undefined}
                    className="relative block px-3 py-2 text-[0.875rem] transition-colors duration-300"
                    style={{
                      color: active === id ? "var(--stage-fg)" : "var(--stage-fg-2)",
                    }}
                  >
                    {labels[id]}
                    {active === id && (
                      <motion.span
                        layoutId="nav-marker"
                        aria-hidden
                        className="absolute inset-x-3 -bottom-0.5 h-px"
                        style={{ background: "var(--stage-fg)" }}
                        transition={{ duration: 0.45, ease: EASE.settle }}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>

            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={toggleLang}
                aria-label={t.nav.language}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[0.8rem] font-medium tracking-[0.02em] transition-opacity duration-300 hover:opacity-70"
              >
                <span style={{ color: lang === "ru" ? "var(--stage-fg)" : "var(--stage-fg-3)" }}>
                  RU
                </span>
                <span aria-hidden style={{ color: "var(--stage-fg-3)" }}>
                  /
                </span>
                <span style={{ color: lang === "en" ? "var(--stage-fg)" : "var(--stage-fg-3)" }}>
                  EN
                </span>
              </button>

              {/* Hidden on the wrapper, not on the button. `hidden` and the
                  button's own `inline-flex` both set `display`, and which one
                  wins is decided by their order in the generated stylesheet
                  rather than by the order they are written in — so the button
                  stayed visible on phones. */}
              <div className="hidden md:block">
                <Button href="#contact" size="sm">
                  {t.nav.contact}
                </Button>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                className="relative -mr-1 grid h-10 w-10 place-items-center lg:hidden"
              >
                <span className="relative block h-3 w-5">
                  <motion.span
                    className="absolute left-0 block h-px w-5 origin-center"
                    style={{ background: "var(--stage-fg)" }}
                    animate={menuOpen ? { top: 6, rotate: 45 } : { top: 1, rotate: 0 }}
                    transition={{ duration: 0.4, ease: EASE.panel }}
                  />
                  <motion.span
                    className="absolute left-0 block h-px w-5 origin-center"
                    style={{ background: "var(--stage-fg)" }}
                    animate={menuOpen ? { top: 6, rotate: -45 } : { top: 11, rotate: 0 }}
                    transition={{ duration: 0.4, ease: EASE.panel }}
                  />
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE.panel }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "var(--stage)",
                backdropFilter: "blur(40px)",
              }}
            />
            <div className="relative flex h-full flex-col justify-center px-[var(--gutter)]">
              <ul className="flex flex-col gap-2">
                {SECTIONS.map((id, index) => (
                  <motion.li
                    key={id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{
                      duration: 0.6,
                      delay: stagger(index, 0.06),
                      ease: EASE.settle,
                    }}
                  >
                    <a
                      href={`#${id}`}
                      onClick={() => setMenuOpen(false)}
                      className="font-display block py-2 text-[clamp(2.2rem,10vw,3.2rem)] font-bold tracking-[-0.04em] text-[var(--stage-fg)]"
                    >
                      {labels[id]}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="mt-10"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.26, ease: EASE.settle }}
              >
                <Button href="#contact" onClick={() => setMenuOpen(false)} arrow>
                  {t.nav.contact}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
