# Design


## Testing Cloud Functions

Using a specific project name (`--project=bunny`) and priming the data in `sample/docs.cjs` to this project. 

This means it's only available to the tests (using the same project name), but also visible in the Emulator UI: [http://localhost:4000/firestore/projects/1](http://localhost:4000/firestore/projects/1)

Changes to the data are allowed.

**Security Rules are not observed** in Cloud Functions testing. They are tested separately.


## Testing Security Rules

The data is primed at the beginning of the tests, under project id `rules-test`. This data is guarded against changes by the `firestoreTesting/readOnly.js` code, so that it seems immutable.

>Note: There is no real benefit in priming the data per suite. We could do it at the launch of the service, as well. It's just trying two approaches and a code base legacy. It works. ;)



## Firebase vs. our approach?

Firebase provides some npm modules to help with testing:

- `firebase-functions-test` described [here](https://firebase.google.com/docs/functions/unit-testing) (Firebase docs)
- `@firebase/rules-unit-testing`[^1] described [here](https://firebase.google.com/docs/rules/unit-tests) (Firebase docs)

[^1]: This was called `@firebase/testing`, until Aug 2020

These are both tools for unit testing. The first one tests Cloud Functions and the second access of Realtime Database or Cloud Firestore.

The approach taken by this repo differs from that provided by Firebase.

1. We try to give a unified approach to Firebase testing, so developers don't need to bring in multiple dependencies.
2. We take a more integration testing approach than Firebase's libraries.
3. We prefer normal clients over test specific APIs.
4. We focus on a specific testing framework (Jest), allowing us to fluff the pillows better than an agnostic library can.

For testing access rights, we use `@firebase/rules-unit-testing` internally, but provide what we think is a better testing API for it.

For testing Cloud Functions, we use integration testing and normal JavaScript client instead of the `firebase-functions-test` library. This should provide less things to learn to the application developer.

As a testing framework, we use Jest, and have explored possibilities of extending its normally unit testing -based approach to integration tests, just so much that we don't need to teach the application developer two testing frameworks. At least, not for the back-end.[^2]

[^2]: Using Cypress for the front end is likely too big a temptation for most. But having one tool for front, another for the back-end may be acceptable. :)
