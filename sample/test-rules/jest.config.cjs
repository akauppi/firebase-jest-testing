// sample/test-rules/jest.config.cjs

module.exports = {
  // Recommended for native ES6 use (Aug-20):
  testEnvironment: 'jest-environment-node',
  transform: {},

  // Default is 5000. None of our tests take that long; fail fast.
  testTimeout: 2000,

  testRunner: "jest-circus/runner",   // for no reason

  // Without this, wasn't able to get 'exports' to work. See -> TRACK.md
  resolver: "../hack-jest/custom-resolver.cjs",

  // Load docs, once at the beginning of the tests.
  globalSetup: "./setup.jest.cjs"
};
