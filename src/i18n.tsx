import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./content/en";
import { ru } from "./content/ru";
import type { Dict } from "./content/types";

export type Lang = "ru" | "en";

const STORAGE_KEY = "bringto.lang";

const DICTS: Record<Lang, Dict> = { ru, en };

/** A remembered choice first, then the browser's own preference, then Russian. */
function initialLang(): Lang {
  if (typeof window === "undefined") return "ru";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "ru" || stored === "en") return stored;

  const preferred = window.navigator.languages ?? [window.navigator.language];
  return preferred.some((code) => code.toLowerCase().startsWith("ru")) ? "ru" : "en";
}

type I18nValue = {
  lang: Lang;
  t: Dict;
  toggleLang: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  const toggleLang = useCallback(() => {
    setLang((current) => {
      const next: Lang = current === "ru" ? "en" : "ru";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  // The document is part of the translation. Screen readers announce in the
  // language `lang` claims, search engines index the title and description, and
  // none of the three update themselves.
  useEffect(() => {
    const dict = DICTS[lang];
    document.documentElement.lang = lang;
    document.title = dict.documentTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", dict.metaDescription);
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({ lang, t: DICTS[lang], toggleLang }),
    [lang, toggleLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
