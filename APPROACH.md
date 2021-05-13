# Approach

## One-stop shop

The user of the library is not expected to know about `firebase-admin` or Firebase JS SDK details. We do follow those programming models as closely as it makes sense, but don't expose either one directly to the tests.

If the test developer wants, they can use `firebase-admin` or `firebase` JS SDK in their tests, for sure.

>The version of `firebase-admin` is constrained by our peer dependency. The client JS SDK is free to choose, since we don't use one (especially handy during the transition from 8.x to 9.x or later such incompatibile version bumps).


## Where to prime the data

There are two ways that both work. Kind of. 

In the development, we used both for a while, then settled for B. Let's see, why.

|||
|---|---|
|A. Prime at service launch|In this case, priming the data is done immediately after launching the Firebase emulators, from `package.json`.
|B. Prime as part of the tests|Tests are in charge of priming the database (clean & re-populate) before executing tests.|

B is better, because of two things:

- The dataset may be changed. In such a case, in case A one would need to restart the emulators, whereas in B, things just work. Less surprises is good.
- No left-overs. If tests make changes to the dataset, such would accumulate and may cause tests to unexpectedly fail. 

It's best to prime again, each time tests are run.

>Note: This aspect is self-evident when claimed, still not necessarily noticed since we change the primed data rather infrequently.


## The project id

><font color=red>This gets redone! We'll drop the `GCLOUD_PROJECT` and set an internal env.var. in `prime`, instead! #17</font>

This was an important bit to help keep the code simple.

JEST provides additional complexity (for a reason!) by running different test suites in separate Node contexts. Also the Global Setup stage is separate from these contexts, and thus communication between the setup and tests must happen either via:

- a database (priming)
- file system
- environment variables

When tests run, a certain suite always has just one project id. It can be treated as a constant, and imported statically (which simplified code tremendously).

The `GCLOUD_PROJECT` env.var. was picked, because Firebase `firebase emulators:exec` already sets it.[^1]

`test-fns` expects `GCLOUD_PROJECT` to be set in `package.json`, for launching the JEST tests.

Another approach is shown in the `test-rules`, where the Global Setup sets `GCLOUD_PROJECT` to a certain value. Changes to the env.vars in this way are present in the sub-processes that subsequently run the test suites.

Both ways are fine, and it is up to the test developer to prefer one over the other. 

[^1]: A lame excuse; the name could be anything. But it stuck...


## Firebase vs. our approach?

Firebase provides some npm modules to help with testing:

- `firebase-functions-test` described [here](https://firebase.google.com/docs/functions/unit-testing) (Firebase docs)
- `@firebase/rules-unit-testing`[^2] described [here](https://firebase.google.com/docs/rules/unit-tests) (Firebase docs)

[^2]: This was called `@firebase/testing`, until Aug 2020

These are both tools for unit testing. The first one tests Cloud Functions and the second access of Realtime Database or Cloud Firestore.

The approach taken by this repo differs from that provided by Firebase. We...

1. try to give a unified approach to Firebase testing, so developers don't need to bring in multiple dependencies to their app
2. take a more integration testing approach than Firebase's libraries 
3. prefer normal clients (or a similar API) over test specific APIs
4. focus on a specific testing framework (Jest), allowing us to fluff the pillows better than an agnostic library can

For testing Cloud Functions, we use integration testing and normal JavaScript client instead of the `firebase-functions-test` library.

For priming data, we use `firebase-admin` internally, and take data from human-editable JSON files. Firebase approach leans on snapshot-like binary files, instead.

For testing Security Rules, our approach is derived from the Firebase `rules-unit-testing` library, but then enhanced eg. by making database access behave as immutable and not depending on a certain Firebase client - thus allowing the application developer to freely select between, say, 8.x and 9.x (beta).

As a testing framework, we use Jest, and have extended its normally unit testing -based approach to integration tests, just so much that we don't need to teach the application developer two testing frameworks. At least, not for the back-end.[^3]

[^3]: Using Cypress for the front end is likely too big a temptation for most. But having one tool for front, another for the back-end may be acceptable.
