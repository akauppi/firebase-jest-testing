# Design

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

