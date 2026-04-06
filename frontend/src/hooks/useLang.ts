import { useState, useCallback } from "react";

export type Lang = "en" | "es";

export interface UseLangReturn {
  lang: Lang;
  setLang: (lang: Lang) => void;
  langParam: string; // "?lang=es" or ""
}

export function useLang(): UseLangReturn {
  const [lang, setLangState] = useState<Lang>("es");

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
  }, []);

  const langParam = lang === "en" ? "" : `lang=${lang}`;

  return { lang, setLang, langParam };
}
