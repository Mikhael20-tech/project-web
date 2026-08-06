const fs = require('fs');
const code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');

const startLine = 3620; // 0-indexed
const endLine = 4099; // 0-indexed

const jsxContent = lines.slice(startLine + 1, endLine).join('\n'); 

const componentCode = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, FileText, CheckCircle2, ShieldCheck, Download, Trash2, Bot, Info, Search, RefreshCcw, X, Upload, Zap, ChevronDown, Save, Filter, Briefcase, Folder } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import DynamicText from '@/src/components/DynamicText';

export const DocumentsTab = ({
  t,
  docForm,
  setDocForm,
  handleDocSubmit,
  handleDocFileUpload,
  docSaveLoading,
  docSearch,
  setDocSearch,
  docFilterCategory,
  setDocFilterCategory,
  categoryLabels,
  categoryColors,
  categoryTranslationKeys,
  documents,
  handleDocDelete,
  handleAiAnalysis,
  aiDocAnalyzing,
  uploadLoading
}: any) => {
  const [isDocCategoryDropdownOpen, setIsDocCategoryDropdownOpen] = useState(false);
  const [isDocCategoryDropOpen, setIsDocCategoryDropOpen] = useState(false);
  
  // handleDocAnalyzeAI alias
  const handleDocAnalyzeAI = handleAiAnalysis;

  return (
${jsxContent}
  );
};
`;

fs.writeFileSync('src/features/admin/tabs/DocumentsTab.tsx', componentCode);
console.log("DocumentsTab written with fixed imports!");
