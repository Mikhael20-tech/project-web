import React, { useState, useEffect } from "react";
import { useLanguage } from "@/src/lib/LanguageContext";

// Simple client-side cache to avoid repeated API calls for the same text and target language
const translationCache: Record<string, string> = {};

interface DynamicTextProps {
  text: string;
  className?: string;
  as?: any;
}

export const DynamicText: React.FC<DynamicTextProps> = ({ text, className, as: Component = "span" }) => {
  const { lang } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    // If language is Indonesian or text is empty/short, return original text
    if (!text || lang === "id") {
      setTranslatedText(text);
      return;
    }

    const cacheKey = `${lang}:${text}`;
    if (translationCache[cacheKey]) {
      setTranslatedText(translationCache[cacheKey]);
      return;
    }

    let isMounted = true;

    // Use free MyMemory Translation API or Google Translate fallback
    const translateText = async () => {
      try {
        const targetLang = lang === "zh" ? "zh-CN" : lang;
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|${targetLang}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.responseData?.translatedText) {
            const result = data.responseData.translatedText;
            translationCache[cacheKey] = result;
            if (isMounted) setTranslatedText(result);
            return;
          }
        }
      } catch (err) {
        console.warn("Translation API error, falling back to original text:", err);
      }
      if (isMounted) setTranslatedText(text);
    };

    translateText();

    return () => {
      isMounted = false;
    };
  }, [text, lang]);

  return <Component className={className}>{translatedText}</Component>;
};

export default DynamicText;
