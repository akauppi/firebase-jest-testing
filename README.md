# firebase-jest-testing

Tools for testing Firebase back-end features, using Jest.

This repo provides a "one stop", opinionated approach to testing Firebase projects. Using it may save you from reading countless pages of documentation and evaluating different testing strategies and libraries.

Also, the tools handle configuring emulation for you. In all, this tries to give a simpler development experience than the current (Aug 2020) Firebase tooling does.

More about

- the [DESIGN](DESIGN.md)
- [Writing tests](Writing%20tests.md) (your TL;DR destination ✈️)


## Requirements

- npm
- `firebase` CLI:
   
   `$ npm install -g firebase-tools`
- Have a Firebase project set up

Tie to the Firebase project:

```
$ firebase use --add --config firebase.testing1.json
```

The alias you choose does not matter.

>Note: Firebase needs the project, even when all we do is run a local emulation.

<!-- Q: is this strictly necessary?
Set up the Firestore emulator:

```
$ firebase setup:emulators:firestore
```
-->


## Getting started

Fetch dependencies:

```
$ npm install
```

You'll need to do this also for the functions emulated:

```
$ (cd sample/functions && npm install)
```

After this, you're ready to start the emulation and run tests against it.


## Two ways ahead

There are two ways to run these tests, each with their own pros and cons. We'll start with the one where a server is manually started.

### Dev: Start an emulator

We start a Firebase emulator in one terminal, and run the tests in another - or in an IDE.

**Starting the emulator**

```
$ npm run start
```

Once we run tests, it's worth checking the emulator output, occasionally.

**Running tests**

In another terminal:

```
$ npm run test:fns:monitoring
$ npm run test:fns:callables
$ npm run test:fns:userInfo
...
```

These are prepared for you in `package.json`. When developing functions, it's meaningful to run only one suit, at a time.


### CI: As a single command

Once tests pass, you'll likely be just running them over and over, e.g. from a CI script.

This command starts the emulator in the background, for the duration of running the tests. Launching adds ~5..6s to the execution time.

```
$ npm run ci
...
Test Suites: 3 passed, 3 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        6.56 s
Ran all test suites.
✔  Script exited successfully (code 0)
i  emulators: Shutting down emulators.
i  hub: Stopping emulator hub
i  functions: Stopping Functions Emulator
i  firestore: Stopping Firestore Emulator
```


## Using in your project

```
$ npm install --save-dev firebase-jest-testing@alpha
```

See [Writing tests](Writing%20tests.md) for what then.

>Note: Though Jest is in the name, you *can* use the `db` and `fns` tools in any testing framework.
>`eventually` is Jest specific, only because the framework lacks that feature (maybe we should split the node module to two, separate ones - but not yet).


## References

- [ES modules in Node today](https://blog.logrocket.com/es-modules-in-node-today/) (blog, Mar 2020)

