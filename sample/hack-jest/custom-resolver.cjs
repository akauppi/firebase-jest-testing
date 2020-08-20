// THIS WOULD NEED TO BE DEFINED AS A MODULE (package). Thus not worth it... A function / source file would have been fine.

/*
* sample/hack-jest/custom-resolver.cjs
*
* To be used until:
*   a) self-referencing with ES native modules works
*   b) imports in application project with native ES modules work
*
* i.e. try to get rid of this; it's a hack.
*
* Usage:
*   <<
*     ...
*   <<
*
* Based on:
*   - "Add support for `packageFilter` for custom resolvers"
*     -> https://github.com/facebook/jest/pull/10393
*
* References:
*   - Configuring Jest > resolver (Jest docs)
*     -> https://jestjs.io/docs/en/configuration#resolver-string [1]
*/

/*
* options (according to docs [1]):
*   {
*     basedir: string
*     defaultResolver: (request, options) => ...
*     extensions: [string]
*     moduleDirectory: [string]
*     paths: [string],
*     packageFilter: (pkg, pkgdir) => ...
*     rootDir: [string]
*/

// Read the package.json. Prepare a mapping.

const pkg = require("../../package.json");
const pkgName = pkg.name;   // "firebase-jest-testing"

const exps = pkg.exports;
  //
  // {
  //    ".": "./src/index.js",
  //    "./firestoreTestingReadOnly": "./src/firestoreTesting/readOnly.js",
  //    "./jest": "./src/jest/index.js",
  //    "./jest/rulesMatchers": "./src/jest/rulesMatchers.js",
  //    "./prime": "./src/prime/index.js"
  // }

const tmp = Object.entries(exps).map( ([k,v]) => {
  return [
    k.replace(/^\./, 'firebase-jest-testing' ),
    v.replace(/^\.\//, '../../')
  ];
});

const lookup = new Map(tmp);
  // e.g. 'firebase-jest-testing' -> '../../src/index.js'

/*lookup.forEach((v,k) => {   // DEBUG
  console.debug("MAPPED:", k+" -> "+v);
});*/

const res = ( request, options ) => {   // (string, { ..see above.. }) => ...

  if (request.startsWith(pkgName)) {    // "firebase-jest-testing"
    const hit = lookup.get(request);
    console.debug("Transfer:", request+" -> "+hit);

    if (!hit) throw new Error("No 'exports' lookup for: "+ request);    // better than assert (causes the right module to be mentioned in the error message)

    return options.defaultResolver( hit, options );   // turned to requiring the file
  } else {
    return options.defaultResolver( request, options );
  }
};

module.exports = res;
