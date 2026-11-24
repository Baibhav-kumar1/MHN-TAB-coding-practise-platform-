export const STARTER_TEMPLATES = {
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("=========================================");
        System.out.println("🚀 Welcome to MHN TAB (Java)");
        System.out.println("=========================================");

        // Reading input from stdin (enter values in the Input tab below)
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter your trainee name: ");
        
        if (sc.hasNext()) {
            String name = sc.next();
            System.out.println("\\nHello, " + name + "! Welcome to MHN TAB.");
            System.out.println("Status: Ready to practice and build projects.");
        } else {
            System.out.println("\\n(Tip: Enter your name in the 'Input' tab below to see live interaction!)");
        }
    }
}
`,

  python: `# =================================================
# 🚀 Welcome to MHN TAB (Python)
# =================================================

import sys

def main():
    print("Welcome Trainee! Python runtime is ready.")
    
    # Example: List processing & calculations
    trainee_skills = ["Python", "DSA", "SQL", "Web Dev", "Problem Solving"]
    print(f"\\nCurrent Learning Track ({len(trainee_skills)} modules):")
    for i, skill in enumerate(trainee_skills, 1):
        print(f"  {i}. {skill}")

    # Check for stdin user input
    user_input = sys.stdin.read().strip()
    if user_input:
        print(f"\\nStandard Input Received: '{user_input}'")
    else:
        print("\\n(Tip: Enter input in the 'Input' tab below to test interactive programs)")

if __name__ == "__main__":
    main()
`,

  cpp: `#include <iostream>
#include <vector>
#include <string>

