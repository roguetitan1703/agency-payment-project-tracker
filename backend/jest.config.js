/**
 * Jest configuration to ensure tests run from `src/tests` only
 * This avoids accidentally running compiled tests under `dist/tests`.
 */
module.exports = {
  testMatch: ["<rootDir>/src/tests/**/*.test.(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testEnvironment: "node",
  verbose: true,
};
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  verbose: true,
};
