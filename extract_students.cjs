const fs = require('fs');
const code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');

const startLine = 2336; // 0-indexed
const endLine = 2738; // 0-indexed

const jsxContent = lines.slice(startLine + 1, endLine).join('\n'); 

const componentCode = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, CheckCircle2, ChevronDown, Zap, UserPlus, Search, X, Link, Save, Users, Upload, Download, Timer } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import DynamicText from '@/src/components/DynamicText';
import * as XLSX from "xlsx";

export const StudentsTab = ({
  t,
  studentForm,
  setStudentForm,
  handleStudentSubmit,
  students,
  selectedStudents,
  setSelectedStudents,
  handleStudentDelete,
  handleBulkDelete,
  handleDeleteAll,
  setAiImportType,
  setAiImportOpen,
  reports,
  handleCSVImport,
  setDeleteData
}: any) => {
  const [searchStudent, setSearchStudent] = useState("");
  const [filterStudentAngkatan, setFilterStudentAngkatan] = useState("All");
  const [isStudentFilterDropdownOpen, setIsStudentFilterDropdownOpen] = useState(false);

  return (
${jsxContent}
  );
};
`;

fs.writeFileSync('src/features/admin/tabs/StudentsTab.tsx', componentCode);
console.log("StudentsTab written with fixed imports!");
