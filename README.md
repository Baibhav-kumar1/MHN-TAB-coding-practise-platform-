# 🚀 MHN TAB – Advanced Coding Playground & Developer Platform

**MHN TAB** is a world-class, responsive, web-based interactive coding and learning platform designed for students, trainees, and developers. Built with Monaco Editor (VS Code engine), isolated multi-language code execution, intelligent AI Coding Mentor, student dashboard, global question bank, and automatic file boilerplate generation.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Coding Assistant
- **Context-Aware Assistance**: Automatically receives current code, active language syntax, and execution output/errors.
- **Dedicated Mentor**: Dedicated greeting (*"Baibhav have assigned me for your help plz go ahead"*), step-by-step guidance, and explanations of syntax, logic, and runtime errors.
- **Safe 1-Click Code Fixes**: AI suggestions can be applied directly to the Monaco editor with explicit user confirmation.
- **Dual-Engine Architecture**: Supports Google Gemini Generative API (`GEMINI_API_KEY`) with an intelligent pedagogical fallback.

### 2. ⚡ Intelligent File Creation & Automatic Boilerplate Generation
- **Automatic Extension Detection**: Instantly detects extensions and generates boilerplate starter code for 11 languages:
  - **HTML5 (`.html`)**: Complete document with styling and interactive preview script.
  - **CSS3 (`.css`)**: Modern CSS starter with design tokens, responsive cards, and flexbox.
  - **JavaScript (`.js`)**: Interactive Node.js runtime starter with console tables.
  - **React JSX (`.jsx`)**: Stateful React component starter with hooks.
  - **TypeScript (`.ts`)**: Typed TypeScript class with interfaces and execution.
  - **Python (`.py`)**: Python 3 runtime starter with arguments and stdin processing.
  - **Java (`.java`)**: Java class with dynamic class name matching and `Scanner`.
  - **C++ (`.cpp`)**: C++17 starter with STL vectors and streams.
  - **C (`.c`)**: C starter with memory management and `scanf`.
  - **SQL (`.sql`)**: Relational database queries with pre-seeded joins.
  - **JSON (`.json`)**: Valid RFC 8259 JSON structure.
- **Preserve Existing Code**: Existing code is **never** overwritten when loading or opening files.
- **Empty File Helper**: Floating `[Insert Starter Template]` button for empty files.
- **Settings Toggle**: Enable or disable automatic boilerplate in Playground Preferences.
- **Reset to Template**: 1-click restore to default boilerplate in the toolbar.

### 3. 🖥️ Advanced Multi-Layout Workspace
- **Horizontal Split**: Code editor on left, terminal output on right (draggable divider).
- **Vertical Split**: Code editor on top, terminal output on bottom (draggable divider).
- **Full Editor**: Maximized Monaco editor for distraction-free coding.
- **Full Output**: Maximized terminal and preview output.
- **Split Ratio Clamping**: Smooth mouse and touch dragging between 15% and 85% with 50/50 balance reset.

### 4. 📊 Centralized Question Bank & Student Dashboard
- **Problem Solving**: Practice challenges categorized by Easy, Medium, and Hard with sample and hidden test case evaluation.
- **Single Admin Portal**: Manage and publish coding questions with live SSE synchronization across all students.
- **Real-Time Analytics**: Execution timeline, submission history, difficulty breakdown, and language distribution.
- **Friction-Free Access**: Direct access to all developer tools, editor, question bank, and admin portal.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Monaco Editor (`@monaco-editor/react`), Tailwind CSS, Lucide Icons
- **Backend**: Node.js v22, Express.js, SQLite (`better-sqlite3`), Server-Sent Events (SSE)
- **Compilers & Runtimes**: OpenJDK 25, Python 3.14, Clang/LLVM C/C++17, Node.js TS execution

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Baibhav-kumar1/MHN-TAB.git
cd MHN-TAB
```

### 2. Backend Setup
```bash
cd server
npm install
node seed.js    # Initializes SQLite database & seeds practice questions
node server.js  # Runs API on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev     # Runs development server on http://localhost:3000
```

To build for production:
```bash
npm run build
```

---

## 🌐 Live Local URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:3000](http://localhost:3000) | Vite React Dev Server |
| **Backend API** | [http://localhost:5001](http://localhost:5001) | Express API & SSE Sync |
| **API Health Check** | [http://localhost:5001/api/health](http://localhost:5001/api/health) | System Runtime Diagnostics |

---

## 📄 License

MIT License. Designed & Developed by **Baibhav Kumar**.
