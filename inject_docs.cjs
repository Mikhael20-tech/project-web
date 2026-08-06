const fs = require('fs');

const code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');

const startLine = 3620; // 0-indexed
const endLine = 4099; // 0-indexed

const replacement = `          {activeTab === "documents" && (
            <DocumentsTab 
              t={t}
              docForm={docForm}
              setDocForm={setDocForm}
              handleDocSubmit={handleDocSubmit}
              handleDocFileUpload={handleDocFileUpload}
              docSaveLoading={docSaveLoading}
              docSearch={docSearch}
              setDocSearch={setDocSearch}
              docFilterCategory={docFilterCategory}
              setDocFilterCategory={setDocFilterCategory}
              categoryLabels={categoryLabels}
              categoryColors={categoryColors}
              categoryTranslationKeys={categoryTranslationKeys}
              documents={documents}
              handleDocDelete={handleDocDelete}
              handleAiAnalysis={handleAiAnalysis}
              aiDocAnalyzing={aiDocAnalyzing}
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
const importStatement = `import { DocumentsTab } from '../features/admin/tabs/DocumentsTab';\n`;
const lastImportIndex = newCode.lastIndexOf('import ');
const nextLineIndex = newCode.indexOf('\n', lastImportIndex);
newCode = newCode.slice(0, nextLineIndex + 1) + importStatement + newCode.slice(nextLineIndex + 1);

fs.writeFileSync('src/pages/AdminDashboard.tsx', newCode);
console.log("DocumentsTab injected!");
