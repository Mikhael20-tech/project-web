import React, { useState, useEffect } from "react";
import { useLanguage } from "@/src/lib/LanguageContext";

// Instant dictionary for common dynamic terms to avoid API latency/rate limits
const staticDictionary: Record<string, Record<string, string>> = {
  "Pendidikan Teknologi Informasi": {
    en: "Information Technology Education",
    zh: "信息技术教育",
    ja: "情報技術教育の専門家",
    ko: "정보 기술 교육"
  },
  "Pakar Pendidikan Teknologi Informasi": {
    en: "IT Education Expert",
    zh: "信息技术教育专家",
    ja: "情報技術教育の専門家",
    ko: "정보 기술 교육 전문가"
  },
  "Kecerdasan Buatan": {
    en: "Artificial Intelligence",
    zh: "人工智能",
    ja: "人工知能 (AI)",
    ko: "인공지능"
  },
  "Sistem Informasi": {
    en: "Information Systems",
    zh: "信息系统",
    ja: "情報システム",
    ko: "정보 시스템"
  },
  "Rekayasa Perangkat Lunak": {
    en: "Software Engineering",
    zh: "软件工程",
    ja: "ソフトウェア工学",
    ko: "소프트웨어 공学"
  },
  "Jaringan Komputer": {
    en: "Computer Networks",
    zh: "计算机网络",
    ja: "コンピュータネットワーク",
    ko: "컴퓨터 네트워크"
  }
};

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
    // If language is Indonesian or text is empty, return original text
    if (!text || lang === "id") {
      setTranslatedText(text);
      return;
    }

    // Check instant static dictionary first
    const trimmed = text.trim();
    if (staticDictionary[trimmed] && staticDictionary[trimmed][lang]) {
      setTranslatedText(staticDictionary[trimmed][lang]);
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
