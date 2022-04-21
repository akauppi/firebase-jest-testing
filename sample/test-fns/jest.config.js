// sample/test-fns/jest.config.js

import opts from '../jest.config.default.js'

export default { ...opts,
  globalSetup: "./setup.jest.js",

  // NOTE: Since "something" (could be Firebase Tools 10.6.0, could be Docker Desktop 4.7.1), warm-up no longer
  //    works in keeping the _function_ tests running under 2s. This is unfortunate. Higher timeouts so that people
  //    wouldn't suffer from flaky 'npm test' experience.
  //
  //testTimeout: Math.max( opts.testTimeout, 6000 )
}
