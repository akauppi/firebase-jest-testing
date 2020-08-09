# firebase-jest-testing

Tools for testing Firebase Cloud Functions and Security Rules, using Jest.


## Philosophy

Firebase provides some npm modules to help with testing:

- `firebase-functions-test` described [here](https://firebase.google.com/docs/functions/unit-testing) (Firebase docs)
- `@firebase/testing` described [here](https://firebase.google.com/docs/rules/unit-tests) (Firebase docs)

These are both tools for unit testing. The first one tests Cloud Functions and the second access of Realtime Database or Cloud Firestore (despite its generic name).

The approach taken by this repo differs from that provided by Firebase.

1. We try to give a unified approach to Firebase testing, so developers don't need to bring in multiple dependencies. 
2. If possible, we prefer using normal Firebase clients over specific testing-only libraries.

We try to separate testing different aspects of the application.

For testing access rights, we use `@firebase/testing` internally, but provide what we think is a better testing API.

For testing Cloud Functions, we use integration testing and normal JavaScript clients instead of the `firebase-functions-test` library. This should provide less things to learn to the application developer.

As a testing framework, we use Jest, and have explored possibilities of extending its normally unit testing -based approach to integration tests, just so much that we don't need to teach the application developer two testing frameworks (Cypress and Jest).

Let's get started.


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

You'll need to do this separately also for the functions emulated:

```
$ (cd functions && npm install)
```

After this, you're ready to start the emulation and run tests against it.


## Testing Cloud Functions

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
$ npm run test:monitoring
$ npm run test:callables
$ npm run test:userInfo
...
$ npm run test:all
```

These are prepared for you in `package.json`. When developing functions, it's meaningful to run only one suit, at a time.


### CI: As a single command

Once tests pass, you'll likely be just running them over and over, e.g. from a CI script.

This command starts the emulator in the background, for the duration of running the tests. Launching adds ~5..6s to the execution time.

```
$ npm run ci
...
```

<_!-- tbd. output above --_>
-->


## Using in your project

<font color=red>...tbd. about how to pull in...</font>


## Developer notes

The structure is made to resemble that of your Firebase project, so that it would feel normal to test the tools out.

- `functions/`: This is where your Cloud Function sources live. Demanded by Firebase to have this name.
- `test.fns/`: Tests for your cloud functions. Choose a suitable name.
- `src/`: Tool sources. Don't copy to your project but take the files via `npm`.

Some files:

- `firebase.testing1.json`: The Firebase configuration file.


<!--
## References

- Cloud Functions > [Get Started](https://firebase.google.com/docs/functions/get-started) (Firebase docs)
-->

