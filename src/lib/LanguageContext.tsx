import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("language") || "id";
  });

  useEffect(() => {
    localStorage.setItem("language", lang);
  }, [lang]);

  const t = (key: string) => {
    return translations[lang]?.[key] || translations["id"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
