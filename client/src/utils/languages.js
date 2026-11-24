export const LANGUAGES = [
  {
    id: 'java',
    name: 'Java',
    version: 'OpenJDK 25 LTS',
    monacoLang: 'java',
    extension: '.java',
    color: '#f89820',
    description: 'Enterprise & Android standard language'
  },
  {
    id: 'python',
    name: 'Python',
    version: 'Python 3.14',
    monacoLang: 'python',
    extension: '.py',
    color: '#3572A5',
    description: 'Clean syntax, AI/ML & scripting'
  },
  {
    id: 'cpp',
    name: 'C++',
    version: 'Clang C++17',
    monacoLang: 'cpp',
    extension: '.cpp',
    color: '#f34b7d',
    description: 'High performance systems & DSA'
  },
  {
    id: 'c',
    name: 'C',
    version: 'Clang C11',
    monacoLang: 'c',
    extension: '.c',
    color: '#555555',
    description: 'Procedural systems & low-level memory'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    version: 'Node.js v22',
    monacoLang: 'javascript',
    extension: '.js',
    color: '#f1e05a',
    description: 'Web development & full-stack applications'
  },
  {
    id: 'jsx',
    name: 'React (JSX)',
    version: 'React 18',
    monacoLang: 'javascript',
    extension: '.jsx',
    color: '#61dafb',
    description: 'Declarative component-based UI'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    version: 'TS 5.x / Node 22',
    monacoLang: 'typescript',
    extension: '.ts',
    color: '#3178c6',
    description: 'Type-safe JavaScript at scale'
  },
  {
    id: 'html',
    name: 'HTML',
    version: 'HTML5 Live',
    monacoLang: 'html',
    extension: '.html',
    color: '#e34c26',
    description: 'Structure of modern web applications'
  },
  {
    id: 'css',
    name: 'CSS',
    version: 'CSS3 Live',
    monacoLang: 'css',
    extension: '.css',
    color: '#563d7c',
    description: 'Responsive styling & layouts'
  },
  {
    id: 'sql',
    name: 'SQL',
    version: 'SQLite 3.43',
    monacoLang: 'sql',
    extension: '.sql',
    color: '#e38c00',
    description: 'Relational databases & data querying'
  },
  {
    id: 'json',
    name: 'JSON',
    version: 'RFC 8259',
    monacoLang: 'json',
    extension: '.json',
    color: '#cbcb41',
    description: 'Standard data interchange format'
  }
];

const EXTENSION_MAP = {
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'jsx',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.pyw': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.sql': 'sql',
  '.json': 'json'
};

export const getLanguageConfig = (id) => {
  const norm = (id || '').toLowerCase();
  return LANGUAGES.find(l => l.id === norm) || LANGUAGES.find(l => l.id === 'python') || LANGUAGES[0];
};

export const getLanguageByExtension = (ext) => {
  if (!ext) return null;
  const cleanExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  const langId = EXTENSION_MAP[cleanExt];
  return langId ? getLanguageConfig(langId) : null;
};