int main() {
    std::cout << "=========================================" << std::endl;
    std::cout << "🚀 Welcome to MHN TAB (C++)" << std::endl;
    std::cout << "=========================================" << std::endl;

    std::vector<std::string> concepts = {
        "Pointers & Memory", "Object-Oriented Programming", "STL Containers", "Time Complexity"
    };

    std::cout << "Key C++ Core Concepts:" << std::endl;
    for (size_t i = 0; i < concepts.size(); ++i) {
        std::cout << " [" << (i + 1) << "] " << concepts[i] << std::endl;
    }

    std::string inputVal;
    if (std::cin >> inputVal) {
        std::cout << "\\nInput Received from Stdin: " << inputVal << std::endl;
    } else {
        std::cout << "\\n(Tip: Switch to the 'Input' tab below to supply stdin to std::cin)" << std::endl;
    }

    return 0;
}
`,

  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("=========================================\\n");
    printf("🚀 Welcome to MHN TAB (C)\\n");
    printf("=========================================\\n");

    char traineeName[100];
    printf("Enter your name: ");

    if (scanf("%99s", traineeName) == 1) {
        printf("\\nHello, %s! Welcome to MHN TAB.\\n", traineeName);
        printf("C compiler & memory management runtime active.\\n");
    } else {
        printf("\\n(Tip: Enter input in the 'Input' tab below for scanf)\\n");
    }

    return 0;
}
`,

  javascript: `// =================================================
// 🚀 Welcome to MHN TAB (JavaScript)
// =================================================

console.log("Interactive JavaScript Runtime ready!");

const studentCohort = [
  { name: "Aarav", role: "Frontend Trainee", progress: "85%" },
  { name: "Priya", role: "Backend Trainee", progress: "92%" },
  { name: "Rohan", role: "Full-Stack Trainee", progress: "78%" }
];

console.log("\\nActive MHN TAB Student Batch:");
console.table(studentCohort);

const average = studentCohort.reduce((acc, curr) => acc + parseInt(curr.progress), 0) / studentCohort.length;
console.log("Cohort Average Progress: " + average.toFixed(1) + "%");
`,

  jsx: `// =================================================
// 🚀 Welcome to MHN TAB (React Component .jsx)
// =================================================

import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      borderRadius: '12px',
      maxWidth: '480px',
      margin: '2rem auto',
      border: '1px solid #334155',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#38bdf8', marginBottom: '0.5rem' }}>MHN TAB React Component</h2>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
        Interactive stateful component ready for customization.
      </p>

      <div style={{ margin: '1.5rem 0' }}>
        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Counter: {count}</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={() => setCount(prev => prev + 1)}
          style={{
            background: '#38bdf8',
            color: '#0f172a',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Increment (+)
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            background: '#334155',
            color: '#e2e8f0',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
`,

  typescript: `// =================================================
// 🚀 Welcome to MHN TAB (TypeScript .ts)
// =================================================

interface TraineeRecord {
  id: number;
  name: string;
  track: 'Full-Stack' | 'AI/ML' | 'Systems' | 'Database';
  completedModules: number;
  score: number;
}

class CohortRegistry {
  private trainees: TraineeRecord[] = [];

  constructor(initialTrainee?: TraineeRecord) {
    if (initialTrainee) {
      this.trainees.push(initialTrainee);
    }
  }

  public register(trainee: TraineeRecord): void {
    this.trainees.push(trainee);
    console.log(\`Registered: \${trainee.name} -> \${trainee.track}\`);
  }

  public getSummary(): { total: number; averageScore: number } {
    const total = this.trainees.length;
    const avg = total > 0 
      ? this.trainees.reduce((acc, t) => acc + t.score, 0) / total 
      : 0;
    return { total, averageScore: parseFloat(avg.toFixed(2)) };
  }
}

function run(): void {
  console.log("MHN TAB TypeScript execution initialized.");
  
  const registry = new CohortRegistry({
    id: 1,
    name: "Aarav Sharma",
    track: "Full-Stack",
    completedModules: 8,
    score: 92.5
  });

  registry.register({
    id: 2,
    name: "Priya Patel",
    track: "AI/ML",
    completedModules: 10,
    score: 96.0
  });

  console.log("\\nCohort Summary:", registry.getSummary());
}

run();
`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MHN TAB Web Project</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
      margin: 0;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #f8fafc;
    }
    .card {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      width: 380px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: #38bdf8;
      color: #0f172a;
      font-weight: 700;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    h2 { margin: 0 0 10px; font-size: 24px; color: #ffffff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
    button {
      margin-top: 20px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">MHN TAB PREVIEW</span>
    <h2>Interactive Web Preview</h2>
    <p>Edit HTML, CSS, or JavaScript and observe live real-time sandboxed updates.</p>
    <button onclick="changeColor()">Click to Interact</button>
    <p id="counter" style="margin-top: 15px; font-size: 13px; color: #38bdf8;">Clicks: 0</p>
  </div>

  <script>
    let clicks = 0;
    function changeColor() {
      clicks++;
      document.getElementById('counter').innerText = 'Clicks: ' + clicks;
      const card = document.querySelector('.card');
      card.style.borderColor = clicks % 2 === 0 ? '#38bdf8' : '#a855f7';
    }
  </script>
</body>
</html>
`,

  css: `/* ===================================================
   MHN TAB - Modern CSS Starter
   =================================================== */

:root {
  --primary-color: #38bdf8;
  --primary-hover: #0284c7;
  --bg-dark: #0f172a;
  --surface-dark: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --radius: 12px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.developer-card {
  background: var(--surface-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.badge {
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  color: white;
  padding: 0.4rem 1.2rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 12px;
  display: inline-block;
  margin-bottom: 1rem;
}
`,

  sql: `-- ==============================================================
-- 🚀 MHN TAB Database Practice: Relational Schema Queries
-- Available Tables: departments, students, courses, enrollments
-- ==============================================================

-- 1. View all student trainees and their departments
SELECT 
    s.student_id,
    s.name AS trainee_name,
    d.name AS department,
    d.building,
    s.cgpa
FROM students s
JOIN departments d ON s.dept_id = d.dept_id
ORDER BY s.cgpa DESC;

-- 2. View course enrollments and grades
SELECT 
    s.name AS student,
    c.code AS course_code,
    c.title AS course_title,
    e.grade
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id;
`,

  json: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "project": "MHN TAB",
  "version": "1.0.0",
  "description": "Student configuration and workspace manifest",
  "developer": {
    "name": "Baibhav",
    "role": "Lead Architect",
    "status": "Active"
  },
  "modules": [
    "Programming Fundamentals",
    "Data Structures & Algorithms",
    "Web Engineering",
    "Database Systems"
  ],
  "settings": {
    "autoBoilerplate": true,
    "theme": "dark"
  }
}
`
};

/**
 * Normalizes extension and returns the appropriate automatic starter boilerplate.
 * If the extension is unsupported, returns empty string "" (blank file).
 */
export function getBoilerplateForExtension(extensionOrFilename, filename = '') {
  if (!extensionOrFilename && !filename) return '';

  let ext = '';
  let targetName = filename || '';

  if (extensionOrFilename && extensionOrFilename.includes('.')) {
    const dotIdx = extensionOrFilename.lastIndexOf('.');
    ext = extensionOrFilename.substring(dotIdx).toLowerCase();
    if (!targetName) targetName = extensionOrFilename;
  } else if (extensionOrFilename) {
    ext = extensionOrFilename.startsWith('.') 
      ? extensionOrFilename.toLowerCase() 
      : '.' + extensionOrFilename.toLowerCase();
  }

  switch (ext) {
    case '.html':
    case '.htm':
      return STARTER_TEMPLATES.html;

    case '.css':
      return STARTER_TEMPLATES.css;

    case '.js':
    case '.mjs':
    case '.cjs':
      return STARTER_TEMPLATES.javascript;

    case '.jsx':
      return STARTER_TEMPLATES.jsx;

    case '.ts':
    case '.tsx':
      return STARTER_TEMPLATES.typescript;

    case '.py':
    case '.pyw':
      return STARTER_TEMPLATES.python;

    case '.java': {
      // If filename has a specific class name base, update Java class name
      if (targetName) {
        const dotIdx = targetName.lastIndexOf('.');
        const baseName = dotIdx !== -1 ? targetName.substring(0, dotIdx) : targetName;
        const validIdentifier = baseName.replace(/[^a-zA-Z0-9_]/g, '');
        if (validIdentifier && validIdentifier !== 'Main' && /^[a-zA-Z]/.test(validIdentifier)) {
          return STARTER_TEMPLATES.java.replace(/public class Main/g, `public class ${validIdentifier}`);
        }
      }
      return STARTER_TEMPLATES.java;
    }

    case '.cpp':
    case '.cc':
    case '.cxx':
    case '.hpp':
      return STARTER_TEMPLATES.cpp;

    case '.c':
    case '.h':
      return STARTER_TEMPLATES.c;

    case '.sql':
      return STARTER_TEMPLATES.sql;

    case '.json':
      return STARTER_TEMPLATES.json;

    default:
      // Unsupported extension: create a completely blank file
      return '';
  }
}
