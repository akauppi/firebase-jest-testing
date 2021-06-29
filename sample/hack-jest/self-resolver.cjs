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

const pkgExports = pkg.exports;
  //
  // {
  //   "./firestoreAdmin": "./src/firestoreAdmin/index.js",
  //   "./firestoreAdmin/setup": "./src/firestoreAdmin/setup/index.js",
  //   "./firestoreRules": "./src/firestoreRules/index.js",
  //   "./firestoreClientLike": "./src/firestoreClientLike/index.js",
  // }

const pkgEntries = Object.entries(pkgExports).map( ([k,v]) => {
  return [
    k.replace(/^\./, pkgName),
    v.replace(/^\.\//, `${PATH}/`)
  ];
});
  // [['firebase-jest-testing/firestoreAdmin', '../../src/firestoreAdmin/index.js'], ...]

//--- Similar for 'firebase-admin' (new version)
//
// This is needed to support 'firebase-admin' alpha, within Jest, since it depends on 'exports'.
//
// Note: It's really CHEAP that we don't use the 'exports' in the package itself, but this works, and eventually
//    Jest will support 'exports' for real. Also, we've narrowed down to only those entries that we need.
//
const moreEntries = Object.entries({
  "firebase-admin/app": "./lib/app/index.js",
  //"firebase-admin/auth": "./lib/auth/index.js",
  //"firebase-admin/firestore": "./lib/firestore/index.js"
}).map( ([k,v]) => {
  const arr = k.match(/(.+?)\//);   // pick the node_modules name
  const name = arr[1] || fail("No '/' in key");
  return [
    k,
    v.replace(/^\.\//, `${name}/`)
  ]
});

const lookup = new Map([ ...pkgEntries, ...moreEntries ]);

const res = ( request, options ) => {   // (string, { ..see above.. }) => ...

  //if (request.startsWith('firebase-admin')) console.log("!!! Requesting:", request, lookup.get(request));

  const hit = lookup.get(request);
  if (hit) {
    return options.defaultResolver( hit, options );   // turned to requiring the file
  } else {
    return options.defaultResolver( request, options );
  }
};

module.exports = res;
