/*
* sample/hack-jest/self-resolver.cjs
*
* To be used until referencing with ES native modules works, within Jest.
*
* Note: This is for the 'firebase-jest-testing' library sample. You'll need to use the 'jestResolver' provided as
*     part of the package, in your project.
*
* References:
*   - Configuring Jest > resolver (Jest docs)
*     -> https://jestjs.io/docs/en/configuration#resolver-string [1]
*/
const PATH = "../../package";

const pkg = require(`${PATH}/package.json`);    // path to 'firebase-jest-testing's 'package.json' (EDIT THIS)
const pkgName = pkg.name;   // "firebase-jest-testing"

function fail(msg) { throw new Error(msg); }

if (pkgName !== 'firebase-jest-testing') {
  fail(`Resolver needs tuning. Instead of 'firebase-jest-testing', reached: ${pkgName}`);
}

const exps = pkg.exports;
  //
  // {
  //   "./cjs": "./src/cjs/index.cjs",    # This doesn't really matter; CJS does not use 'exports'
  //   "./firestoreAdmin": "./src/firestoreAdmin/index.js",
  //   "./firestoreRules": "./src/firestoreRules/index.js",
  //   "./firestoreRules/setup": "./src/firestoreRules/setup/index.js",
  //   "./jest": "./src/jest/eventually.js"
  // }

const tmp = Object.entries(exps).map( ([k,v]) => {
  return [
    k.replace(/^\./, pkgName),
    v.replace(/^\.\//, `${PATH}/`)
  ];
});

const lookup = new Map(tmp);
  // e.g. 'firebase-jest-testing/firestoreAdmin' -> '../../src/firestoreAdmin/index.js'

const res = ( request, options ) => {   // (string, { ..see above.. }) => ...

  if (request.startsWith(pkgName)) {    // "firebase-jest-testing"
    const hit = lookup.get(request) || fail("No 'exports' lookup for: "+ request);

    return options.defaultResolver( hit, options );   // turned to requiring the file
  } else {
    return options.defaultResolver( request, options );
  }
};

module.exports = res;
