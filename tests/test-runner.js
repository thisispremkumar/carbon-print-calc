// Custom Lightweight Test Framework for EcoSphere
// Runs in both browser (window context) and Node.js environment

let currentSuite = "EcoSphere Unit Tests";
const results = {
  passed: 0,
  failed: 0,
  assertions: 0,
  suites: {}
};

export function describe(suiteName, fn) {
  currentSuite = suiteName;
  if (!results.suites[suiteName]) {
    results.suites[suiteName] = [];
  }
  fn();
}

export function test(testName, fn) {
  try {
    fn();
    results.passed++;
    results.suites[currentSuite].push({
      name: testName,
      status: "PASS",
      error: null
    });
  } catch (error) {
    results.failed++;
    results.suites[currentSuite].push({
      name: testName,
      status: "FAIL",
      error: error.message || error.stack || String(error)
    });
  }
}

export function assert(condition, message = "Assertion failed") {
  results.assertions++;
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEquals(actual, expected, message = "") {
  results.assertions++;
  if (actual !== expected) {
    throw new Error(
      `${message ? message + " -> " : ""}Expected: ${expected} (${typeof expected}), Got: ${actual} (${typeof actual})`
    );
  }
}

export function assertDeepEquals(actual, expected, message = "") {
  results.assertions++;
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(
      `${message ? message + " -> " : ""}Expected: ${expectedStr}, Got: ${actualStr}`
    );
  }
}

export function assertCloseTo(actual, expected, precision = 2, message = "") {
  results.assertions++;
  const tolerance = Math.pow(10, -precision) / 2;
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${message ? message + " -> " : ""}Expected roughly: ${expected}, Got: ${actual} (outside tolerance ${tolerance})`
    );
  }
}

export function getTestResults() {
  return {
    ...results,
    total: results.passed + results.failed
  };
}

export function resetTestResults() {
  results.passed = 0;
  results.failed = 0;
  results.assertions = 0;
  results.suites = {};
}
