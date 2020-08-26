/*
* src/cjs/jestResolver.cjs
*
* To be used by application projects, to resolve 'firebase-jest-testing' within Jest.
*
* The problem is that Jest 26.x resolver (aka browserify resolver) does not treat a module with 'exports'
* field correctly. Once it does, we abandon this.
*
* Usage:
*   # 'jest.config.cjs':
*   <<
*     module.exports = {
*       resolver: "firebase-jest-testing/hackResolver"
*       ...
*     }
*   <<
*
* References:
*   - Configuring Jest > resolver (Jest docs)
*     -> https://jestjs.io/docs/en/configuration#resolver-string
*/
const assert = require('assert').strict;

//const fjtPkg = require("firebase-jest-testing/package.json");
const fjtPkg = require("../../package.json");
const pkgName = fjtPkg.name;   // "firebase-jest-testing"

assert(pkgName === 'firebase-jest-testing');

const exps = fjtPkg.exports;

const tmp = Object.entries(exps).map( ([k,v]) => {
  return [
    k.replace(/^\./, 'firebase-jest-testing' ),
    v.replace(/^\.\//, `${pkgName}/`)
  ];
});

const lookup = new Map(tmp);
  // e.g. 'firebase-jest-testing' -> 'firebase-jest-testing/src/index.js'

/*lookup.forEach((v,k) => {   // DEBUG
  console.debug("MAPPED:", k+" -> "+v);
});*/

const res = ( request, options ) => {   // (string, { ..see above.. }) => ...

  if (request.startsWith(pkgName)) {    // "firebase-jest-testing"
    const hit = lookup.get(request);
    //console.debug("Transfer:", request+" -> "+hit);

    if (!hit) throw new Error("No 'exports' lookup for: "+ request);    // better than assert (causes the right module to be mentioned in the error message)

    return options.defaultResolver( hit, options );   // turned to requiring the file
  } else {
    return options.defaultResolver( request, options );
  }
};

module.exports = res;
