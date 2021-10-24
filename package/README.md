# firebase-jest-testing

<!--
This README is visible on the npm package page: https://www.npmjs.com/package/firebase-jest-testing
-->

[![install size](https://packagephobia.com/badge?p=firebase-jest-testing@beta)](https://packagephobia.com/result?p=firebase-jest-testing@beta)

Tools for testing Firebase backend features, using Jest.

<img alt="a can" src="https://github.com/akauppi/firebase-jest-testing/raw/0.0.3-beta.2/package/images/tin-can-beta.png" width="350" />

<!--
Can designed in Fusion 360, by A.Kauppi - https://a360.co/3fHTV9y
-->

Offers:

- 🥫Emulator detection. The library *automatically picks up the configuration* when running the tests. Less boilerplate!

- 🪶Light. Uses Firestore *REST API* so *no Firebase client JS SDK* is required.

- ⚡️Fast. Optimized for multithreading and Node.js. You'll likely max out your cores.

- ‖‖‖ Security Rules are tested **immutably** - a passing write or delete operation does not change the data, and cannot disturb other tests. This is why we can parallelize the tests so much. No flaky tests.

- ﹛﹜Help functions for priming Firestore with *JSON data*.

- `+` Means for testing callables <sub>(without a client SDK)</sub>.

Only to be used with Jest 27 and above.


## Requires

- Jest 27

   The module is built with ES modules in mind.

## Using in your project

In your application project:

```
$ npm install --save-dev firebase-jest-testing@beta
```

Add this to the `jest.config.js`:

```
// Needed until Jest supports ESM's with multiple entry points (Jest 28?).
//
resolver: "hack-jest/jestResolver.cjs"
```

Create the custom Jest resolver. 

<details><summary>Sample `jestResolver.cjs`</summary>
<pre>
/*
* hack-jest/jestResolver.cjs
*
* Note: It's really CHEAP that we don't use the 'exports' in the package itself, but this works, and eventually
*    Jest will support 'exports' for real. Also, we've narrowed down to only those entries that we need.
*
* References:
*   - Configuring Jest > resolver (Jest docs)
*     -> https://jestjs.io/docs/en/configuration#resolver-string [1]
*/

// Add mappings to any libraries you use which 'export' more than the default ('.') entry point (Jest 27 takes care of that).
//
const entries = Object.entries({
  // firebase-jest-testing
  "firebase-jest-testing/firestoreAdmin": "./src/firestoreAdmin/index.js",
  "firebase-jest-testing/firestoreAdmin/setup": "./src/firestoreAdmin/setup/index.js",
  "firebase-jest-testing/firestoreRules": "./src/firestoreRules/index.js",
  "firebase-jest-testing/firebaseClientLike": "./src/firebaseClientLike/index.js",

  // firebase-admin
  "firebase-admin/app": "./lib/esm/app/index.js",
  "firebase-admin/firestore": "./lib/esm/firestore/index.js"

}).map( ([k,v]) => {
  const arr = k.match(/(.+?)\//);   // pick the node_modules name
  const name = arr[1] || fail("No '/' in key");
  return [
    k,
    v.replace(/^\.\//, `${name}/`)
  ]
});

const lookup = new Map(entries);

const res = ( request, options ) => {   // (string, { ..see above.. }) => ...

  const hit = lookup.get(request);
  if (hit) {
    return options.defaultResolver( hit, options );
  } else {
    return options.defaultResolver( request, options );
  }
};

module.exports = res;
</pre>
</details>


### Using with Docker Compose

With Docker Compose, your emulators are likely running under another host than the one running the Jest tests.

Set the `EMUL_HOST` env.var. to indicate the host name.

```
services:
  emul:
    ...
  sample:
    ...
    environment: ['EMUL_HOST=emul']
```


## Sample project(s)

- [GroundLevel-firebase-es](http://github.com/akauppi/GroundLevel-firebase-es) `packages/backend` subpackage is customer #0.

>If you find the library useful, you may file a PR for adding a link to your project here. 😊


## Reference documentation
 
[Writing tests](https://github.com/akauppi/firebase-jest-testing/blob/master/package/Writing%20tests.md) walks you through the API.

- [Testing Security Rules](https://github.com/akauppi/firebase-jest-testing/blob/master/package/Writing%20tests.md#testing-security-rules)
- Testing Cloud Functions [events](https://github.com/akauppi/firebase-jest-testing/blob/master/package/Writing%20tests.md#testing-cloud-functions-events) and [callables](https://github.com/akauppi/firebase-jest-testing/blob/master/package/Writing%20tests.md#testing-cloud-functions-callables)
- [Priming with JSON data](https://github.com/akauppi/firebase-jest-testing/blob/master/package/Writing%20tests.md#priming-with-json-data)
- [Why immutability matters](https://github.com/akauppi/firebase-jest-testing/blob/master/package/Writing%20tests.md#why-immutability-matters-and-a-bit-about-implementation) ..and a bit about [implementation](https://github.com/akauppi/firebase-jest-testing/blob/master/package/Writing%20tests.md#implementation-details)

<!-- Editor's note:
Did not find a way to link from 'npmjs.org' `README` to the `Writing tests.md` within the same published package.

The only solutions are:
- linking to another page (maybe keep by versions)
- bring all that text here? (..which may be good? :) - then rename this "Writing tests" )
-->


## Support

If you wish to support the development of this software, be in touch with the author. We'll figure out something nice! ;)

