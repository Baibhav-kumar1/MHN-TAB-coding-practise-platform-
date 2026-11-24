const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { executeCode } = require('./services/executor');

console.log('🧪 Starting MHN TAB & Boilerplate Verification Tests...\n');

// 1. Verify Starter Templates File
const templatesPath = path.join(__dirname, '../client/src/utils/starterTemplates.js');
assert(fs.existsSync(templatesPath), 'starterTemplates.js must exist');
const templatesSource = fs.readFileSync(templatesPath, 'utf8');

// Required 11 extensions
const REQUIRED_EXTENSIONS = [
  '.html', '.css', '.js', '.jsx', '.ts', '.py', '.java', '.cpp', '.c', '.sql', '.json'
];

console.log('1️⃣ Checking 11 Template Definitions in starterTemplates.js...');
assert(templatesSource.includes('html: `<!DOCTYPE html>'), 'HTML template missing');
assert(templatesSource.includes('css: `/*'), 'CSS template missing');
assert(templatesSource.includes('javascript: `//'), 'JavaScript template missing');
assert(templatesSource.includes('jsx: `//'), 'JSX template missing');
assert(templatesSource.includes('typescript: `//'), 'TypeScript template missing');
assert(templatesSource.includes('python: `#'), 'Python template missing');
assert(templatesSource.includes('java: `import java.util.Scanner;'), 'Java template missing');
assert(templatesSource.includes('cpp: `#include <iostream>'), 'C++ template missing');
assert(templatesSource.includes('c: `#include <stdio.h>'), 'C template missing');
assert(templatesSource.includes('sql: `--'), 'SQL template missing');
assert(templatesSource.includes('json: `{'), 'JSON template missing');
console.log('   ✅ All 11 language templates are defined.');

// 2. Test getBoilerplateForExtension logic
console.log('\n2️⃣ Testing getBoilerplateForExtension function logic...');
// Evaluate helper logic directly in Node
const vm = require('vm');
const moduleCode = templatesSource
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ')
  + '\nexports.STARTER_TEMPLATES = STARTER_TEMPLATES;\nexports.getBoilerplateForExtension = getBoilerplateForExtension;\n';
const mod = { exports: {} };
vm.runInNewContext(moduleCode, { exports: mod.exports, console });

const { getBoilerplateForExtension, STARTER_TEMPLATES } = mod.exports;

REQUIRED_EXTENSIONS.forEach(ext => {
  const code = getBoilerplateForExtension(ext, `testFile${ext}`);
  assert(code && code.length > 20, `Boilerplate for ${ext} must be non-empty`);
  console.log(`   ✅ ${ext} boilerplate resolved successfully (${code.length} chars)`);
});

// Unsupported extension test -> must return blank string ""
console.log('\n3️⃣ Testing Unsupported Extension Blank File Rule...');
const unsupportedExts = ['.txt', '.md', '.log', '.bin', '.unknown'];
unsupportedExts.forEach(ext => {
  const code = getBoilerplateForExtension(ext, `notes${ext}`);
  assert.strictEqual(code, '', `Unsupported extension ${ext} MUST return empty string (blank file)`);
  console.log(`   ✅ Unsupported extension ${ext} safely returns empty string ""`);
});

// Java class name dynamic replacement test
console.log('\n4️⃣ Testing Java Class Name Dynamic Replacement...');
const javaCodeCustom = getBoilerplateForExtension('.java', 'FactorialCalculator.java');
assert(javaCodeCustom.includes('public class FactorialCalculator'), 'Java class name should match filename if valid identifier');
console.log('   ✅ Java class name correctly matched FactorialCalculator');

// JSON valid syntax test
console.log('\n5️⃣ Testing JSON Template Syntax Validity...');
const jsonCode = getBoilerplateForExtension('.json');
const parsedJson = JSON.parse(jsonCode);
assert.strictEqual(parsedJson.project, 'MHN TAB', 'JSON project name should be MHN TAB');
console.log('   ✅ JSON boilerplate is valid parseable RFC 8259 JSON.');

