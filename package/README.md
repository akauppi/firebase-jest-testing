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

- 🪶Light. Uses Firestore *REST API* so *no Firebase client JS SDK* is required. Add only `firebase-admin` and it's ready to be served!

- ⚡️Fast. Optimized for multithreading and Node.js. You'll likely max out your cores.

- ‖‖‖ Security Rules are tested **immutably** - a passing write or delete operation does not change the data, and cannot disturb other tests. This is why we can parallelize the tests so much. No flaky tests.

- ⏲For testing Cloud Functions at the integration level, `.eventually` extension is added to the Jest arsenal.

- ﹛﹜Help functions for priming Firestore with *JSON data*.

- `+` Means for testing callables.

Only to be used with Jest 27.


## Requires

- Jest 27

   The module is built with ES modules in mind. Transitioning your project to Jest 27 is likely more meaningful than forking and backporting this code to Jest 26 and CommonJS.

## Using in your project

In your application project:

```
$ npm install --save-dev firebase-jest-testing@beta
```

Add this to the `jest.config.js`:

```
// Without this, the modules are not correctly loaded, due to being declared using 'exports'.
//
resolver: "firebase-jest-testing/src/cjs/jestResolver.cjs"
```

>Note: This is needed because the Jest 27 resolver does not treat modules with `exports` appropriately. Eventually, this will become unnecessary.


## Sample project

See the [GitHub repo](https://github.com/akauppi/firebase-jest-testing) `package.json` and `sample` folder for practical examples.


## Reference documentation
 
The contents are described in [Writing tests](https://github.com/akauppi/firebase-jest-testing/blob/master/package/Writing%20tests.md) (GitHub `HEAD`):

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

## Troubleshooting

Launching Jest 27 needs certain Node flags. See [ECMAScript Modules](https://jestjs.io/docs/next/ecmascript-modules) (Jest docs).

In `package.json`:

```
"test:rules:invites": "NODE_OPTIONS=--experimental-vm-modules jest --config sample/test-rules/jest.config.js -f invitesC.test.js --verbose --detectOpenHandles --all",
```

Does your testing project have `type: "module"`? 

- This tool hasn't been tested in a Common-JS / mixed ESM + Common-JS project. Let the author know if it works for you.


## Support

If you wish to support the development of this software, be in touch with the author. We'll figure out something nice! ;)
