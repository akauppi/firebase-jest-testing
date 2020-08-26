/*
* sample/hack-jest/custom-resolver.cjs
*
* To be used until self-referencing with ES native modules works, within Jest.
*
* Note: This is for the 'firebase-jest-testing' library only, for running its internal samples.
*     You'll need a similar approach for your app; see the documentation ('Writing tests').
*
* References:
*   - Configuring Jest > resolver (Jest docs)
*     -> https://jestjs.io/docs/en/configuration#resolver-string [1]
*/
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
    if (!hit) throw new Error("No 'exports' lookup for: "+ request);    // better than assert (causes the right module to be mentioned in the error message)

    return options.defaultResolver( hit, options );   // turned to requiring the file
  } else {
    return options.defaultResolver( request, options );
  }
};

module.exports = res;
