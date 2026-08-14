const fs = require('fs');
const lines = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('{activeTab === "students"'));
let brackets = 0;
let end = -1;
let foundStart = false;

for (let i = start; i < lines.length; i++) {
  const l = lines[i];
  if (!foundStart && l.includes('{activeTab === "students"')) foundStart = true;
  
  if (foundStart) {
    brackets += (l.match(/\{/g) || []).length;
    brackets -= (l.match(/\}/g) || []).length;
    
    if (brackets === 0 && i > start + 5) {
      end = i;
      break;
    }
  }
}
console.log('Start:', start + 1, 'End:', end + 1);
