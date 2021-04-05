// sample/test-rules/jest.config.js

import opts from '../jest.config.default.js'

export default { ...opts,
  // Load docs, once at the beginning of the tests.
  globalSetup: "./setup.jest.cjs"
}
