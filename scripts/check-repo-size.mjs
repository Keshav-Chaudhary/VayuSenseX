/**
 * Repository Size Audit Script for VayuSenseX
 * Enforces the strict < 10 MB competition rule for Challenge 6.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function getDirectorySize(dirPath) {
  let totalSize = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
      continue;
    }

    if (entry.isDirectory()) {
      totalSize += getDirectorySize(fullPath);
    } else if (entry.isFile()) {
      totalSize += fs.statSync(fullPath).size;
    }
  }

  return totalSize;
}

const rootDir = process.cwd();
const totalSizeBytes = getDirectorySize(rootDir);
const totalSizeMB = totalSizeBytes / (1024 * 1024);

console.log('--------------------------------------------------');
console.log(`[VayuSenseX] Repository Tracked Source Size Audit`);
console.log(`Tracked Size: ${totalSizeMB.toFixed(3)} MB / 10.000 MB Limit`);
console.log('--------------------------------------------------');

if (totalSizeMB >= 10.0) {
  console.error(`❌ CRITICAL: Repository size (${totalSizeMB.toFixed(2)} MB) exceeds 10 MB limit!`);
  process.exit(1);
} else {
  console.log(`✅ PASSED: Repository size is safely within the competition limit (${(10 - totalSizeMB).toFixed(2)} MB buffer remaining).`);
}
