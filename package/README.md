# firebase-jest-testing

<!--
This README is visible on the npm package page: https://www.npmjs.com/package/firebase-jest-testing
-->

Tools for testing Firebase *backend* features, using Jest.

- Writing Security Rules tests *immutably* (so that a passing write or delete operation does not change one's primed data) - less surprises!
- Emulator detection. The library *automatically picks up the configuration* when running the tests - less boilerplate!
- Testing *indirect (cloud based) Firestore changes*, by adding `.eventually` (and hopefully, one day, `.never`) to the Jest arsenal.
- *Priming* Firestore with JSON data.

Cloud Function callables can also be tested, but you need to provide a Firebase JS client SDK for that, and copy-paste some boilerplate. This is due to the ongoing transition between client API's.

>Note: Though Jest is in the name, you *can* use some parts in any testing framework, but you'd have to dig the necessary bits out and apply to your project. The distribution expects one to use Jest.

## Requires

- Jest 27 - [milestone](https://github.com/facebook/jest/milestone/12)

The module is built with ES modules in mind. Using with earlier Jest and CommonJS configuration etc. *may* be likely, but you'd need to fork and modify the sources!!

<!--
## Projects using the library

- [GroundLevel Firebase ES](https://github.com/akauppi/GroundLevel-firebase-es) - a Vue.js 3 application template / collaborative graphical tool

*If you find the tool useful, please consider adding a link to your project (as a PR).*
-->

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

>Note: This is needed because (as of 27.0.0-next.6), Jest resolver does not treat modules with `exports` appropriately. This is likely going to be fixed before Jest 27 is out.


## Writing tests

We might bring API Reference here, later. For now, please check out:

- [Sample](https://github.com/akauppi/firebase-jest-testing/tree/master/sample) project
- [Writing Tests](https://github.com/akauppi/firebase-jest-testing/blob/master/Writing%20tests.md) - documentation


## Support

If you wish to support the development of this software, be in touch with the author. We'll figure out something nice! ;)

