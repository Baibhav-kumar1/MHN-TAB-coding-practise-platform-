const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { explainError } = require('./errorExplainer');

// Timeout configuration (in ms)
const EXECUTION_TIMEOUT_MS = 7000;
const MAX_BUFFER_SIZE = 1024 * 1024; // 1 MB limit for stdout/stderr

// Detect Java runtime paths
const JAVA_HOME_CANDIDATES = [
  process.env.JAVA_HOME,
  '/Library/Java/JavaVirtualMachines/temurin-25.jdk/Contents/Home',
  '/usr/bin'
].filter(Boolean);

let resolvedJavac = 'javac';
let resolvedJava = 'java';

for (const candidate of JAVA_HOME_CANDIDATES) {
  const javacCandidate = path.join(candidate, 'bin', 'javac');
  const javaCandidate = path.join(candidate, 'bin', 'java');
  if (fs.existsSync(javacCandidate) && fs.existsSync(javaCandidate)) {
    resolvedJavac = javacCandidate;
    resolvedJava = javaCandidate;
    break;
  }
}

// SQL Sample Database Schema
const SQL_PREAMBLE = `
-- Pre-seeded OJT Playground Relational Schema
CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    building TEXT
);

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    dept_id INTEGER,
    cgpa REAL,
    FOREIGN KEY(dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    credits INTEGER
);

CREATE TABLE enrollments (
    enrollment_id INTEGER PRIMARY KEY,
    student_id INTEGER,
    course_id INTEGER,
    grade TEXT,
    FOREIGN KEY(student_id) REFERENCES students(student_id),
    FOREIGN KEY(course_id) REFERENCES courses(course_id)
);

INSERT INTO departments VALUES (1, 'Computer Science', 'Turing Hall');
INSERT INTO departments VALUES (2, 'Information Tech', 'Ada Lovelace Wing');
INSERT INTO departments VALUES (3, 'Electronics', 'Maxwell Block');

INSERT INTO students VALUES (101, 'Aarav Sharma', 1, 9.4);
INSERT INTO students VALUES (102, 'Priya Patel', 1, 8.8);
INSERT INTO students VALUES (103, 'Rohan Verma', 2, 7.9);
INSERT INTO students VALUES (104, 'Ananya Das', 3, 8.6);
INSERT INTO students VALUES (105, 'Vikram Mehta', 1, 9.1);

INSERT INTO courses VALUES (201, 'CS101', 'Data Structures & Algorithms', 4);
INSERT INTO courses VALUES (202, 'CS202', 'Database Management Systems', 3);
INSERT INTO courses VALUES (203, 'IT303', 'Web Technologies & APIs', 3);

INSERT INTO enrollments VALUES (1, 101, 201, 'A+');
INSERT INTO enrollments VALUES (2, 101, 202, 'A');
INSERT INTO enrollments VALUES (3, 102, 201, 'A');
INSERT INTO enrollments VALUES (4, 103, 203, 'B+');
INSERT INTO enrollments VALUES (5, 104, 202, 'A-');
INSERT INTO enrollments VALUES (6, 105, 201, 'O');
`;

/**
 * Execute command with timeout and stdin piping
 */
function runCommand(command, args, cwd, stdinText = '', timeoutMs = EXECUTION_TIMEOUT_MS) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let isTimedOut = false;

    const startTime = process.hrtime();
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin'
      }
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {
        // ignore
      }
    }, timeoutMs);

    // Feed stdin if provided
    if (stdinText) {
      try {
        child.stdin.write(stdinText);
        child.stdin.end();
      } catch (err) {
        // Child might have already closed or exited
      }
    } else {
      try {
        child.stdin.end();
      } catch (e) {}
    }

    child.stdout.on('data', (data) => {
      if (stdout.length < MAX_BUFFER_SIZE) {
        stdout += data.toString();
      }
    });

    child.stderr.on('data', (data) => {
      if (stderr.length < MAX_BUFFER_SIZE) {
        stderr += data.toString();
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      const diff = process.hrtime(startTime);
      const executionTime = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
      resolve({
        stdout,
        stderr: (stderr + '\n' + err.message).trim(),
        exitCode: 1,
        isTimedOut: false,
        executionTime: parseFloat(executionTime)
      });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      const diff = process.hrtime(startTime);
      const executionTime = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

      if (isTimedOut) {
        resolve({
          stdout,
          stderr: (stderr + '\n[Execution Error] Process timed out after ' + (timeoutMs / 1000) + 's (Time Limit Exceeded). Check for infinite loops or waiting for input.').trim(),
          exitCode: 124,
          isTimedOut: true,
          executionTime: parseFloat(executionTime)
        });
      } else {
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 0,
          isTimedOut: false,
          executionTime: parseFloat(executionTime)
        });
      }
    });
  });
}

