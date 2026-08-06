const fs = require('fs');
const code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');

const startLine = 2316; // 0-indexed
const endLine = 2672; // 0-indexed

const jsxContent = lines.slice(startLine + 1, endLine).join('\n'); 

const componentCode = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, CheckCircle2, FileText, ArrowLeftRight, ChevronDown, Download, Bot, Zap, GraduationCap, Camera, Save, Users, Search, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import DynamicText from '@/src/components/DynamicText';

export const LecturersTab = ({
  t,
  dosenForm,
  setDosenForm,
  handleDosenSubmit,
  dosenSaveLoading,
  reports,
  selectedDosen,
  setSelectedDosen,
  handleDelete,
  handleBulkDelete,
  handleDeleteAll,
  setAiImportType,
  setAiImportOpen,
  handleFileUpload,
  uploadLoading
}: any) => {
  const [searchDosen, setSearchDosen] = useState("");

  return (
${jsxContent}
  );
};
`;

fs.writeFileSync('src/features/admin/tabs/LecturersTab.tsx', componentCode);
console.log("LecturersTab written with fixed imports!");
