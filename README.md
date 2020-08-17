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

`sample/test-rules`contains Firestore Security Rules tests


This arrangement provides two banefits:

1. For this repo, it allows bringing more samples later, if needed.
2. For an application repo, it provides clear differentiation between the front end (in the root) and the back-end.

`firebase.json`, `firebase.norules.json` and `.firebaserc` are intentionally in the root. These are project specific configuration files and in one's application project they are normally in the root. If we ever have more than one samples, we'll deal with that by naming the files.

<!-- 
>Note: Firebase (8.7.0) requires `firebase.**.json` and `.firebaserc` to be in the same directory.
-->

>Note: Firebase (8.7.0) requires `functions` to be in the same directory as `firebase.json` (and `.firebaserc`). We don't support this convention, and would like to have a **configuration** (maybe in `firebase.json`) that allows the folder path to be overridden.
>
>In order to keep our head, but also have the code working, we've made a symbolic link at the root level.


## Requirements

- npm
- `firebase` CLI:
   
   `$ npm install -g firebase-tools`

### Firebase project

Firebase needs to be tied to a project in the cloud, even when we only run a local emulation. Creating a project is described [here](https://firebase.google.com/docs/projects/learn-more#setting_up_a_firebase_project_and_registering_apps).

Your project should have Cloud Functions and Cloud Firestore enabled.

<!-- #whisper
maybe also an app needs to be created - or maybe not. They are needed for authentication but it's uncertain whether it matters since we only emulate auth with the `@firebase/testing` client.
-->

Tie to the Firebase project:

```
$ firebase use --add
```

The alias you choose does not matter.

<!-- Q: is this strictly necessary?
Set up the Firestore emulator:

```
$ firebase setup:emulators:firestore
```
-->

>Note: Firebase could consider not needing the project id at all, for an emulation-only use case like ours. That would simplify the documentation and developer experience.


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

The downside is that for each test run, "CI" flow launches a new emulator. This takes ~5..6s that we can spare, by using the "dev" mode(s).

All the tests should pass (or be skipped). If you find some that don't, please file an Issue.


### Dev mode(s)

Use dev modes when you are developing the Security Rules, Cloud Functions or their tests. Here, a server runs continuously on the background so running the tests is a bit faster.

Also dev modes are cut in half, for Security Rules and the rest (Cloud Functions), for the reasons discussed above. Choose the mode based on what you're working on.

**Starting the emulator**

Start the emulator in one terminal, and leave it running:

```
$ npm run start:rest		# or start:rules
```

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

>Note: Though Jest is in the name, you *can* use the `db` and `fns` tools in any testing framework, but you'd have to dig the necessary bits out and apply to your project.
>
>`eventually` is Jest specific, only because the framework lacks that feature.


## References

- [ES modules in Node today](https://blog.logrocket.com/es-modules-in-node-today/) (blog, Mar 2020)

