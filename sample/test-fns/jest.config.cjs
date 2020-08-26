// jest.config.cjs

module.exports = {
  // Recommended for native ES6 use (Aug-20):
  testEnvironment: 'jest-environment-node',
  transform: {},

  // Default is 5000. None of our tests take that long; fail fast.
  testTimeout: 4000,    // 2000 was too little for one test in CI (3300 ms)

  // Without this, wasn't able to get self-pointing 'exports' to work.
  resolver: "../hack-jest/custom-resolver.cjs"

  //resolver: "firebase-jest-testing/src/cjs/jestResolver.cjs"  <-- USE THIS IN YOUR APP
};
