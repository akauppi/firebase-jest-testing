# firebase-jest-testing

Tools for testing Firebase back-end features, using Jest.

This repo provides a "one stop", opinionated approach to testing Firebase projects. Using it may save you from reading countless pages of documentation and evaluating different testing strategies and libraries.

Also, the tools handle configuring emulation for you. In all, this tries to give a simpler development experience than the current (Aug 2020) Firebase tooling does.

More about

- the [DESIGN](DESIGN.md)
- [Writing tests](Writing%20tests.md) (your TL;DR destination ✈️)


## Folder structure

In addition to developing the npm package, the folder structure tries to emulate a front-end application project folder layout. This is obviously just a suggestion.

`sample` contains the back-end definitions. You might have this as `back-end` in your front-end project.

`sample/functions` has the definitions of the Cloud Functions.
`sample/firestore.rules` has the Firestore Security Rules

`sample/test-fns` contains Cloud Function tests

`sample/test-rules` contains Firestore Security Rules tests


This arrangement provides two benefits:

1. For this repo, it allows bringing more samples later, if needed.
2. For an application repo, it provides clear differentiation between the front end (in the root) and the back-end.

`firebase.json` and `firebase.norules.json` are intentionally in the root. These are project specific configuration files and in one's application project they are normally in the root. If we ever have more than one samples, we'll deal with that by naming the files.

>Note: In your app project, also `.firebaserc` needs to be in the same folder with the `firebase.json` file(s).

>Note: Firebase (8.7.0) requires `functions` to be in the same directory as `firebase.json`. We don't support this convention, and would like to have a **configuration** (maybe in `firebase.json`) that allows the folder path to be overridden.
>
>In order to keep our head, but also have the code working, we've made a symbolic link at the root level.


## Requirements

- npm
- `firebase` CLI:
   
   `$ npm install -g firebase-tools`

<!--
Yayy!!! We found a way that a Firebase project is not needed. #relief!!
-->

<!-- Q: is this strictly necessary?
Set up the Firestore emulator:

```
$ firebase setup:emulators:firestore
```
-->

*The tool is developed with `firebase-tools` 8.8.1, on Node 14.8.0 and macOS 10.15.6*

We *don't* need a Firebase project for running this code. Make sure you don't have one:

```
$ npm use --clear
```


## Getting started

Fetch dependencies:

```
$ npm install
```

You need to do this also for `sample/functions` (runs its own Node version):

```
$ (cd sample/functions && npm install)
```

After this, you're ready to start the emulation and run tests against it.


## Two ways ahead

There are two ways to run these tests, each with their own pros and cons. We'll call them the "CI" (Continuous Integration) and "dev" (development) flows, according to their main use cases.

Let's start with the simpler one.


### CI: Run all the tests

The `npm` targets in this flow:

|target|what it does|
|---|---|
|`ci`|Runs both `ci:rest` and `ci:rules`, i.e. tests everything.|
|`ci:rest`|Tests everything but Security Rules|
|`ci:rules`|Tests Security Rules|

The reason for the division are:

- `ci:rules` uses the `@firebase/testing` client whereas `ci:rest` uses the normal JavaScript client.
- `ci:rules` has the security rules enabled whereas `ci:rest` omits them (there are two configuration files, for this)

>Note: If there is a way to merge the execution environments, launch only a single emulator and run with only a single configuration file, please inform the author via Issues. That would be very welcome, and bring simplicity.

Launching the tests is easy:

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

The downside is that for each test run, "CI" flow launches a new emulator. This takes ~5s that we can spare, by using the "dev" mode(s).

All the tests should pass (or be skipped). If you find some that don't, please file an Issue.


### Dev mode(s)

Use dev modes when you are developing the Security Rules, Cloud Functions or their tests. Here, a server runs continuously on the background so running the tests is a bit faster.

Also dev modes are cut in half, for Security Rules and the rest (Cloud Functions), for the reasons discussed above. Choose the mode based on what you're working on.

**Starting the emulator**

Start the emulator in one terminal, and leave it running:

```
$ npm run start:rest		# or start:rules
```

><font color=red>Note: Here's a problem that we'll discuss in [Issue #1212](). You currently need to authenticate to run `start:rest`.</font>

Once we run tests, it's worth checking the emulator output, occasionally.

**Running tests**

In another terminal:

```
$ npm run test:monitoring
$ npm run test:callables
$ npm run test:userInfo
...
```

For testing Security Rules (use `npm run start:rules`):

```
$ npm run test:rules:invites
$ npm run test:rules:projects
$ npm run test:rules:symbols
$ npm run test:rules:userInfo
$ npm run test:rules:visited
```

Sure you get the gist of it. 

These are prepared for you in `package.json`. When developing something, it's meaningful to run only one suit, at a time.


## Using in your project

```
$ npm install --save-dev firebase-jest-testing@alpha
```

See [Writing tests](Writing%20tests.md) for what then.

>Note: Though Jest is in the name, you *can* use some parts in any testing framework, but you'd have to dig the necessary bits out and apply to your project. The distribution expects one to use Jest.

### Providing the active project

For some reason, [emulating Cloud Functions needs a project](...issue #1...) (it should not).

Until that gets resolved, please provide `GCLOUD_PROJECT=$(firebase use)` in your `package.json`, for `start:rest` and the Cloud Functions tests.


<!-- hidden, for a while..
## Projects using this

- [Groundlevel ES Firebase](https://github.com/akauppi/GroundLevel-es6-firebase-web)
-->

## References

- [ES modules in Node today](https://blog.logrocket.com/es-modules-in-node-today/) (blog, Mar 2020)

