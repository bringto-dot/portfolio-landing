import type { ContactKey } from "../../content/types";

/**
 * One mark per service, drawn rather than imported.
 *
 * Five paths weigh less than an icon package and they are the only five this
 * page will ever need. Kwork has no widely-recognised glyph, so it gets its
 * initial set in the display face — an invented logo would be worse than a
 * letter.
 */
export function Mark({ service, className = "" }: { service: ContactKey; className?: string }) {
  if (service === "kwork") {
    return (
      <span
        aria-hidden
        className={`font-display grid place-items-center text-[1.7em] leading-none font-extrabold ${className}`}
      >
        K
      </span>
    );
  }

  const common = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className,
    fill: "currentColor",
  } as const;

  switch (service) {
    case "github":
      return (
        <svg {...common}>
          <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.24-.13-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.24a11.5 11.5 0 0 1 6.01 0c2.29-1.56 3.3-1.24 3.3-1.24.66 1.65.25 2.88.12 3.18.77.85 1.24 1.92 1.24 3.24 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
        </svg>
      );

    case "telegram":
      return (
        <svg {...common}>
          <path d="M23.07 3.28 20.2 20.4c-.22 1.3-1.03 1.62-2.08 1.01l-5.75-4.24-2.77 2.67c-.31.31-.57.57-1.16.57l.41-5.85L19.5 5.55c.46-.41-.1-.64-.72-.23L6.62 13.1 1 11.35c-1.22-.38-1.25-1.22.26-1.81L21.5 1.8c1.02-.37 1.91.24 1.57 1.48Z" />
        </svg>
      );

    case "discord":
      return (
        <svg {...common}>
          <path d="M20.32 4.37A19.79 19.79 0 0 0 15.43 3c-.22.38-.46.9-.63 1.3a18.3 18.3 0 0 0-5.6 0c-.17-.4-.42-.92-.64-1.3a19.74 19.74 0 0 0-4.89 1.37C.57 8.98-.27 13.47.15 17.9a19.9 19.9 0 0 0 6.07 3.07c.49-.67.92-1.38 1.3-2.13-.71-.27-1.4-.6-2.05-.98.17-.13.34-.26.5-.4a14.2 14.2 0 0 0 12.07 0c.16.14.33.27.5.4-.65.38-1.34.71-2.05.98.37.75.81 1.46 1.3 2.13a19.87 19.87 0 0 0 6.07-3.07c.5-5.13-.84-9.58-3.53-13.53ZM8.02 15.2c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.22 0 2.2 1.1 2.18 2.42 0 1.34-.96 2.42-2.18 2.42Zm7.96 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.22 0 2.2 1.1 2.18 2.42 0 1.34-.96 2.42-2.18 2.42Z" />
        </svg>
      );

    default:
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.6}>
          <rect x="2.2" y="4.6" width="19.6" height="14.8" rx="2.6" />
          <path d="m3.4 6.6 8.6 6.2 8.6-6.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
