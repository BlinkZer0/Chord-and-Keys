#!/usr/bin/env node

/**
 * Test Runner for Chord and Keys Application
 * 
 * This script runs all unit tests and provides a summary of results.
 * For visualization tests, it provides instructions on how to run them manually.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'bright');
  log(message, 'bright');
  log('='.repeat(60), 'bright');
}

function logSection(message) {
  log('\n' + '-'.repeat(40), 'cyan');
  log(message, 'cyan');
  log('-'.repeat(40), 'cyan');
}

async function runUnitTests() {
  logHeader('RUNNING UNIT TESTS');
  
  const unitTestDir = path.join(__dirname, 'unit');
  const testFiles = fs.readdirSync(unitTestDir).filter(file => file.endsWith('.test.js'));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testFile of testFiles) {
    logSection(`Running ${testFile}`);
    
    try {
      // Import the test file using dynamic import
      const testPath = path.join(unitTestDir, testFile);
      const testUrl = `file://${testPath.replace(/\\/g, '/')}`;
      
      // Run the test file
      await import(testUrl);
      
      log(`✅ ${testFile} completed successfully`, 'green');
      passedTests++;
    } catch (error) {
      log(`❌ ${testFile} failed: ${error.message}`, 'red');
      console.error(error.stack);
      failedTests++;
    }
    
    totalTests++;
  }
  
  return { totalTests, passedTests, failedTests };
}

function listVisualizationTests() {
  logHeader('VISUALIZATION TESTS');
  
  const vizTestDir = path.join(__dirname, 'visualization');
  const testFiles = fs.readdirSync(vizTestDir).filter(file => file.endsWith('.html'));
  
  log('The following visualization tests are available:', 'yellow');
  log('(Open these files in your browser to run them manually)', 'yellow');
  
  for (const testFile of testFiles) {
    const fullPath = path.join(vizTestDir, testFile);
    log(`  📄 ${testFile}`, 'blue');
    log(`     Path: ${fullPath}`, 'reset');
  }
  
  log('\nTo run visualization tests:', 'yellow');
  log('1. Open each HTML file in your web browser', 'reset');
  log('2. Check the console for test results', 'reset');
  log('3. Verify visual elements are rendering correctly', 'reset');
}

function showTestSummary(unitResults) {
  logHeader('TEST SUMMARY');
  
  log('Unit Tests:', 'bright');
  log(`  Total: ${unitResults.totalTests}`, 'reset');
  log(`  Passed: ${unitResults.passedTests}`, 'green');
  log(`  Failed: ${unitResults.failedTests}`, unitResults.failedTests > 0 ? 'red' : 'green');
  
  if (unitResults.failedTests === 0) {
    log('\n🎉 All unit tests passed!', 'green');
  } else {
    log('\n⚠️  Some unit tests failed. Check the output above for details.', 'red');
  }
  
  log('\nVisualization Tests:', 'bright');
  log('  Manual testing required - see instructions above', 'yellow');
}

function showHelp() {
  logHeader('TEST RUNNER HELP');
  
  log('Usage:', 'bright');
  log('  node tests/run-tests.js [options]', 'reset');
  
  log('\nOptions:', 'bright');
  log('  --help, -h     Show this help message', 'reset');
  log('  --unit-only    Run only unit tests', 'reset');
  log('  --list-viz     List visualization tests only', 'reset');
  
  log('\nExamples:', 'bright');
  log('  node tests/run-tests.js', 'reset');
  log('  node tests/run-tests.js --unit-only', 'reset');
  log('  node tests/run-tests.js --list-viz', 'reset');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--list-viz')) {
    listVisualizationTests();
    return;
  }
  
  if (args.includes('--unit-only')) {
    const unitResults = await runUnitTests();
    showTestSummary(unitResults);
    return;
  }
  
  // Run all tests by default
  const unitResults = await runUnitTests();
  listVisualizationTests();
  showTestSummary(unitResults);
  
  // Exit with appropriate code
  process.exit(unitResults.failedTests > 0 ? 1 : 0);
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export {
  runUnitTests,
  listVisualizationTests,
  showTestSummary
};
