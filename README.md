# firebase-jest-testing

Tools for testing Firebase back-end features, using Jest.

This repo provides a "one stop", opinionated approach to testing Firebase projects. Using it may save you from reading countless pages of documentation and evaluating different testing strategies and libraries.

Also, the tools handle configuring emulation for you. In all, this tries to give a simpler development experience than the current (<strike>Aug 2020</strike> Apr 2021) Firebase tooling does.

More about:

- [The design](DESIGN.md)
- [Writing tests](Writing%20tests.md) (your TL;DR destination ✈️)

<!-- Works now
>Note: If the links don't work, try [here](https://github.com/akauppi/firebase-jest-testing).
-->

## Projects using the library

- [GroundLevel ♠️ Firebase ♠️ ES](https://github.com/akauppi/GroundLevel-firebase-es) - a Vue.js 3 application template / collaborative graphical tool

*If you find the tool useful, please consider adding a link to your project (as a PR).*

## Folder structure

In addition to developing the npm package, the folder structure tries to emulate a front-end application project's folder layout. This is obviously just a suggestion.

`sample` contains the back-end definitions. You might have this as `back-end` in your front-end project.

- `sample/functions` has the definitions of the Cloud Functions
- `sample/firestore.rules` has the Firestore Security Rules
- `sample/test-fns` contains Cloud Function tests
- `sample/test-rules` contains Security Rules tests

This arrangement provides two benefits:

1. For an application repo, it provides clear differentiation between the front end (in the root) and the back-end.
2. For this repo, it allows bringing more samples later, if needed.

The `firebase.json` project file is at the root, as one would have it in their application project.

## Requirements

- npm
- node >= 14.3 [^1]
- `firebase` CLI:
   `npm install -g firebase-tools`

[^1]: We [need `--experimental-vm-modules`](https://stackoverflow.com/questions/60372790/node-v13-jest-es6-native-support-for-modules-without-babel-or-esm#answer-61653104) (SO answer), which seems to be available for `node@^12.16.0`. In order to support node.js 12, though, top-level-awaits should be abandoned.

<!-- tbd. is this strictly necessary?
Set up the Firestore emulator:

```
$ firebase setup:emulators:firestore
```
-->

You *don't* need a Firebase project for running this code. In fact, it's best to make sure you don't have one active:

```
$ firebase use
No project is currently active.

Run firebase use --add to define a new project alias.
```


## Getting started

Fetch dependencies:

```
$ npm install
```

Now, you're ready to start the emulation and run tests against it.


## Two ways ahead

There are two ways to run the tests, each with their own pros and cons. We'll call them the "CI" (Continuous Integration) and "dev" (development) flows, according to their main use cases.

Let's start with the simpler one.


### CI: Run all the tests

The `npm` targets in this flow:

|target|what it does|
|---|---|
|`ci`|Maps to either `ci:seq` or `ci:par`|
|`ci:seq`|Run tests sequentially|
|`ci:par`|Run tests in parallel|

The sequential runs provide easier-to-follow logs, but `ci:par` provides ~5s faster execution[^2-faster], since the Cloud Functions and Security Rules are tested in parallel.

[^2-faster]: Faster on a desktop (multicore) machine, which you might not have in CI/CD.

Launching the tests is this easy:

```
$ npm run ci
...
Test Suites: 3 passed, 3 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        4.108 s

...
Test Suites: 5 passed, 5 total
Tests:       1 skipped, 28 passed, 29 total
Snapshots:   0 total
Time:        7.165 s
```

Note that the results for Cloud Functions tests and Security Rules tests are provided separately. It could be possible to merge these but the author currently thinks it's not carrying real benefits.

The downside of "CI mode" is that each test run launches a new emulator. This takes ~5s that we can spare, by using the "dev" mode.

>All the tests should pass (or be skipped). If you find some that don't, please file an Issue.


### Dev mode

In dev mode, a server runs continuously on the background so repeated runs of the tests are a bit faster.

**Starting the emulator**

Start the emulator in one terminal, and leave it running:

```
$ npm run start
```

Once we run tests, it's worth checking the emulator output, occasionally.

**Running tests**

In another terminal:

```
$ npm run test:fns:callables
$ npm run test:fns:userInfo
...
```

For testing Security Rules:

```
$ npm run test:rules:invites
$ npm run test:rules:projects
$ npm run test:rules:symbols
$ npm run test:rules:userInfo
$ npm run test:rules:visited
```

Sure you get the gist of it. 🤓

These are prepared for you in `package.json`. When developing something, it's meaningful to run only one suite, at a time.

Once you think things are rolling fine, run `npm run ci` to confirm.

>Note: Since both CI and dev use the same emulator ports (defined in `firebase.json`), one cannot launch `npm run ci` while the emulator is running. Shut it down by Ctrl-C.


## Using in your project

In your application project:

```
$ npm install --save-dev firebase-jest-testing@beta
```

**API reference**

- [Writing tests](Writing%20tests.md) has details, supporting the samples

>Note: Though Jest is in the name, you *can* use some parts in any testing framework, but you'd have to dig the necessary bits out and apply to your project. The distribution expects one to use Jest.


## References

- [ES modules in Node today](https://blog.logrocket.com/es-modules-in-node-today/) (blog, Mar 2020)
