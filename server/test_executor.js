const { executeCode } = require('./services/executor');

async function testAll() {
  console.log('Testing code executions...');

  // 1. Python
  console.log('\n--- 1. Testing Python ---');
  const pyRes = await executeCode({
    language: 'python',
    code: 'print("Python execution SUCCESS! 10 + 20 =", 10 + 20)'
  });
  console.log('Python Result:', pyRes.status, pyRes.stdout.trim());

  // 1b. Python with Stdin
  console.log('\n--- 1b. Testing Python with Stdin ---');
  const pyStdinRes = await executeCode({
    language: 'python',
    code: 'name = input()\nprint(f"Hello, {name}!")',
    stdin: 'Alex\n'
  });
  console.log('Python Stdin Result:', pyStdinRes.status, pyStdinRes.stdout.trim());

  // 2. JavaScript
  console.log('\n--- 2. Testing JavaScript ---');
  const jsRes = await executeCode({
    language: 'javascript',
    code: 'const nums = [1, 2, 3, 4, 5]; console.log("JS Sum:", nums.reduce((a, b) => a + b, 0));'
  });
  console.log('JS Result:', jsRes.status, jsRes.stdout.trim());

  // 3. C++
  console.log('\n--- 3. Testing C++ ---');
  const cppRes = await executeCode({
    language: 'cpp',
    code: '#include <iostream>\nint main() { std::cout << "C++ 17 compiled and executed successfully!" << std::endl; return 0; }'
  });
  console.log('C++ Result:', cppRes.status, cppRes.stdout.trim());

  // 4. Java
  console.log('\n--- 4. Testing Java ---');
  const javaRes = await executeCode({
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Java 25 LTS execution successful!");
    }
}`
  });
  console.log('Java Result:', javaRes.status, javaRes.stdout.trim(), javaRes.stderr || '');

  // 4b. Java with Stdin
  console.log('\n--- 4b. Testing Java with Stdin ---');
  const javaStdinRes = await executeCode({
    language: 'java',
    code: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println("Sum from Java Scanner: " + (a + b));
    }
}`,
    stdin: '40 60\n'
  });
  console.log('Java Stdin Result:', javaStdinRes.status, javaStdinRes.stdout.trim(), javaStdinRes.stderr || '');

  // 5. SQL
  console.log('\n--- 5. Testing SQL ---');
  const sqlRes = await executeCode({
    language: 'sql',
    code: 'SELECT name, cgpa FROM students WHERE cgpa > 9.0;'
  });
  console.log('SQL Result:\n' + sqlRes.stdout.trim());

  // 6. Timeout handling test
  console.log('\n--- 6. Testing Infinite Loop Timeout ---');
  const timeoutRes = await executeCode({
    language: 'python',
    code: 'while True: pass',
    timeout: 2000
  });
  console.log('Timeout Result Status:', timeoutRes.status, timeoutRes.explanation ? timeoutRes.explanation.title : '');

  console.log('\nAll tests complete!');
}

testAll().catch(console.error);
