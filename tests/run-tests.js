import { getTestResults, resetTestResults } from "./test-runner.js";
import { runCalculatorTests } from "./calculator.test.js";
import { runStateTests } from "./state.test.js";

console.log("=== Running EcoSphere Unit Tests ===");
resetTestResults();

// Run all test registrations
runCalculatorTests();
runStateTests();

const results = getTestResults();

console.log("\nResults by Suite:");
for (const [suiteName, tests] of Object.entries(results.suites)) {
  console.log(`\nSuite: ${suiteName}`);
  tests.forEach(t => {
    const icon = t.status === "PASS" ? "✅" : "❌";
    console.log(`  ${icon} ${t.name}`);
    if (t.error) {
      console.log(`     Error: ${t.error}`);
    }
  });
}

console.log("\n==========================================");
console.log(`Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed} | Assertions: ${results.assertions}`);
console.log("==========================================");

if (results.failed > 0) {
  process.exit(1);
} else {
  console.log("All tests passed successfully! 🎉");
  process.exit(0);
}
