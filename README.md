# firebase-jest-testing

Tools for testing Firebase back-end features, using Jest.

This repo provides a "one stop", opinionated approach to testing Firebase projects. Using it may save you from reading countless pages of documentation and evaluating different testing strategies and libraries.

Also, the tools handle configuring emulation for you. In all, this tries to give a simpler development experience than the current (Aug 2020) Firebase tooling does.

<!-- More on the above:
- Your app code should not need to have if/else's based on whether you target an emulated back-end or the one running in the cloud. 
- Your app code should not need have emulation specific constants in it.
-->

More about:

- [The design](DESIGN.md)
- [Writing tests](Writing%20tests.md) (your TL;DR destination ✈️)

<!-- Editor's note:
Above links won't work in the published npm page.
-->

>Note: If the links don't work, try [here](https://github.com/akauppi/firebase-jest-testing).


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

The `firebase.json` project file is at the root, as one would have it in their application project. If we ever have more than one sample, we'll deal with that by naming the files differently.

>Note: Firebase (8.7.0) requires `functions` to be in the same directory as `firebase.json`. The author feels this is an unnecessary restriction, and would like to have a configuration (maybe in `firebase.json`) that allows the path to be overridden, e.g. to `sample/functions`.
>
>In order to keep his mind, but also have the code working, there is a symbolic link from `functions` to `sample/functions`.


## Requirements

- npm
- `firebase` CLI:
   `npm install -g firebase-tools`

<!-- tbd. is this strictly necessary?
Set up the Firestore emulator:

```
$ firebase setup:emulators:firestore
```
-->

You *don't* need a Firebase project for running this code. In fact, it's best to make sure you don't have one active:

```
$ firebase use --clear
Cleared active project.

Run firebase use --add to define a new project alias.
```

>*The library is developed with `firebase-tools` 8.10.0, on Node 14.8.0 and macOS 10.15.6.*

## Getting started

Fetch dependencies:

```
$ npm install
```

You need to do this also for `sample/functions` (runs its own Node version):

```
$ (cd sample/functions && npm install)
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

The sequential runs provide easier-to-follow logs, but `ci:par` provides ~5s faster execution, since the Cloud Functions and Security Rules are tested in parallel.

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

In dev mode, a server runs continuously on the background so running the tests is a bit faster.

**Starting the emulator**

Start the emulator in one terminal, and leave it running:

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
>
>If `firebase emulators:exec` was able to just pick an open port and expose it to the payload as an env.var, we could run CI while another emulator is running. That would be sweet!! 🍬


## Using in your project

In your application project:

```
$ npm install --save-dev firebase-jest-testing@beta
```

<!-- bygones: was using GitHub Packages

The package is published only to GitHub Packages (not npm registry). In order to use these, your application project must:

Have a `.npmrc` file:

```
registry=https://npm.pkg.github.com/akauppi
```

```
$ npm install --save-dev firebase-jest-testing@beta
```

GitHub Packages shows through the npm registry packages, so you can still use such as well. We hope this little annoyance is not too much to bare - it's simply more easy for the author to publish to GitHub Packages vs. npm registry.
-->

**Sample projects using the library**

- [GroundLevel ♠️ ESM ♠️ Firebase](https://github.com/akauppi/GroundLevel-es6-firebase-web) - a Vue.js 3 template / collaborative graphical tool

*If you find this useful, please consider adding your project as a PR. :)*

**API reference**

- [Writing tests](Writing%20tests.md) has details, supporting the samples

>Note: Though Jest is in the name, you *can* use some parts in any testing framework, but you'd have to dig the necessary bits out and apply to your project. The distribution expects one to use Jest.

## Developer notes

### Co-developing with an app

If you co-develop this library and a separate application project, use `npm link` to tie them together:

- `npm link` here
- `npm link firebase-jest-testing` in the application

These commands seem to need repeating, per each version bump. If `npm install` fails in the application, just rerun them.

- [How to NPM Link to a local version of your dependency](https://medium.com/@AidThompsin/how-to-npm-link-to-a-local-version-of-your-dependency-84e82126667a) (blog, Jan 2019)


## References

- [ES modules in Node today](https://blog.logrocket.com/es-modules-in-node-today/) (blog, Mar 2020)
