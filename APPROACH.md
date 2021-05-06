# Approach

We manage to test both Cloud Functions and Security Rules, separately, but with the same emulator instance.

Only admin-side dependencies are used. This is important for clarity, but also helps keep clear of client side SDK version conflicts.

>As an example, using `@firebase/rules-unit-testing` (which we don't) would bring in `8.x` SDK (May 2021) and therefore not work for projects using the `9.x.beta` SDK. The problem is transitional, but can be completely avoided.


## Testing Cloud Functions

Using a specific project name (`--project=bunny`) and priming the data at the launch of the emulator. 

The data is also visible in the Emulator UI: [http://localhost:4000/firestore/projects/1](http://localhost:4000/firestore/projects/1)

Changes to the data are allowed.


## Testing Security Rules

Unlike with Cloud Functions, we prime the data at the beginning of the tests. The data set is completely separate from the one used for cloud functions, and since we use a separate project id (`rules-test`), these will co-exist.

The data is guarded against changes by the `firestoreTesting/readOnly.js` code, so that it seems immutable.

>Note: There is no real benefit in priming the data per suite. We could do it at the launch of the service, as well. It's just trying two approaches and a code base legacy. It works. ;)
>
>Maybe it has a slight benefit in that if you change the data set, changes will be applied without needing to restart the emulator.


## Firebase vs. our approach?

Firebase provides some npm modules to help with testing:

- `firebase-functions-test` described [here](https://firebase.google.com/docs/functions/unit-testing) (Firebase docs)
- `@firebase/rules-unit-testing`[^1] described [here](https://firebase.google.com/docs/rules/unit-tests) (Firebase docs)

[^1]: This was called `@firebase/testing`, until Aug 2020

These are both tools for unit testing. The first one tests Cloud Functions and the second access of Realtime Database or Cloud Firestore.

The approach taken by this repo differs from that provided by Firebase. We...

1. try to give a unified approach to Firebase testing, so developers don't need to bring in multiple dependencies to their app
2. take a more integration testing approach than Firebase's libraries 
3. prefer normal clients over test specific APIs
4. focus on a specific testing framework (Jest), allowing us to fluff the pillows better than an agnostic library can

For testing Cloud Functions, we use integration testing and normal JavaScript client instead of the `firebase-functions-test` library. This should provide less things to learn to the application developer.

For priming data, we use `firebase-admin` internally, and take data from human-editable JSON files. Firebase approach leans on snapshot-like binary files, instead.

As a testing framework, we use Jest, and have extended its normally unit testing -based approach to integration tests, just so much that we don't need to teach the application developer two testing frameworks. At least, not for the back-end.[^2]

[^2]: Using Cypress for the front end is likely too big a temptation for most. But having one tool for front, another for the back-end may be acceptable.
