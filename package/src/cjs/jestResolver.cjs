/*
* src/cjs/jestResolver.cjs
*
* To be used by application projects, to resolve 'firebase-jest-testing' and 'firebase-admin/...', within Jest.
*
* The problem is that Jest 27 resolver (aka browserify resolver) does not treat a module with 'exports'
* field correctly. Once it does, we abandon this.
*
* Usage:
*   # 'jest.config.js':
*   <<
*     export default {
*       ...,
*       resolver: "firebase-jest-testing/src/cjs/jestResolver.cjs"
*     }
*   <<
*
* References:
*   - Configuring Jest > resolver (Jest docs)
*     -> https://jestjs.io/docs/en/configuration#resolver-string
*/
const assert = require('assert').strict;

const fjtPkg = require("../../package.json");
const pkgName = fjtPkg.name;   // "firebase-jest-testing"

assert( pkgName == 'firebase-jest-testing' );

function fail(msg) { throw new Error(msg); }

const exps = fjtPkg.exports;

const tmp = Object.entries(exps).map( ([k,v]) => {
  return [
    k.replace(/^\./, pkgName ),
    v.replace(/^\.\//, `${pkgName}/`)
  ];
});
  // [['firebase-jest-testing/firestoreAdmin', 'firebase-jest-testing/src/firestoreAdmin/index.js'], ...]

// Support for 'firebase-admin' (alpha)
//
const moreEntries = Object.entries({
  "firebase-admin/app": "./lib/esm/app/index.js",
  //"firebase-admin/auth": "./lib/esm/auth/index.js",
  //"firebase-admin/firestore": "./lib/esm/firestore/index.js"
}).map( ([k,v]) => {
  const arr = k.match(/(.+?)\//);   // pick the node_modules name
  const name = arr[1] || fail("No '/' in key");
  return [
    k,
    v.replace(/^\.\//, `${name}/`)
  ]
});

const lookup = new Map([...tmp, ...moreEntries]);
  // e.g. 'firebase-jest-testing' -> 'firebase-jest-testing/src/index.js'

const res = ( request, options ) => {   // (string, { ..see above.. }) => ...

  const hit = lookup.get(request);
  if (hit) {
    return options.defaultResolver( hit, options );   // turned to requiring the file
  } else {
    return options.defaultResolver( request, options );
  }
};

module.exports = res;
