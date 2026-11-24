const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { initDB, dbRun, dbGet } = require('./database');

const practiceProblems = [
  // 1. Variables and Data Types (Beginner)
  {
    id: 'prob-1',
    title: 'Sum of Two Numbers',
    slug: 'sum-of-two-numbers',
    difficulty: 'Beginner',
    topic: 'Variables and Data Types',
    description: 'Read two integers `a` and `b` from standard input and print their sum to standard output.',
    input_format: 'Two space-separated or newline-separated integers `a` and `b`.',
    output_format: 'A single integer representing `a + b`.',
    constraints: '-10^6 <= a, b <= 10^6',
    starter_templates: JSON.stringify({
      python: '# Read two integers and print their sum\nimport sys\n\ndef solve():\n    data = sys.stdin.read().split()\n    if not data: return\n    a = int(data[0])\n    b = int(data[1])\n    print(a + b)\n\nsolve()\n',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}\n',
      cpp: '#include <iostream>\n\nint main() {\n    long long a, b;\n    if (std::cin >> a >> b) {\n        std::cout << (a + b) << std::endl;\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (input.length >= 2) {\n    const a = parseInt(input[0], 10);\n    const b = parseInt(input[1], 10);\n    console.log(a + b);\n}\n'
    }),
    test_cases: JSON.stringify([
      { input: '10\n20', expected_output: '30', is_sample: true },
      { input: '45 55', expected_output: '100', is_sample: true },
      { input: '-15 25', expected_output: '10', is_sample: false },
      { input: '999999 1', expected_output: '1000000', is_sample: false }
    ])
  },

  // 2. Conditional Statements (Beginner)
  {
    id: 'prob-2',
    title: 'Leap Year Checker',
    slug: 'leap-year-checker',
    difficulty: 'Beginner',
    topic: 'Conditional Statements',
    description: 'Given a year `Y`, determine whether it is a leap year. A year is a leap year if it is divisible by 4, except end-of-century years, which must be divisible by 400. Print `LEAP` or `COMMON`.',
    input_format: 'A single integer `Y`.',
    output_format: 'Print `LEAP` if leap year, otherwise `COMMON`.',
    constraints: '1 <= Y <= 9999',
    starter_templates: JSON.stringify({
      python: 'import sys\n\ndef is_leap():\n    raw = sys.stdin.read().strip()\n    if not raw: return\n    y = int(raw)\n    if (y % 400 == 0) or (y % 4 == 0 and y % 100 != 0):\n        print("LEAP")\n    else:\n        print("COMMON")\n\nis_leap()\n',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int y = sc.nextInt();\n        if ((y % 400 == 0) || (y % 4 == 0 && y % 100 != 0)) {\n            System.out.println("LEAP");\n        } else {\n            System.out.println("COMMON");\n        }\n    }\n}\n',
      cpp: '#include <iostream>\n\nint main() {\n    int y;\n    if (std::cin >> y) {\n        if ((y % 400 == 0) || (y % 4 == 0 && y % 100 != 0)) {\n            std::cout << "LEAP" << std::endl;\n        } else {\n            std::cout << "COMMON" << std::endl;\n        }\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nconst y = parseInt(fs.readFileSync(0, "utf-8").trim(), 10);\nif (!isNaN(y)) {\n    if ((y % 400 === 0) || (y % 4 === 0 && y % 100 !== 0)) {\n        console.log("LEAP");\n    } else {\n        console.log("COMMON");\n    }\n}\n'
    }),
    test_cases: JSON.stringify([
      { input: '2024', expected_output: 'LEAP', is_sample: true },
      { input: '1900', expected_output: 'COMMON', is_sample: true },
      { input: '2000', expected_output: 'LEAP', is_sample: false },
      { input: '2023', expected_output: 'COMMON', is_sample: false }
    ])
  },

  // 3. Loops (Beginner)
  {
    id: 'prob-3',
    title: 'Fibonacci Sequence Generator',
    slug: 'fibonacci-generator',
    difficulty: 'Beginner',
    topic: 'Loops',
    description: 'Print the first `N` terms of the Fibonacci sequence starting with 0 and 1, space-separated.',
    input_format: 'A single integer `N`.',
    output_format: '`N` space-separated Fibonacci numbers.',
    constraints: '1 <= N <= 30',
    starter_templates: JSON.stringify({
      python: 'import sys\n\ndef fib():\n    raw = sys.stdin.read().strip()\n    if not raw: return\n    n = int(raw)\n    fibs = []\n    a, b = 0, 1\n    for _ in range(n):\n        fibs.append(str(a))\n        a, b = b, a + b\n    print(" ".join(fibs))\n\nfib()\n',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long a = 0, b = 1;\n        for (int i = 0; i < n; i++) {\n            System.out.print(a + (i == n - 1 ? "" : " "));\n            long next = a + b;\n            a = b;\n            b = next;\n        }\n        System.out.println();\n    }\n}\n',
      cpp: '#include <iostream>\n\nint main() {\n    int n;\n    if (std::cin >> n) {\n        long long a = 0, b = 1;\n        for (int i = 0; i < n; ++i) {\n            std::cout << a << (i == n - 1 ? "" : " ");\n            long long next = a + b;\n            a = b;\n            b = next;\n        }\n        std::cout << std::endl;\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nconst n = parseInt(fs.readFileSync(0, "utf-8").trim(), 10);\nconst res = [];\nlet a = 0, b = 1;\nfor (let i = 0; i < n; i++) {\n    res.push(a);\n    const next = a + b;\n    a = b;\n    b = next;\n}\nconsole.log(res.join(" "));\n'
    }),
    test_cases: JSON.stringify([
      { input: '5', expected_output: '0 1 1 2 3', is_sample: true },
      { input: '1', expected_output: '0', is_sample: true },
      { input: '7', expected_output: '0 1 1 2 3 5 8', is_sample: false },
      { input: '10', expected_output: '0 1 1 2 3 5 8 13 21 34', is_sample: false }
    ])
  },

  // 4. Arrays (Intermediate)
  {
    id: 'prob-4',
    title: 'Second Largest Element',
    slug: 'second-largest-element',
    difficulty: 'Intermediate',
    topic: 'Arrays',
    description: 'Given an array of `N` integers, find and print the second distinct largest element in the array. If no distinct second largest element exists, print -1.',
    input_format: 'First line contains integer `N`. Second line contains `N` integers.',
    output_format: 'A single integer representing the second largest distinct element, or -1.',
    constraints: '1 <= N <= 10^5',
    starter_templates: JSON.stringify({
      python: 'import sys\n\ndef solve():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = [int(x) for x in data[1:n+1]]\n    distinct = sorted(list(set(nums)), reverse=True)\n    if len(distinct) >= 2:\n        print(distinct[1])\n    else:\n        print(-1)\n\nsolve()\n',
      java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        TreeSet<Integer> set = new TreeSet<>();\n        for (int i = 0; i < n; i++) {\n            set.add(sc.nextInt());\n        }\n        if (set.size() < 2) {\n            System.out.println(-1);\n        } else {\n            set.pollLast();\n            System.out.println(set.last());\n        }\n    }\n}\n',
      cpp: '#include <iostream>\n#include <vector>\n#include <set>\n\nint main() {\n    int n;\n    if (std::cin >> n) {\n        std::set<long long> s;\n        for (int i = 0; i < n; ++i) {\n            long long val;\n            std::cin >> val;\n            s.insert(val);\n        }\n        if (s.size() < 2) {\n            std::cout << -1 << std::endl;\n        } else {\n            auto it = s.rbegin();\n            ++it;\n            std::cout << *it << std::endl;\n        }\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length > 0) {\n    const n = parseInt(tokens[0], 10);\n    const arr = tokens.slice(1, n + 1).map(Number);\n    const unique = [...new Set(arr)].sort((a, b) => b - a);\n    console.log(unique.length >= 2 ? unique[1] : -1);\n}\n'
    }),
    test_cases: JSON.stringify([
      { input: '5\n12 35 1 10 34', expected_output: '34', is_sample: true },
      { input: '3\n10 10 10', expected_output: '-1', is_sample: true },
      { input: '6\n5 9 2 9 8 3', expected_output: '8', is_sample: false }
    ])
  },

  // 5. Strings (Beginner)
  {
    id: 'prob-5',
    title: 'Palindrome String Checker',
    slug: 'palindrome-checker',
    difficulty: 'Beginner',
    topic: 'Strings',
    description: 'Given a single word string, determine if it is a palindrome (reads the same forwards and backwards, ignoring case). Print `YES` or `NO`.',
    input_format: 'A single alphanumeric string `S`.',
    output_format: '`YES` or `NO`.',
    constraints: '1 <= |S| <= 1000',
    starter_templates: JSON.stringify({
      python: 'import sys\n\ndef is_palindrome():\n    s = sys.stdin.read().strip().lower()\n    if not s: return\n    if s == s[::-1]:\n        print("YES")\n    else:\n        print("NO")\n\nis_palindrome()\n',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String s = sc.next().toLowerCase();\n        String rev = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(rev) ? "YES" : "NO");\n    }\n}\n',
      cpp: '#include <iostream>\n#include <string>\n#include <algorithm>\n\nint main() {\n    std::string s;\n    if (std::cin >> s) {\n        for (char &c : s) c = tolower(c);\n        std::string rev = s;\n        std::reverse(rev.begin(), rev.end());\n        std::cout << (s == rev ? "YES" : "NO") << std::endl;\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim().toLowerCase();\nif (s) {\n    const rev = s.split("").reverse().join("");\n    console.log(s === rev ? "YES" : "NO");\n}\n'
    }),
    test_cases: JSON.stringify([
      { input: 'racecar', expected_output: 'YES', is_sample: true },
      { input: 'hello', expected_output: 'NO', is_sample: true },
      { input: 'Madam', expected_output: 'YES', is_sample: false },
      { input: 'level', expected_output: 'YES', is_sample: false }
    ])
  },

  // 6. Functions (Beginner)
  {
    id: 'prob-6',
    title: 'Greatest Common Divisor (GCD)',
    slug: 'greatest-common-divisor',
    difficulty: 'Beginner',
    topic: 'Functions',
    description: 'Implement a function to find the Greatest Common Divisor (GCD) of two integers using the Euclidean algorithm.',
    input_format: 'Two integers `a` and `b`.',
    output_format: 'The GCD of `a` and `b`.',
    constraints: '1 <= a, b <= 10^9',
    starter_templates: JSON.stringify({
      python: 'import sys\n\ndef gcd(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a\n\ndata = sys.stdin.read().split()\nif data:\n    print(gcd(int(data[0]), int(data[1])))\n',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static long gcd(long a, long b) {\n        return b == 0 ? a : gcd(b, a % b);\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong();\n        long b = sc.nextLong();\n        System.out.println(gcd(a, b));\n    }\n}\n',
      cpp: '#include <iostream>\n\nlong long gcd(long long a, long long b) {\n    return b == 0 ? a : gcd(b, a % b);\n}\n\nint main() {\n    long long a, b;\n    if (std::cin >> a >> b) {\n        std::cout << gcd(a, b) << std::endl;\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nfunction gcd(a, b) {\n    while (b) {\n        let t = b;\n        b = a % b;\n        a = t;\n    }\n    return a;\n}\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n    console.log(gcd(parseInt(tokens[0], 10), parseInt(tokens[1], 10)));\n}\n'
    }),
    test_cases: JSON.stringify([
      { input: '48 18', expected_output: '6', is_sample: true },
      { input: '101 103', expected_output: '1', is_sample: true },
      { input: '1000 500', expected_output: '500', is_sample: false },
      { input: '56 98', expected_output: '14', is_sample: false }
    ])
  },

  // 7. Object-Oriented Programming (Intermediate)
  {
    id: 'prob-7',
    title: 'Student Grade Tracker (OOP)',
    slug: 'student-grade-tracker',
    difficulty: 'Intermediate',
    topic: 'Object-Oriented Programming',
    description: 'Design a Student class with `name` and a list of marks. Compute the average score and assign a grade: >= 90: "A", >= 80: "B", >= 70: "C", else: "F". Print `Name Average Grade`.',
    input_format: 'First line has student name. Second line has integer `K` (number of subjects). Third line has `K` integer marks.',
    output_format: 'Single line with: `<name> <rounded_average> <grade>`',
    constraints: '1 <= K <= 10, marks between 0 and 100',
    starter_templates: JSON.stringify({
      python: 'import sys\n\nclass Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\n    def get_average(self):\n        return round(sum(self.marks) / len(self.marks))\n\n    def get_grade(self):\n        avg = self.get_average()\n        if avg >= 90: return "A"\n        if avg >= 80: return "B"\n        if avg >= 70: return "C"\n        return "F"\n\ndata = sys.stdin.read().split()\nif data:\n    name = data[0]\n    k = int(data[1])\n    marks = [int(x) for x in data[2:2+k]]\n    s = Student(name, marks)\n    print(f"{s.name} {s.get_average()} {s.get_grade()}")\n',
      java: 'import java.util.*;\n\nclass Student {\n    String name;\n    List<Integer> marks;\n\n    Student(String name, List<Integer> marks) {\n        this.name = name;\n        this.marks = marks;\n    }\n\n    int getAverage() {\n        int sum = 0;\n        for (int m : marks) sum += m;\n        return Math.round((float) sum / marks.size());\n    }\n\n    String getGrade() {\n        int avg = getAverage();\n        if (avg >= 90) return "A";\n        if (avg >= 80) return "B";\n        if (avg >= 70) return "C";\n        return "F";\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String name = sc.next();\n        int k = sc.nextInt();\n        List<Integer> marks = new ArrayList<>();\n        for (int i = 0; i < k; i++) marks.add(sc.nextInt());\n        Student s = new Student(name, marks);\n        System.out.println(s.name + " " + s.getAverage() + " " + s.getGrade());\n    }\n}\n',
      cpp: '#include <iostream>\n#include <vector>\n#include <string>\n#include <numeric>\n#include <cmath>\n\nclass Student {\npublic:\n    std::string name;\n    std::vector<int> marks;\n\n    Student(std::string n, std::vector<int> m) : name(n), marks(m) {}\n\n    int getAverage() {\n        int sum = std::accumulate(marks.begin(), marks.end(), 0);\n        return std::round((float)sum / marks.size());\n    }\n\n    std::string getGrade() {\n        int avg = getAverage();\n        if (avg >= 90) return "A";\n        if (avg >= 80) return "B";\n        if (avg >= 70) return "C";\n        return "F";\n    }\n};\n\nint main() {\n    std::string name;\n    int k;\n    if (std::cin >> name >> k) {\n        std::vector<int> marks(k);\n        for (int i = 0; i < k; ++i) std::cin >> marks[i];\n        Student s(name, marks);\n        std::cout << s.name << " " << s.getAverage() << " " << s.getGrade() << std::endl;\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nclass Student {\n    constructor(name, marks) {\n        this.name = name;\n        this.marks = marks;\n    }\n    getAverage() {\n        const sum = this.marks.reduce((a, b) => a + b, 0);\n        return Math.round(sum / this.marks.length);\n    }\n    getGrade() {\n        const avg = this.getAverage();\n        if (avg >= 90) return "A";\n        if (avg >= 80) return "B";\n        if (avg >= 70) return "C";\n        return "F";\n    }\n}\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n    const name = tokens[0];\n    const k = parseInt(tokens[1], 10);\n    const marks = tokens.slice(2, 2 + k).map(Number);\n    const s = new Student(name, marks);\n    console.log(`${s.name} ${s.getAverage()} ${s.getGrade()}`);\n}\n'
    }),
    test_cases: JSON.stringify([
      { input: 'Alex 3 95 85 90', expected_output: 'Alex 90 A', is_sample: true },
      { input: 'Samantha 4 70 75 72 71', expected_output: 'Samantha 72 C', is_sample: true },
      { input: 'Dev 3 50 60 40', expected_output: 'Dev 50 F', is_sample: false }
    ])
  },

  // 8. Data Structures (Intermediate - Stack)
  {
    id: 'prob-8',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Intermediate',
    topic: 'Data Structures',
    description: 'Given a string containing only brackets `()`, `{}`, and `[]`, determine if the input string is valid. A string is valid if brackets are closed in the correct order by the corresponding type of bracket.',
    input_format: 'A single string `S` of bracket characters.',
    output_format: '`VALID` or `INVALID`.',
    constraints: '1 <= |S| <= 10^5',
    starter_templates: JSON.stringify({
      python: 'import sys\n\ndef isValid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping.values():\n            stack.append(char)\n        elif char in mapping:\n            if not stack or stack[-1] != mapping[char]:\n                return False\n            stack.pop()\n    return len(stack) == 0\n\ns = sys.stdin.read().strip()\nif s:\n    print("VALID" if isValid(s) else "INVALID")\n',
      java: 'import java.util.*;\n\npublic class Main {\n    public static boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\' || c == \'{\' || c == \'[\') {\n                stack.push(c);\n            } else {\n                if (stack.isEmpty()) return false;\n                char top = stack.pop();\n                if (c == \')\' && top != \'(\') return false;\n                if (c == \'}\' && top != \'{\') return false;\n                if (c == \']\' && top != \'[\') return false;\n            }\n        }\n        return stack.isEmpty();\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(isValid(s) ? "VALID" : "INVALID");\n        }\n    }\n}\n',
      cpp: '#include <iostream>\n#include <string>\n#include <stack>\n\nbool isValid(const std::string& s) {\n    std::stack<char> st;\n    for (char c : s) {\n        if (c == \'(\' || c == \'{\' || c == \'[\') {\n            st.push(c);\n        } else {\n            if (st.empty()) return false;\n            char top = st.top();\n            st.pop();\n            if (c == \')\' && top != \'(\') return false;\n            if (c == \'}\' && top != \'{\') return false;\n            if (c == \']\' && top != \'[\') return false;\n        }\n    }\n    return st.empty();\n}\n\nint main() {\n    std::string s;\n    if (std::cin >> s) {\n        std::cout << (isValid(s) ? "VALID" : "INVALID") << std::endl;\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nfunction isValid(s) {\n    const stack = [];\n    const map = { ")": "(", "}": "{", "]": "[" };\n    for (const char of s) {\n        if (char === "(" || char === "{" || char === "[") {\n            stack.push(char);\n        } else if (map[char]) {\n            if (!stack.length || stack.pop() !== map[char]) return false;\n        }\n    }\n    return stack.length === 0;\n}\nconst s = fs.readFileSync(0, "utf-8").trim();\nif (s) console.log(isValid(s) ? "VALID" : "INVALID");\n'
    }),
    test_cases: JSON.stringify([
      { input: '()[]{}', expected_output: 'VALID', is_sample: true },
      { input: '([)]', expected_output: 'INVALID', is_sample: true },
      { input: '{[()]}', expected_output: 'VALID', is_sample: false },
      { input: '(((((', expected_output: 'INVALID', is_sample: false }
    ])
  },

  // 9. Data Structures (Advanced - Binary Search / Two Pointers)
  {
    id: 'prob-9',
    title: 'Two Sum Target Pairs',
    slug: 'two-sum-target-pairs',
    difficulty: 'Advanced',
    topic: 'Data Structures',
    description: 'Given an array of integers and an integer `target`, find if there exist two distinct indices whose elements sum to `target`. Print `YES` or `NO`.',
    input_format: 'Line 1: `N` and `target`. Line 2: `N` space-separated integers.',
    output_format: '`YES` if a pair exists, otherwise `NO`.',
    constraints: '2 <= N <= 10^5, -10^9 <= target, array elements <= 10^9',
    starter_templates: JSON.stringify({
      python: 'import sys\n\ndef two_sum():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    target = int(data[1])\n    nums = [int(x) for x in data[2:2+n]]\n    seen = set()\n    for x in nums:\n        if (target - x) in seen:\n            print("YES")\n            return\n        seen.add(x)\n    print("NO")\n\ntwo_sum()\n',
      java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        long target = sc.nextLong();\n        Set<Long> seen = new HashSet<>();\n        boolean found = false;\n        for (int i = 0; i < n; i++) {\n            long val = sc.nextLong();\n            if (seen.contains(target - val)) {\n                found = true;\n            }\n            seen.add(val);\n        }\n        System.out.println(found ? "YES" : "NO");\n    }\n}\n',
      cpp: '#include <iostream>\n#include <unordered_set>\n\nint main() {\n    int n;\n    long long target;\n    if (std::cin >> n >> target) {\n        std::unordered_set<long long> seen;\n        bool found = false;\n        for (int i = 0; i < n; ++i) {\n            long long val;\n            std::cin >> val;\n            if (seen.count(target - val)) found = true;\n            seen.insert(val);\n        }\n        std::cout << (found ? "YES" : "NO") << std::endl;\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n    const n = parseInt(tokens[0], 10);\n    const target = parseInt(tokens[1], 10);\n    const nums = tokens.slice(2, 2 + n).map(Number);\n    const seen = new Set();\n    let found = false;\n    for (const x of nums) {\n        if (seen.has(target - x)) {\n            found = true;\n            break;\n        }\n        seen.add(x);\n    }\n    console.log(found ? "YES" : "NO");\n}\n'
    }),
    test_cases: JSON.stringify([
      { input: '4 9\n2 7 11 15', expected_output: 'YES', is_sample: true },
      { input: '3 6\n3 2 4', expected_output: 'YES', is_sample: true },
      { input: '2 10\n1 2', expected_output: 'NO', is_sample: false },
      { input: '5 100\n10 20 30 40 50', expected_output: 'NO', is_sample: false }
    ])
  },

  // 10. Strings (Intermediate)
  {
    id: 'prob-10',
    title: 'Anagram Checker',
    slug: 'anagram-checker',
    difficulty: 'Intermediate',
    topic: 'Strings',
    description: 'Given two lowercase words `S1` and `S2`, determine whether they are anagrams (formed by rearranging the letters of each other). Print `ANAGRAM` or `NOT ANAGRAM`.',
    input_format: 'Two space-separated strings `S1` and `S2`.',
    output_format: '`ANAGRAM` or `NOT ANAGRAM`.',
    constraints: '1 <= |S1|, |S2| <= 10^5',
    starter_templates: JSON.stringify({
      python: 'import sys\n\ndef is_anagram():\n    data = sys.stdin.read().split()\n    if len(data) < 2: return\n    s1 = sorted(data[0])\n    s2 = sorted(data[1])\n    print("ANAGRAM" if s1 == s2 else "NOT ANAGRAM")\n\nis_anagram()\n',
      java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        char[] s1 = sc.next().toCharArray();\n        char[] s2 = sc.next().toCharArray();\n        Arrays.sort(s1);\n        Arrays.sort(s2);\n        System.out.println(Arrays.equals(s1, s2) ? "ANAGRAM" : "NOT ANAGRAM");\n    }\n}\n',
      cpp: '#include <iostream>\n#include <string>\n#include <algorithm>\n\nint main() {\n    std::string s1, s2;\n    if (std::cin >> s1 >> s2) {\n        std::sort(s1.begin(), s1.end());\n        std::sort(s2.begin(), s2.end());\n        std::cout << (s1 == s2 ? "ANAGRAM" : "NOT ANAGRAM") << std::endl;\n    }\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n    const s1 = tokens[0].split("").sort().join("");\n    const s2 = tokens[1].split("").sort().join("");\n    console.log(s1 === s2 ? "ANAGRAM" : "NOT ANAGRAM");\n}\n'
    }),
    test_cases: JSON.stringify([
      { input: 'listen silent', expected_output: 'ANAGRAM', is_sample: true },
      { input: 'triangle integral', expected_output: 'ANAGRAM', is_sample: true },
      { input: 'apple pale', expected_output: 'NOT ANAGRAM', is_sample: false }
    ])
  }
];

