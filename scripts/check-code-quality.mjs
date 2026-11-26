/**
 * Automated Structural Code Quality & Security Hygiene Gate for VayuSenseX
 * Enforces <= 250 lines per source file, zero `any` escape hatches, and zero blocking browser dialogs.
 */

import fs from 'fs';
import path from 'path';

const MAX_LINES = 250;
const TARGET_ROOTS = ['src', 'server'];
const EXTRA_FILES = ['server.ts'];

const FORBIDDEN_PATTERNS = [
  { regex: /:\s*any\b|\bas\s+any\b|\bz\.any\(/, label: 'explicit `any` type or `z.any()` schema' },
  { regex: /\bwindow\.(alert|confirm)\(|\b(?<![.\w])(alert|confirm)\(/, label: 'blocking browser alert()/confirm() dialog' },
];

function collectFiles(dirPath, out = []) {
  if (!fs.existsSync(dirPath)) return out;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

const rootDir = process.cwd();
const files = [...EXTRA_FILES.map((f) => path.join(rootDir, f)).filter((f) => fs.existsSync(f))];
for (const root of TARGET_ROOTS) {
  collectFiles(path.join(rootDir, root), files);
}

const violations = [];
for (const filePath of files) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lineCount = content.split(/\r?\n/).length;

  if (lineCount > MAX_LINES) {
    violations.push(`${relPath}: ${lineCount} lines exceeds max ${MAX_LINES} lines`);
  }

  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.regex.test(content)) {
      violations.push(`${relPath}: contains ${rule.label}`);
    }
  }
}

console.log('--------------------------------------------------');
console.log(`[VayuSenseX] Structural Code Quality Audit (${files.length} files)`);
console.log('--------------------------------------------------');

if (violations.length > 0) {
  for (const v of violations) console.error(`FAIL: ${v}`);
  process.exit(1);
}

console.log(`PASSED: All ${files.length} source files are <= ${MAX_LINES} lines with 0 any casts and 0 blocking dialogs.`);
