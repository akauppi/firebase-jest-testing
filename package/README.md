# firebase-jest-testing

<!--
This README is visible on the npm package page: https://www.npmjs.com/package/firebase-jest-testing
-->

Tools for testing Firebase backend features, using Jest.

<img alt="can photo" src="images/tin-can-proto.jpg" width=300 />

<!-- tbd. Dedicated can picture, with `firebase-jest-testing` on it..
-->

`firebase-jest-testing` offers:

- 🥫Emulator detection. The library *automatically picks up the configuration* when running the tests. Less boilerplate!

- 🪶Light. Uses Firestore *REST API* so *no Firebase client JS SDK* is required. Add only `firebase-admin` and it's ready to be served!

- ⚡️Fast. Optimized for multithreading and Node.js. You'll likely max out your cores.

<!-- 
- Compatible. You may use *either* 8.x or 9.x (beta) client JS SDK in your application project. More freedom.
-->

- ‖‖‖ Security Rules are tested **immutably** - a passing write or delete operation does not change the data, and cannot disturb other tests. This is why we can parallelize the tests so much. No flaky tests.

- ⏲For testing Cloud Functions at the integration level, `.eventually` extension is added to the Jest arsenal.

- ﹛﹜Help functions for priming Firestore with *JSON data*.

- `+` Means for testing callables.

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