async function seed() {
  await initDB();

  // Create default student user
  const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', ['student@ojt.edu']);
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('student123', 10);
    const userId = uuidv4();
    await dbRun(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [userId, 'OJT Trainee', 'student@ojt.edu', passwordHash, 'student']
    );
    console.log('Created default student account: student@ojt.edu / student123');

    // Create sample saved programs for demo student
    await dbRun(
      `INSERT INTO programs (id, user_id, title, description, language, code, stdin, tags, is_public, share_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        userId,
        'Java Math & Scanner Demo',
        'Demonstrates Scanner stdin input and basic math logic',
        'java',
        `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("=== OJT Java Interactive Demo ===");
        if (sc.hasNext()) {
            String name = sc.next();
            int score = sc.hasNextInt() ? sc.nextInt() : 100;
            System.out.println("Hello, " + name + "! Your training score is: " + score);
        } else {
            System.out.println("Provide your name and score in the Input tab!");
        }
    }
}`,
        'Baibhav 98',
        JSON.stringify(['demo', 'scanner', 'java']),
        1,
        'demo-java'
      ]
    );

    await dbRun(
      `INSERT INTO programs (id, user_id, title, description, language, code, stdin, tags, is_public, share_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        userId,
        'Python Data Analysis',
        'Quick stats calculations with list comprehensions',
        'python',
        `# Python Data Processing Demo
scores = [88, 92, 79, 95, 84, 90, 100, 76]

avg = sum(scores) / len(scores)
highest = max(scores)
passed = [s for s in scores if s >= 80]

print("=== Batch Performance Analysis ===")
print(f"Total Trainees: {len(scores)}")
print(f"Class Average:  {avg:.2f}")
print(f"Top Score:      {highest}")
print(f"Passed >= 80%:  {len(passed)} students")
`,
        '',
        JSON.stringify(['python', 'analytics']),
        1,
        'demo-python'
      ]
    );

    await dbRun(
      `INSERT INTO programs (id, user_id, title, description, language, code, stdin, tags, is_public, share_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        userId,
        'SQL University Query',
        'Join students with their departments and courses',
        'sql',
        `-- Query all top-performing students and their departments
SELECT 
    s.student_id,
    s.name AS student_name,
    d.name AS department,
    s.cgpa
FROM students s
JOIN departments d ON s.dept_id = d.dept_id
WHERE s.cgpa >= 8.5
ORDER BY s.cgpa DESC;
`,
        '',
        JSON.stringify(['sql', 'relational', 'joins']),
        1,
        'demo-sql'
      ]
    );
  }

  // Create default admin user
  const existingAdmin = await dbGet('SELECT * FROM users WHERE email = ?', ['admin@ojt.edu']);
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();
    await dbRun(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [adminId, 'Platform Administrator', 'admin@ojt.edu', adminPasswordHash, 'admin']
    );
    console.log('Created default admin account: admin@ojt.edu / admin123');
  }

  // Populate practice problems
  const difficultyMap = {
    'Beginner': 'Easy',
    'Intermediate': 'Medium',
    'Advanced': 'Hard',
    'Easy': 'Easy',
    'Medium': 'Medium',
    'Hard': 'Hard'
  };

  for (const prob of practiceProblems) {
    const normDiff = difficultyMap[prob.difficulty] || prob.difficulty;
    const existing = await dbGet('SELECT id FROM practice_problems WHERE slug = ?', [prob.slug]);
    if (!existing) {
      await dbRun(
        `INSERT INTO practice_problems (id, title, slug, difficulty, topic, description, input_format, output_format, constraints, starter_templates, test_cases, is_published, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prob.id,
          prob.title,
          prob.slug,
          normDiff,
          prob.topic,
          prob.description,
          prob.input_format,
          prob.output_format,
          prob.constraints,
          prob.starter_templates,
          prob.test_cases,
          1,
          'admin'
        ]
      );
    } else {
      await dbRun(
        `UPDATE practice_problems SET difficulty = ?, is_published = 1 WHERE slug = ?`,
        [normDiff, prob.slug]
      );
    }
  }

  // Seed Curated Focus Music Tracks
  const defaultTracks = [
    {
      id: 'track-lofi-1',
      title: 'Lofi Hip Hop Radio - Beats to Relax/Study',
      artist: 'Lofi Girl',
      source_type: 'youtube',
      source_url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      duration: 0,
      thumbnail_url: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
      is_published: 1,
      created_by: 'admin'
    },
    {
      id: 'track-synth-2',
      title: 'Synthwave Chill - Retro Coding Beats',
      artist: 'Lofi Girl',
      source_type: 'youtube',
      source_url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
      duration: 0,
      thumbnail_url: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
      is_published: 1,
      created_by: 'admin'
    },
    {
      id: 'track-stream-3',
      title: 'Deep Electronic Focus Session',
      artist: 'SoundHelix Audio',
      source_type: 'stream',
      source_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 372,
      thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
      is_published: 1,
      created_by: 'admin'
    },
    {
      id: 'track-stream-4',
      title: 'Calm Melodic Coding Flow',
      artist: 'SoundHelix Audio',
      source_type: 'stream',
      source_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 423,
      thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&q=80',
      is_published: 1,
      created_by: 'admin'
    },
    {
      id: 'track-stream-5',
      title: 'Ambient Gentle Rain Background',
      artist: 'Nature Soundscapes',
      source_type: 'stream',
      source_url: 'https://actions.google.com/sounds/v1/weather/gentle_rain.ogg',
      duration: 180,
      thumbnail_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200&q=80',
      is_published: 1,
      created_by: 'admin'
    }
  ];

  for (const track of defaultTracks) {
    const existing = await dbGet('SELECT id FROM music_tracks WHERE id = ?', [track.id]);
    if (!existing) {
      await dbRun(
        `INSERT INTO music_tracks (id, title, artist, source_type, source_url, duration, thumbnail_url, is_published, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [track.id, track.title, track.artist, track.source_type, track.source_url, track.duration, track.thumbnail_url, track.is_published, track.created_by]
      );
    }
  }

  // Create default student playlist
  const studentUser = await dbGet('SELECT id FROM users WHERE email = ?', ['student@ojt.edu']);
  const targetStudentId = studentUser ? studentUser.id : 'student';
  const existingPlaylist = await dbGet('SELECT id FROM user_playlists WHERE user_id = ? AND name = ?', [targetStudentId, 'Deep Focus Coding']);
  if (!existingPlaylist) {
    const plId = 'playlist-focus-demo';
    await dbRun(
      'INSERT INTO user_playlists (id, user_id, name, description) VALUES (?, ?, ?, ?)',
      [plId, targetStudentId, 'Deep Focus Coding', 'Curated chill beats and ambient tunes for deep coding sessions']
    );
    await dbRun('INSERT INTO playlist_tracks (id, playlist_id, track_id) VALUES (?, ?, ?)', ['pt-1', plId, 'track-lofi-1']);
    await dbRun('INSERT INTO playlist_tracks (id, playlist_id, track_id) VALUES (?, ?, ?)', ['pt-2', plId, 'track-stream-3']);
  }

  console.log('Database successfully seeded with admin, practice problems, focus music, and sample programs.');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
