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
  //   "./cjs": "./src/cjs/index.cjs",
  //   "./cloudFunctions": "./src/cloudFunctions/fns.js",
  //   "./firestore": "./src/firestore/index.js",
  //   "./firestoreReadOnly": "./src/firestoreReadOnly/index.js",
  //   "./jest": "./src/jest/eventually.js"
  // }

const tmp = Object.entries(exps).map( ([k,v]) => {
  return [
    k.replace(/^\./, pkgName),
    v.replace(/^\.\//, '../../')
  ];
});

const lookup = new Map(tmp);
  // e.g. 'firebase-jest-testing/cloudFunctions' -> '../../src/cloudFunctions/fns.js'

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
