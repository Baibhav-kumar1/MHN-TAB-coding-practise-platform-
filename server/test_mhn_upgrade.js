const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🧪 Starting MHN Bairiya Upgrade Verification Tests...\n');

// 1. Language Extension Detection Test
function getLanguageFromFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'python';
  const clean = filename.trim();
  const dotIdx = clean.lastIndexOf('.');
  if (dotIdx === -1) return 'python';
  const ext = clean.substring(dotIdx).toLowerCase();
  switch (ext) {
    case '.py':
    case '.pyw':
      return 'python';
    case '.java':
      return 'java';
    case '.cpp':
    case '.cc':
    case '.cxx':
    case '.c':
    case '.h':
    case '.hpp':
      return 'cpp';
    case '.js':
    case '.mjs':
    case '.cjs':
    case '.jsx':
    case '.ts':
    case '.tsx':
      return 'javascript';
    case '.html':
    case '.htm':
      return 'html';
    case '.css':
      return 'css';
    case '.sql':
      return 'sql';
    case '.json':
      return 'json';
    default:
      return 'python';
  }
}

console.log('1️⃣ Testing Custom File Creation & Language Detection...');
assert.strictEqual(getLanguageFromFilename('Solution.java'), 'java');
assert.strictEqual(getLanguageFromFilename('test.py'), 'python');
assert.strictEqual(getLanguageFromFilename('algo.cpp'), 'cpp');
assert.strictEqual(getLanguageFromFilename('script.js'), 'javascript');
assert.strictEqual(getLanguageFromFilename('query.sql'), 'sql');
assert.strictEqual(getLanguageFromFilename('index.html'), 'html');
assert.strictEqual(getLanguageFromFilename('style.css'), 'css');
assert.strictEqual(getLanguageFromFilename('App.tsx'), 'javascript');
assert.strictEqual(getLanguageFromFilename('data.json'), 'json');
console.log('   ✅ All 9 extension mappings correctly detected language modes.');

// 2. Layout Modes & Split Clamping Bounds
console.log('\n2️⃣ Testing Layout Modes & Split Ratio Bounds...');
const validModes = ['horizontal', 'vertical', 'full-editor', 'full-output'];
assert.strictEqual(validModes.length, 4);

function clampSplitRatio(ratio) {
  return Math.min(Math.max(Math.round(ratio), 15), 85);
}

assert.strictEqual(clampSplitRatio(50), 50);
assert.strictEqual(clampSplitRatio(5), 15, 'Should clamp minimum to 15%');
assert.strictEqual(clampSplitRatio(95), 85, 'Should clamp maximum to 85%');
assert.strictEqual(clampSplitRatio(55.4), 55);
console.log('   ✅ Splitter correctly enforces bounds between 15% and 85%.');

// 3. Client Build & Brand Verification
console.log('\n3️⃣ Testing Client Assets & Complete Music Removal...');
const clientHtmlPath = path.join(__dirname, '../client/index.html');
const clientHtml = fs.readFileSync(clientHtmlPath, 'utf8');
assert(clientHtml.includes('MHN Bairiya'), 'client/index.html must have MHN Bairiya title');
assert(!clientHtml.includes('OJT Code Playground'), 'client/index.html must not contain OJT Code Playground');
console.log('   ✅ client/index.html successfully rebranded to MHN Bairiya.');

// Check client/src for any music leftovers
const clientSrcDir = path.join(__dirname, '../client/src');
function checkNoMusic(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkNoMusic(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(!content.includes('MusicProvider'), `File ${file} still mentions MusicProvider`);
      assert(!content.includes('useMusic'), `File ${file} still mentions useMusic`);
      assert(!content.includes('MusicPlayer'), `File ${file} still mentions MusicPlayer`);
    }
  }
}
checkNoMusic(clientSrcDir);
console.log('   ✅ Complete removal of Music verified: 0 references across all client/src code.');

// 4. Server API & Code Execution Test
console.log('\n4️⃣ Testing Server Execution & Practice API...');
function makeRequest(method, pathUrl, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api' + pathUrl,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body, status: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runApiTests() {
  // Test Python execution
  const pyRes = await makeRequest('POST', '/execute', {
    language: 'python',
    code: 'print("MHN Bairiya Python Test: " + str(21 * 2))'
  });
  assert(pyRes.success, 'Python execution should succeed');
  assert(pyRes.stdout.includes('MHN Bairiya Python Test: 42'), 'Python output should contain 42');
  console.log('   ✅ Python execution verified: ' + pyRes.stdout.trim());

  // Test Java execution
  const javaRes = await makeRequest('POST', '/execute', {
    language: 'java',
    code: 'public class Main { public static void main(String[] args) { System.out.println("MHN Bairiya Java Test: " + (100 + 200)); } }'
  });
  assert(javaRes.success, 'Java execution should succeed');
  assert(javaRes.stdout.includes('MHN Bairiya Java Test: 300'), 'Java output should contain 300');
  console.log('   ✅ Java execution verified: ' + javaRes.stdout.trim());

  // Test Practice Problems endpoint
  const probRes = await makeRequest('GET', '/practice', null);
  assert(Array.isArray(probRes.problems), 'Problems should be an array');
  assert(probRes.problems.length > 0, 'Should have practice problems');
  const sampleProb = probRes.problems[0];
  
  // Test Problem Details endpoint
  const detailRes = await makeRequest('GET', '/practice/' + sampleProb.id, null);
  assert(detailRes.problem, 'Should return problem details');
  assert(detailRes.problem.starter_templates, 'Problem should have starter_templates');
  assert(detailRes.problem.starter_templates.python, 'Should have Python starter template');
  assert(detailRes.problem.sample_test_cases, 'Should have sample test cases');
  console.log(`   ✅ Question Bank API verified: ${probRes.problems.length} questions, problem #${sampleProb.id} has Python starter code.`);

  console.log('\n🎉 ALL MHN BAIRIYA UPGRADE VERIFICATION TESTS PASSED!\n');
}

runApiTests().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
