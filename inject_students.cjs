const fs = require('fs');

const code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');

const startLine = 2336; // 0-indexed
const endLine = 2738; // 0-indexed

const replacement = `          {activeTab === "students" && (
            <StudentsTab 
              t={t}
              studentForm={studentForm}
              setStudentForm={setStudentForm}
              handleStudentSubmit={handleStudentSubmit}
              students={students}
              selectedStudents={selectedStudents}
              setSelectedStudents={setSelectedStudents}
              handleStudentDelete={handleStudentDelete}
              handleBulkDelete={handleBulkDelete}
              handleDeleteAll={handleDeleteAll}
              setAiImportType={setAiImportType}
              setAiImportOpen={setAiImportOpen}
              reports={reports}
              handleCSVImport={handleCSVImport}
              setDeleteData={setDeleteData}
            />
          )}`;

const newLines = [
  ...lines.slice(0, startLine),
  replacement,
  ...lines.slice(endLine)
];

let newCode = newLines.join('\n');

// Add import
const importStatement = `import { StudentsTab } from '../features/admin/tabs/StudentsTab';\n`;
const lastImportIndex = newCode.lastIndexOf('import ');
const nextLineIndex = newCode.indexOf('\n', lastImportIndex);
newCode = newCode.slice(0, nextLineIndex + 1) + importStatement + newCode.slice(nextLineIndex + 1);

fs.writeFileSync('src/pages/AdminDashboard.tsx', newCode);
console.log("StudentsTab injected!");
