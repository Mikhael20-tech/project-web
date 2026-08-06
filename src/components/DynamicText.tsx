import React, { useState, useEffect } from "react";
import { useLanguage } from "@/src/lib/LanguageContext";

// Instant dictionary for common dynamic terms to avoid API latency/rate limits
const staticDictionary: Record<string, Record<string, string>> = {

  "Template Laporan Akhir Mobilitas Akademik Magang": {
    en: "Academic Mobility Internship Final Report Template",
    zh: "学术交流实习最终报告模板",
    ja: "学術交流インターンシップ最終報告書テンプレート",
    ko: "학술 교류 인턴십 최종 보고서 템플릿"
  },
  "Template Proposal Mobilitas Akademik Magang": {
    en: "Academic Mobility Internship Proposal Template",
    zh: "学术交流实习提案模板",
    ja: "学術交流インターンシップ提案書テンプレート",
    ko: "학술 교류 인턴십 제안서 템플릿"
  },
  "Dokumen ini adalah template atau panduan untuk menyusun proposal kegiatan mobilitas akademik yang berfokus pada program magang.": {
    en: "This document is a template or guide for preparing a proposal for academic mobility activities focusing on internship programs.",
    zh: "本文件是编制侧重于实习项目的学术交流活动提案的模板或指南。",
    ja: "このドキュメントは、インターンシッププログラムに焦点を当てた学術交流活動の提案書を作成するためのテンプレートまたはガイドです。",
    ko: "이 문서는 인턴십 프로그램에 초점을 맞춘 학술 교류 활동에 대한 제안서를 작성하기 위한 템플릿 또는 가이드입니다."
  },
  "MoA": {
    en: "MoA",
    zh: "MoA",
    ja: "MoA",
    ko: "MoA"
  },
  "Folder ini berisi kumpulan dokumen akademik. Detail spesifik mengenai isi dokumen tidak dapat diidentifikasi dari tautan drive saja.": {
    en: "This folder contains a collection of academic documents. Specific details regarding the contents of the documents cannot be identified from the drive link alone.",
    zh: "该文件夹包含学术文档集合。仅凭网盘链接无法识别文档的具体内容细节。",
    ja: "このフォルダーには学術文書のコレクションが含まれています。ドライブリンクだけでは文書の内容に関する具体的な詳細は特定できません。",
    ko: "이 폴더에는 학술 문서 모음이 포함되어 있습니다. 드라이브 링크만으로는 문서 내용에 대한 구체적인 세부 정보를 확인할 수 없습니다."
  },
  "IA": {
    en: "IA",
    zh: "IA",
    ja: "IA",
    ko: "IA"
  },
  "Folder Google Drive ini berisi kumpulan dokumen akademik. Informasi lebih lanjut mengenai isi spesifik folder tidak tersedia tanpa akses.": {
    en: "This Google Drive folder contains a collection of academic documents. Further information regarding the specific contents of the folder is not available without access.",
    zh: "此 Google 云端硬盘文件夹包含学术文档集合。如无权限，则无法获取有关该文件夹具体内容的进一步信息。",
    ja: "このGoogleドライブフォルダーには学術文書のコレクションが含まれています。アクセス権がない場合、フォルダーの具体的な内容に関する詳細情報は利用できません。",
    ko: "이 Google 드라이브 폴더에는 학술 문서 모음이 포함되어 있습니다. 액세스 권한 없이는 폴더의 구체적인 내용에 대한 추가 정보를 얻을 수 없습니다."
  },

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
  },
  "Dosen tetap di Program Studi Pendidikan Teknologi Informasi UNESA dengan fokus pada pengembangan sistem dan metodologi pembelajaran berbasis teknologi.": {
    en: "Full-time lecturer in Information Technology Education at UNESA, focusing on system development and technology-based learning methodologies.",
    zh: "UNESA 信息技术教育专业专任教师，专注于技术型学习系统与方法论的开发。",
    ja: "UNESA情報技術教育専攻の専任講師。システム開発および技術ベースの学習方法論を専門としています。",
    ko: "UNESA 정보 기술 교육 전공 전임 교수로, 시스템 개발 및 기술 기반 학습 방법론을 연구합니다."
  },
  "Pakar Pendidikan Teknologi Informasi dengan fokus pada pengembangan sistem cerdas dan metodologi pembelajaran digital berbasis industri.": {
    en: "IT Education Expert focusing on intelligent systems development and industry-based digital learning methodologies.",
    zh: "信息技术教育专家，专注于智能系统开发与基于工业的数字学习方法论。",
    ja: "情報技術教育の専門家。インテリジェントシステム開発および産業ベースのデジタル学習方法論に焦点を当てています。",
    ko: "정보 기술 교육 전문가로, 지능형 시스템 개발 및 산업 기반 디지털 학습 방법론에 중점을 둡니다."
  },
  "Dosen tetap di Program Studi Pendidikan Teknologi Informasi UNESA.": {
    en: "Full-time lecturer in the Information Technology Education Study Program at UNESA.",
    zh: "UNESA 信息技术教育专业专任教师。",
    ja: "UNESA情報技術教育専攻の専任講師。",
    ko: "UNESA 정보 기술 교육 전공 전임 교원."
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
