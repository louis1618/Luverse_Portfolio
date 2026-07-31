const fs = require('fs');
const data = fs.readFileSync('full_step_43.json', 'utf8');
const obj = JSON.parse(data.split(':', 2)[1] || data); // Parse the jsonl line if it starts with path: or something
// Wait, full_step_43.json contains the powershell Select-String output, which is like "file:line:content"
const jsonStart = data.indexOf('{');
const jsonStr = data.substring(jsonStart);
const step = JSON.parse(jsonStr);

let codeContent = '';
for (const tc of step.tool_calls) {
  if (tc.name === 'write_to_file' && tc.args.TargetFile.includes('icons.ts')) {
    codeContent = tc.args.CodeContent;
  }
}

fs.writeFileSync('restored_icons.ts', codeContent);
console.log('Successfully wrote restored_icons.ts');
