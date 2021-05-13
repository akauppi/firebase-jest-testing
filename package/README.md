# firebase-jest-testing

<!--
This README is visible on the npm package page: https://www.npmjs.com/package/firebase-jest-testing
-->

Tools for testing Firebase backend features, using Jest.

- Emulator detection. The library *automatically picks up the configuration* when running the tests. Less boilerplate.

- Compatible. You may use *either* 8.x or 9.x (beta) client JS SDK in your application project. More freedom.

- Testing Security Rules *immutably* (a passing write or delete operation does not change one's primed data, and affect other tests). No flaky tests.

- Testing *indirect (cloud based) Firestore changes*, by adding `.eventually` to the Jest arsenal.

- Help functions for *priming* Firestore with JSON data.

<!-- fade out..
Cloud Function callables can also be tested, but you need to provide a Firebase JS client SDK for that, and copy-paste some boilerplate.
-->

This library does not bring a client side Firebase JS SDK transitive `npm` dependency to your project, and should therefore be *usable on both `8.x` and `9.x` Firebase JS SDKs*.

Only to be used with Jest 27.


## Requires

- Jest 27 - [milestone](https://github.com/facebook/jest/milestone/12)

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

>Note: This is needed because (as of 27.0.0-next.9), Jest resolver does not treat modules with `exports` appropriately. This is likely going to be fixed before Jest 27 is out.


### Sample project

See the [GitHub repo](https://github.com/akauppi/firebase-jest-testing) `package.json` and `sample` folder for practical examples.

### Reference documentation
 
The available tools are described in [Writing tests](./Writing%20tests.md).


## Support

If you wish to support the development of this software, be in touch with the author. We'll figure out something nice! ;)