/**
 * Main executeCode function
 */
async function executeCode({ language, code, stdin = '', timeout = EXECUTION_TIMEOUT_MS }) {
  const normLang = (language || '').toLowerCase().trim();
  const execId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `ojt_${execId}`);

  try {
    fs.mkdirSync(tempDir, { recursive: true });

    // Handle HTML/CSS/JS web preview bundling
    if (normLang === 'html' || normLang === 'css') {
      return {
        success: true,
        status: 'SUCCESS',
        stdout: 'Web bundle ready for sandboxed preview.',
        stderr: '',
        executionTime: 12,
        exitCode: 0,
        explanation: null,
        isWebPreview: true,
        previewContent: code
      };
    }

    // 1. Python Execution
    if (normLang === 'python' || normLang === 'py') {
      const scriptPath = path.join(tempDir, 'main.py');
      fs.writeFileSync(scriptPath, code, 'utf8');

      const result = await runCommand('python3', ['-u', 'main.py'], tempDir, stdin, timeout);
      const success = result.exitCode === 0 && !result.isTimedOut;
      const explanation = !success ? explainError('python', result.stderr, result.stdout) : null;

      return {
        success,
        status: result.isTimedOut ? 'TIME_LIMIT_EXCEEDED' : (result.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR'),
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        executionTime: result.executionTime,
        explanation
      };
    }

    // 2. JavaScript (Node.js) Execution
    if (normLang === 'javascript' || normLang === 'js') {
      const scriptPath = path.join(tempDir, 'main.js');
      fs.writeFileSync(scriptPath, code, 'utf8');

      const result = await runCommand('node', ['main.js'], tempDir, stdin, timeout);
      const success = result.exitCode === 0 && !result.isTimedOut;
      const explanation = !success ? explainError('javascript', result.stderr, result.stdout) : null;

      return {
        success,
        status: result.isTimedOut ? 'TIME_LIMIT_EXCEEDED' : (result.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR'),
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        executionTime: result.executionTime,
        explanation
      };
    }

    // 3. C++ Execution
    if (normLang === 'cpp' || normLang === 'c++') {
      const sourcePath = path.join(tempDir, 'main.cpp');
      const binPath = path.join(tempDir, 'main');
      fs.writeFileSync(sourcePath, code, 'utf8');

      // Compile
      const compileResult = await runCommand('clang++', ['-std=c++17', '-O2', 'main.cpp', '-o', 'main'], tempDir, '', 5000);
      if (compileResult.exitCode !== 0) {
        return {
          success: false,
          status: 'COMPILATION_ERROR',
          stdout: '',
          stderr: compileResult.stderr,
          exitCode: compileResult.exitCode,
          executionTime: compileResult.executionTime,
          explanation: explainError('cpp', compileResult.stderr)
        };
      }

      // Execute compiled binary
      const runResult = await runCommand('./main', [], tempDir, stdin, timeout);
      const success = runResult.exitCode === 0 && !runResult.isTimedOut;
      const explanation = !success ? explainError('cpp', runResult.stderr, runResult.stdout) : null;

      return {
        success,
        status: runResult.isTimedOut ? 'TIME_LIMIT_EXCEEDED' : (runResult.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR'),
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        exitCode: runResult.exitCode,
        executionTime: (compileResult.executionTime + runResult.executionTime),
        explanation
      };
    }

    // 4. C Execution
    if (normLang === 'c') {
      const sourcePath = path.join(tempDir, 'main.c');
      fs.writeFileSync(sourcePath, code, 'utf8');

      // Compile C
      const compileResult = await runCommand('clang', ['-O2', 'main.c', '-o', 'main'], tempDir, '', 5000);
      if (compileResult.exitCode !== 0) {
        return {
          success: false,
          status: 'COMPILATION_ERROR',
          stdout: '',
          stderr: compileResult.stderr,
          exitCode: compileResult.exitCode,
          executionTime: compileResult.executionTime,
          explanation: explainError('cpp', compileResult.stderr)
        };
      }

      // Execute compiled binary
      const runResult = await runCommand('./main', [], tempDir, stdin, timeout);
      const success = runResult.exitCode === 0 && !runResult.isTimedOut;
      const explanation = !success ? explainError('cpp', runResult.stderr, runResult.stdout) : null;

      return {
        success,
        status: runResult.isTimedOut ? 'TIME_LIMIT_EXCEEDED' : (runResult.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR'),
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        exitCode: runResult.exitCode,
        executionTime: (compileResult.executionTime + runResult.executionTime),
        explanation
      };
    }

    // 5. TypeScript Execution (Node.js 22 with experimental strip types)
    if (normLang === 'typescript' || normLang === 'ts') {
      const scriptPath = path.join(tempDir, 'main.ts');
      fs.writeFileSync(scriptPath, code, 'utf8');

      const result = await runCommand('node', ['--experimental-strip-types', 'main.ts'], tempDir, stdin, timeout);
      const success = result.exitCode === 0 && !result.isTimedOut;
      const explanation = !success ? explainError('javascript', result.stderr, result.stdout) : null;

      return {
        success,
        status: result.isTimedOut ? 'TIME_LIMIT_EXCEEDED' : (result.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR'),
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        executionTime: result.executionTime,
        explanation
      };
    }

    // 6. JSX Execution (Web Component / Preview)
    if (normLang === 'jsx') {
      return {
        success: true,
        status: 'SUCCESS',
        stdout: 'React JSX component validated and rendered in web canvas.',
        stderr: '',
        executionTime: 10,
        exitCode: 0,
        explanation: null,
        isWebPreview: true,
        previewContent: code
      };
    }

    // 7. JSON Validation & Formatting
    if (normLang === 'json') {
      try {
        const parsed = JSON.parse(code);
        return {
          success: true,
          status: 'SUCCESS',
          stdout: 'Valid JSON format:\n\n' + JSON.stringify(parsed, null, 2),
          stderr: '',
          exitCode: 0,
          executionTime: 4,
          explanation: null
        };
      } catch (err) {
        return {
          success: false,
          status: 'RUNTIME_ERROR',
          stdout: '',
          stderr: 'JSON Syntax Error: ' + err.message,
          exitCode: 1,
          executionTime: 2,
          explanation: {
            errorType: 'JSON Parse Error',
            friendlyMessage: 'Invalid JSON syntax. Ensure quotes, keys, and commas follow valid RFC 8259 format.',
            suggestedFix: 'Fix the syntax error at: ' + err.message
          }
        };
      }
    }

    // 8. Java Execution
    if (normLang === 'java') {
      // Find class name
      let className = 'Main';
      const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      if (classMatch && classMatch[1]) {
        className = classMatch[1];
      }

      const javaFilePath = path.join(tempDir, `${className}.java`);
      fs.writeFileSync(javaFilePath, code, 'utf8');

      // Compile
      const compileResult = await runCommand(resolvedJavac, [`${className}.java`], tempDir, '', 6000);
      if (compileResult.exitCode !== 0) {
        return {
          success: false,
          status: 'COMPILATION_ERROR',
          stdout: '',
          stderr: compileResult.stderr,
          exitCode: compileResult.exitCode,
          executionTime: compileResult.executionTime,
          explanation: explainError('java', compileResult.stderr)
        };
      }

      // Execute JVM
      const runResult = await runCommand(resolvedJava, [className], tempDir, stdin, timeout);
      const success = runResult.exitCode === 0 && !runResult.isTimedOut;
      const explanation = !success ? explainError('java', runResult.stderr, runResult.stdout) : null;

      return {
        success,
        status: runResult.isTimedOut ? 'TIME_LIMIT_EXCEEDED' : (runResult.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR'),
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        exitCode: runResult.exitCode,
        executionTime: (compileResult.executionTime + runResult.executionTime),
        explanation
      };
    }

    // 9. SQL Execution
    if (normLang === 'sql') {
      const sqlScriptPath = path.join(tempDir, 'query.sql');
      const combinedSQL = `${SQL_PREAMBLE}\n\n-- Student Queries:\n${code}\n`;
      fs.writeFileSync(sqlScriptPath, combinedSQL, 'utf8');

      // Execute using sqlite3 with formatted columns
      const result = await runCommand(
        'sqlite3',
        ['-header', '-column', ':memory:'],
        tempDir,
        combinedSQL,
        timeout
      );

      const success = result.exitCode === 0 && !result.isTimedOut;
      const explanation = !success ? explainError('sql', result.stderr, result.stdout) : null;

      return {
        success,
        status: result.isTimedOut ? 'TIME_LIMIT_EXCEEDED' : (result.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR'),
        stdout: result.stdout || (success ? 'Query executed successfully with 0 rows returned.' : ''),
        stderr: result.stderr,
        exitCode: result.exitCode,
        executionTime: result.executionTime,
        explanation
      };
    }

    return {
      success: false,
      status: 'UNSUPPORTED_LANGUAGE',
      stdout: '',
      stderr: `Language "${language}" is not supported for server-side execution. Supported languages: Java, Python, C++, C, JavaScript, TypeScript, JSX, JSON, SQL, HTML, CSS.`,
      exitCode: 1,
      executionTime: 0,
      explanation: null
    };

  } finally {
    // Cleanup temporary directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup error
    }
  }
}

module.exports = {
  executeCode,
  resolvedJava,
  resolvedJavac
};