// 6. Test AI Mentor Greeting
console.log('\n6️⃣ Checking AI Mentor Initial Greeting in AiAssistantDrawer.jsx...');
const aiDrawerPath = path.join(__dirname, '../client/src/components/AiAssistantDrawer.jsx');
const aiDrawerSource = fs.readFileSync(aiDrawerPath, 'utf8');
const expectedGreeting = 'Baibhav have assigned me for your help plz go ahead';
assert(aiDrawerSource.includes(expectedGreeting), `AiAssistantDrawer must contain greeting: "${expectedGreeting}"`);
console.log(`   ✅ Verified AI greeting: "${expectedGreeting}"`);

// 7. Verify Brand Name "MHN TAB" in index.html & Navbar
console.log('\n7️⃣ Checking "MHN TAB" Branding across UI...');
const indexPath = path.join(__dirname, '../client/index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
assert(indexHtml.includes('MHN TAB'), 'client/index.html title must contain "MHN TAB"');
assert(!indexHtml.includes('MHN Bairiya'), 'client/index.html must not contain old name');

const navbarPath = path.join(__dirname, '../client/src/components/Navbar.jsx');
const navbarSource = fs.readFileSync(navbarPath, 'utf8');
assert(navbarSource.includes('MHN <span className="text-sky-400 font-semibold">TAB</span>'), 'Navbar must brand as MHN TAB');
assert(!navbarSource.includes('MHN Bairiya'), 'Navbar must not contain MHN Bairiya');

// Check that only ONE Admin Portal button exists in Navbar
const adminButtons = (navbarSource.match(/onClick=\{onOpenAdmin\}/g) || []).length;
assert.strictEqual(adminButtons, 1, `Navbar should have exactly 1 Admin Portal button, found ${adminButtons}`);
console.log('   ✅ Exactly 1 Admin Portal button found in Navbar.');
console.log('   ✅ MHN TAB brand verified across index.html and Navbar.');

// 8. Test Backend Code Execution for C, TypeScript, JSON, Python, Java
console.log('\n8️⃣ Testing Backend Execution for C, TypeScript, JSON, Python...');

async function runExecTests() {
  // Test C
  console.log('   Testing C compilation and execution...');
  const cRes = await executeCode({
    language: 'c',
    code: '#include <stdio.h>\nint main() { printf("MHN TAB C Test: %d\\n", 7 * 6); return 0; }'
  });
  assert(cRes.success, 'C execution should succeed: ' + cRes.stderr);
  assert(cRes.stdout.includes('MHN TAB C Test: 42'), 'C output should contain 42');
  console.log('   ✅ C executed successfully: ' + cRes.stdout.trim());

  // Test TypeScript
  console.log('   Testing TypeScript execution via Node 22...');
  const tsRes = await executeCode({
    language: 'typescript',
    code: 'const add = (a: number, b: number): number => a + b;\nconsole.log("MHN TAB TS Test: " + add(15, 25));'
  });
  assert(tsRes.success, 'TS execution should succeed: ' + tsRes.stderr);
  assert(tsRes.stdout.includes('MHN TAB TS Test: 40'), 'TS output should contain 40');
  console.log('   ✅ TypeScript executed successfully: ' + tsRes.stdout.trim());

  // Test JSON Validation
  console.log('   Testing JSON validator execution...');
  const jsonRes = await executeCode({
    language: 'json',
    code: JSON.stringify({ app: "MHN TAB", status: "Active" })
  });
  assert(jsonRes.success, 'JSON validation should succeed');
  assert(jsonRes.stdout.includes('"app": "MHN TAB"'), 'JSON output should be formatted');
  console.log('   ✅ JSON validated successfully: ' + jsonRes.stdout.trim());

  // Test Python
  console.log('   Testing Python execution...');
  const pyRes = await executeCode({
    language: 'python',
    code: 'print("MHN TAB Python: " + str(10 + 20))'
  });
  assert(pyRes.success, 'Python execution should succeed');
  assert(pyRes.stdout.includes('MHN TAB Python: 30'), 'Python output should contain 30');
  console.log('   ✅ Python executed successfully: ' + pyRes.stdout.trim());

  console.log('\n🎉 ALL MHN TAB & BOILERPLATE GENERATION TESTS PASSED SUCCESSFULLY! 🚀\n');
}

runExecTests().catch(err => {
  console.error('\n❌ Execution test failed:', err);
  process.exit(1);
});
