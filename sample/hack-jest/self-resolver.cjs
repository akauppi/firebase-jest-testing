/*
* sample/hack-jest/self-resolver.cjs
*
* To be used until referencing with ES native modules works, within Jest.
*
* Note: This is for the 'firebase-jest-testing' library sample. You'll need a similar approach for your app (see
*     documentation -> 'Writing tests.md').
*
* References:
*   - Configuring Jest > resolver (Jest docs)
*     -> https://jestjs.io/docs/en/configuration#resolver-string [1]
*/
const PATH = "../../package";

const pkg = require(`${PATH}/package.json`);    // path to 'firebase-jest-testing's 'package.json' (EDIT THIS)
const pkgName = pkg.name;   // "firebase-jest-testing"

if (pkgName !== 'firebase-jest-testing') {
  throw new Error(`Resolver needs tuning. Instead of 'firebase-jest-testing', reached: ${pkgName}`);
}

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
    v.replace(/^\.\//, `${PATH}/`)
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
