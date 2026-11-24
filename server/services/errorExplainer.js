/**
 * Beginner-Friendly Error Explainer
 * Parses compiler/interpreter outputs and produces pedagogical tips for OJT students.
 */

function explainError(language, stderr, stdout = '') {
  if (!stderr && !stdout) return null;
  const combined = (stderr + '\n' + stdout).trim();

  // Python Errors
  if (language === 'python') {
    if (combined.includes('IndentationError')) {
      return {
        type: 'Indentation Error',
        title: 'Python Indentation Mismatch',
        hint: 'Python relies on consistent indentation (spaces or tabs) to define blocks of code (like inside `if`, `for`, `def`). Make sure all lines inside the same block have the exact same number of leading spaces (usually 4 spaces).',
        action: 'Check the line mentioned in the error traceback and align it with the previous line.'
      };
    }
    if (combined.includes('ZeroDivisionError')) {
      return {
        type: 'Division by Zero',
        title: 'Math Error: Cannot Divide by Zero',
        hint: 'You are attempting to divide a number by 0 (e.g. `x / 0` or `x % 0`). Mathematically, division by zero is undefined.',
        action: 'Check the divisor variable and ensure it is not zero before dividing (e.g. `if divisor != 0:`).'
      };
    }
    if (combined.includes('IndexError')) {
      return {
        type: 'Index Out of Range',
        title: 'List Index Error',
        hint: 'You are trying to access an element at an index that does not exist in the list. Remember that Python list indices start at 0 and end at `len(list) - 1`.',
        action: 'Verify that the index you are passing is strictly less than the length of the list.'
      };
    }
    if (combined.includes('KeyError')) {
      return {
        type: 'Dictionary Key Error',
        title: 'Key Not Found in Dictionary',
        hint: 'You attempted to access a dictionary key that does not exist.',
        action: 'Check dictionary keys using `key in dict` or use `dict.get(key, default_value)` instead of direct subscripting.'
      };
    }
    if (combined.includes('NameError')) {
      return {
        type: 'Variable Not Defined',
        title: 'Name Error',
        hint: 'Python encountered a variable or function name that has not been defined yet or was misspelled.',
        action: 'Check spelling and make sure variables are assigned before they are referenced.'
      };
    }
    if (combined.includes('TypeError')) {
      return {
        type: 'Type Error',
        title: 'Unsupported Type Operation',
        hint: 'An operation or function was applied to an incompatible data type (e.g., adding an integer to a string, or indexing a non-iterable).',
        action: 'Inspect variable types or convert types using `str()`, `int()`, or `float()`.'
      };
    }
    if (combined.includes('SyntaxError')) {
      return {
        type: 'Syntax Error',
        title: 'Invalid Python Syntax',
        hint: 'Python could not parse your code. Common causes include a missing colon `:` after `if`, `else`, `for`, `while`, `def`, or unmatched parentheses/brackets.',
        action: 'Look closely at the line indicated with the caret `^` and verify colons and brackets.'
      };
    }
  }

  // Java Errors
  if (language === 'java') {
    if (combined.includes('NullPointerException') || combined.includes('Cannot invoke') || combined.includes('is null')) {
      return {
        type: 'Null Pointer Exception',
        title: 'Accessing Uninitialized Object',
        hint: 'You are attempting to access a method or field of an object reference that is currently `null` (not instantiated).',
        action: 'Initialize your object with `new ...` or add a `if (obj != null)` check before invoking methods.'
      };
    }
    if (combined.includes('ArrayIndexOutOfBoundsException')) {
      return {
        type: 'Array Index Out of Bounds',
        title: 'Array Index Does Not Exist',
        hint: 'Java arrays are 0-indexed. An array of size N has valid indices from `0` to `N-1`. Accessing `array[N]` causes this error.',
        action: 'Ensure your loop condition uses `< array.length` instead of `<= array.length`.'
      };
    }
    if (combined.includes('cannot find symbol')) {
      return {
        type: 'Compilation Error: Symbol Not Found',
        title: 'Unrecognized Variable or Method',
        hint: 'The Java compiler does not recognize the variable, class, or method name. This is usually due to a typo, missing import, or undeclared variable.',
        action: 'Check spelling, ensure the variable is declared with its type (e.g. `int x`), and make sure required packages are imported.'
      };
    }
    if (combined.includes('class Main') && combined.includes('should be declared in a file named')) {
      return {
        type: 'Class Name Mismatch',
        title: 'Main Class Declaration',
        hint: 'In online playgrounds, the primary class should usually be named `Main` (e.g. `public class Main { public static void main(String[] args) { ... } }`).',
        action: 'Ensure your top-level class is `public class Main`.'
      };
    }
    if (combined.includes('NoSuchElementException')) {
      return {
        type: 'Scanner Input Missing',
        title: 'Input (stdin) Stream Ended Early',
        hint: 'Your program called `sc.nextInt()` or `sc.nextLine()`, but there was no more input provided in the Input tab.',
        action: 'Click the "Input" tab below the editor and supply the numbers or strings your program expects before running.'
      };
    }
  }

  // C++ Errors
  if (language === 'cpp' || language === 'c++') {
    if (combined.includes('segmentation fault') || combined.includes('SIGSEGV') || combined.includes('139')) {
      return {
        type: 'Segmentation Fault (Memory Error)',
        title: 'Illegal Memory Access',
        hint: 'Your C++ program attempted to access memory that it does not own. This typically happens when indexing an array out of bounds, dereferencing a null/dangling pointer, or exceeding stack memory (infinite recursion).',
        action: 'Inspect array/vector indices and base cases in recursive functions.'
      };
    }
    if (combined.includes('expected \';\'')) {
      return {
        type: 'Missing Semicolon',
        title: 'Syntax Error: Semicolon Expected',
        hint: 'Every statement in C++ must end with a semicolon `;`.',
        action: 'Check the line right before the reported error line for a missing `;`.'
      };
    }
    if (combined.includes('use of undeclared identifier')) {
      return {
        type: 'Undeclared Identifier',
        title: 'Variable or Function Unknown',
        hint: 'You are using a variable or function that has not been defined yet in the current scope.',
        action: 'Declare the variable (e.g., `int x;`) before using it, or verify `#include <...>` headers.'
      };
    }
  }

  // JavaScript / Node.js Errors
  if (language === 'javascript') {
    if (combined.includes('TypeError: Cannot read properties of undefined') || combined.includes('Cannot read property')) {
      return {
        type: 'Undefined Property Access',
        title: 'Reading Property of Undefined / Null',
        hint: 'You are trying to access a property or method on a variable that is currently `undefined` or `null`.',
        action: 'Use optional chaining `obj?.property` or verify the variable is initialized before accessing its properties.'
      };
    }
    if (combined.includes('ReferenceError')) {
      return {
        type: 'Reference Error',
        title: 'Variable Is Not Defined',
        hint: 'You referred to a variable name that does not exist in the current scope.',
        action: 'Define the variable with `let`, `const`, or `var` before using it.'
      };
    }
  }

  // SQL Errors
  if (language === 'sql') {
    if (combined.includes('no such table')) {
      return {
        type: 'Table Not Found',
        title: 'Unrecognized Table Name',
        hint: 'The table referenced in your SQL query does not exist in the current database.',
        action: 'Check table name spelling or check the sample schema (e.g. `Students`, `Departments`, `Courses`, `Enrollments`).'
      };
    }
    if (combined.includes('no such column')) {
      return {
        type: 'Column Not Found',
        title: 'Unrecognized Column Name',
        hint: 'The column you are selecting or filtering does not exist in the referenced table.',
        action: 'Verify column names against the table definition.'
      };
    }
    if (combined.includes('near "') && combined.includes('syntax error')) {
      return {
        type: 'SQL Syntax Error',
        title: 'Malformed SQL Query',
        hint: 'There is a syntax error near the keyword shown in the error message.',
        action: 'Verify your SQL syntax order: SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY -> LIMIT.'
      };
    }
  }

  // Timeout Errors
  if (combined.includes('timed out') || combined.includes('SIGTERM') || combined.includes('TIME_LIMIT_EXCEEDED')) {
    return {
      type: 'Execution Timeout',
      title: 'Time Limit Exceeded (Possible Infinite Loop)',
      hint: 'Your program ran longer than the execution limit (typically 5-8 seconds). This is usually caused by an infinite loop (`while(true)` without a break, or loop counter that is never updated) or waiting for input that was not provided.',
      action: 'Check loop update conditions (e.g. `i++` or `count += 1`) and ensure input is supplied in the Input tab if needed.'
    };
  }

  return null;
}

module.exports = {
  explainError
};
