// sample/jest.config.default.cjs
//
// Common values to 'test-fns' and 'test-rules'

module.exports = {
  // Recommended for native ES6 use (Aug-20):
  testEnvironment: 'jest-environment-node',
  transform: {},

  testRunner: "jest-circus/runner",   // upcoming default for Jest (should be faster/better...)

  // Default is 5000. None of our tests take that long; fail fast.
  testTimeout: 2000,

  resolver: "../hack-jest/self-resolver.cjs"
};
