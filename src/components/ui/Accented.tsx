import { Fragment } from "react";

/**
 * Sets the word between asterisks in the display serif italic.
 *
 * The whole site turns on one sentence: an idea, then the quality of the build.
 * So the type says it too. Everything structural is set in the grotesk — the
 * engineered voice — and exactly one word per heading, the one carrying the
 * human half of that sentence, is set in a high-contrast serif italic. «идеи»,
 * «помочь», «ваш». One device, used sparingly, doing the same work as the
 * words.
 *
 * The marker lives in the dictionary string rather than in a second field, so a
 * translator moves the emphasis by moving the asterisks and nothing in the
 * component needs to know which language it is looking at.
 *
 * Playfair's x-height runs smaller than Manrope's at the same point size, so
 * the serif is set slightly larger to sit optically level rather than
 * mathematically level.
 */
export function Accented({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split("*");

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          // The negative right margin closes the gap a slanted face leaves
          // before an upright neighbour. An italic's last stroke leans out over
          // its own sidebearing, so «идеи» followed by a roman full stop sits a
          // visible step apart until the space is taken back.
          <em
            key={index}
            className={`font-serif -mr-[0.045em] text-[1.09em] leading-[0.9] font-medium tracking-[-0.005em] italic ${className}`}
          >
            {part}
          </em>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** The same string with the markers taken out, for `alt`, `title` and labels. */
export const plain = (text: string) => text.replace(/\*/g, "");
