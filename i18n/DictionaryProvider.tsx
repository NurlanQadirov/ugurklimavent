"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Company } from "@/lib/content";

import type { Locale } from "./config";
import type { SiteDictionary } from "./types";

type DictionaryValue = {
  locale: Locale;
  dict: SiteDictionary;
};

const DictionaryContext = createContext<DictionaryValue | null>(null);

/**
 * The dictionary is resolved once on the server and handed down as a plain,
 * serializable object. Client Components read it out of context rather than
 * fetching or detecting anything themselves — the markup React hydrates is
 * byte-identical to the markup the server rendered, so no hydration mismatch is
 * possible.
 *
 * This provider sits above the site tree but below `MotionProvider`, so it never
 * interferes with the motion config or remounts the animated subtree.
 */
export function DictionaryProvider({
  locale,
  dict,
  children,
}: DictionaryValue & { children: ReactNode }) {
  // Stable identity across re-renders, so consumers are not re-rendered by the
  // provider alone — scroll-driven components re-render often enough already.
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
}

function useDictionaryValue(): DictionaryValue {
  const value = useContext(DictionaryContext);
  if (value === null) {
    throw new Error("useDictionary must be used inside <DictionaryProvider>");
  }
  return value;
}

/** Translated copy for the active locale, merged with the managed content. */
export function useDictionary(): SiteDictionary {
  return useDictionaryValue().dict;
}

/**
 * The company record.
 *
 * It used to be a module-level `const` that any component could import
 * directly. Now that it is editable it has to arrive through the tree like
 * everything else — a Client Component cannot await a database read. Same
 * values, same render, one hop further.
 */
export function useCompany(): Company {
  return useDictionaryValue().dict._content.company;
}

/** The active locale — for building locale-prefixed hrefs. */
export function useLocale(): Locale {
  return useDictionaryValue().locale;
}
