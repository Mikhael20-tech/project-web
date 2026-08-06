const fs = require('fs');

const code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');

const startLine = 2316; // 0-indexed
const endLine = 2672; // 0-indexed

const replacement = `          {activeTab === "dosen" && (
            <LecturersTab 
              t={t}
              dosenForm={dosenForm}
              setDosenForm={setDosenForm}
              handleDosenSubmit={handleDosenSubmit}
              dosenSaveLoading={dosenSaveLoading}
              reports={reports}
              selectedDosen={selectedDosen}
              setSelectedDosen={setSelectedDosen}
              handleDelete={handleDelete}
              handleBulkDelete={handleBulkDelete}
              handleDeleteAll={handleDeleteAll}
              setAiImportType={setAiImportType}
              setAiImportOpen={setAiImportOpen}
              handleFileUpload={handleFileUpload}
              uploadLoading={uploadLoading}
            />
          )}`;

const newLines = [
  ...lines.slice(0, startLine),
  replacement,
  ...lines.slice(endLine)
];

let newCode = newLines.join('\n');

// Add import
const importStatement = `import { LecturersTab } from '../features/admin/tabs/LecturersTab';\n`;
const lastImportIndex = newCode.lastIndexOf('import ');
const nextLineIndex = newCode.indexOf('\n', lastImportIndex);
newCode = newCode.slice(0, nextLineIndex + 1) + importStatement + newCode.slice(nextLineIndex + 1);

fs.writeFileSync('src/pages/AdminDashboard.tsx', newCode);
console.log("LecturersTab injected!");
