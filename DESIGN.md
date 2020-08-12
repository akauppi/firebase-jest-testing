# Design

## Folder structure

We're presenting one `sample` folder that roughly plays the role of an application specific back-end.

That folder has the Firebase configuration files:

- `firebase.json`
- `.firebaserc`

This is not an ideal solution, but we haven't come up with a better one.

1. Firebase (8.7.0) emulation requires those two to be in the same folder.

2. Since we want to run the back-end emulation without Security Rules, we cannot really use the normal `firebase.json` you'd use for front-end configuration, and deployment.

### Suggestions to Firebase

Why bother with `.firebaserc` at all, for the emulation? There may be valid use cases for a mixed cloud + emulation, but there are also pure emulation use cases (look at us!). For those, `.firebaserc` could be made optional. 

That would take one file out (and adjacent starting steps of requiring `firebase use --add` from the developer).

For the remaining `firebase.json`, command line overrides for **all** (or most) of the config entries would take away the need to have two config files in one's project. There'd only be the main file (at root) and commands such as starting an emulator could override the fields they need.


## Firebase vs. our approach 🐃

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

