// sample/jest.config.default.js
//
// Common values to 'test-fns' and 'test-rules'

/*
* Allow sluggishness of Firebase Emulators on a warm-up run.
*/
const warmUpTimeoutMs = parseInt( process.env["WARM_UP_TIMEOUT"] ) || null;

export default {
  // Recommended for native ES6 use (Aug-20):
  transform: {},

  // Default is 5000. None of our tests take that long; fail fast.
  //
  testTimeout: warmUpTimeoutMs || 2000,

  // Resolves the subpackage paths using the package's 'exports' (until Jest does...).
  //resolver: "../hack-jest/self-resolver.cjs"
}
