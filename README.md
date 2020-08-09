# Developer notes

For contributors.


## Requirements

- npm
- `firebase` CLI:
   
   `$ npm install -g firebase-tools`
- Have a Firebase project set up

Tie to the Firebase project:

```
firebase use --add
```

>Note: We need the Firebase project, even when all we do is run a local emulation.

<!-- Q: is this strictly necessary?
Set up the Firestore emulator:

```
$ firebase setup:emulators:firestore
```
-->

## Running the tests

Let's first test the tools work on your system:

```
$ npm test
```

>Note: Some of the tests are skipped, because their correct outcome is a time-out and we can only test that manually by enabling them and letting them fail.

`expect.never` tests are skipped, because we cannot implement it in the way we'd like. 

---

Though the current behaviour of `expect.eventually` and `expect.never` is meager, we did get enough tools to make the necessary Cloud Functions tests happen.


## Firebase Testability design

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

Now, let's proceed to our samples.


## Sample 1: Testing Cloud Functions

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


<!--
## References

- Cloud Functions > [Get Started](https://firebase.google.com/docs/functions/get-started) (Firebase docs)
-->

