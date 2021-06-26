# Approach

## One-stop shop

The user of the library is not expected to know about `firebase-admin` or Firebase JS SDK details. We do follow the `firebase-admin` API as closely as it makes sense, or leak aspects of it in the implementation, but don't expect the user to need to read the corresponding documentation, to be able to create tests.

If the test developer wants, they can bring in `firebase-admin` or `firebase` JS SDK into their tests, but they need to take care of the configuration, in that case.

>Note: The version of `firebase-admin` in the parent application is constrained by our (semi-internal) use of it. This matters especially within the transition from 9.x to "modular" Node.js admin library. The client JS SDK is free to choose, since we don't use one (but rely on REST APIs).


## Where to prime the data

<!-- tbd. Consider removing this? -->

This is very self-evident, in hindsight.

During development, functions test data was primed *at the launch of the emulator*. 

Now, tests themselves prime the data as part of their setup. This means:

- running tests is consistent - they always have the same initial dataset
- one can change the dataset (this happens rarely, but..) and not need to restart the emulators

You probably should stick with this setup.


## Where to set the project id(s)

This was an important bit to help keep the code simple!

JEST provides additional complexity (for a reason) by running different test suites in separate Node.js contexts. The Global Setup stage is separate from these contexts, and communication between the setup and tests must happen either via:

- a database (eg. priming)
- file system
- environment variables

When tests *run*, a certain suite always has just one project id. It can be treated as a constant, and imported statically.

The eventual pattern became:

1. The tests provide an opaque, lower case project id when calling `prime`:

   ```
   const projectId = "fns-test";
   
   const setup = async _ => {
     await prime(projectId, docs);
   }
   ```

2. `prime` uses it for itself, but also sets the `PROJECT_ID` env.var. for the clients
3. When tests run, `config.js` reads the project id from `PROJECT_ID`

The name of the env.var. is completely internal to the implementation. It's nice that the test setup provides the project id to use, since those matter also for launching the emulators (selects, which project's data is shown in the emulator UI).


## Immutability cloaking

<!-- can be removed, once we're stable with the read-all-database-at-import approach -->

>Immutability cloaking means the act of making Firestore data look (to the tests) like it wouldn't change, when in fact it does.

Immutability cloaking needs to know the original contents of the data.

We tried a couple of approaches to this:

- reading before each potentially mutating operation (takes 12..32 per operation)
- passing the data from prime to cloak, via file system (unnecessarily burdens also runs not intended for testing Security Rules)

.. before settling on reading the whole database at the loading of the immutability cloak module (not implemented, yet / Jun 2021).


## Firebase vs. our approach?

Firebase provides some npm modules to help with testing:

- `firebase-functions-test` described [here](https://firebase.google.com/docs/functions/unit-testing) (Firebase docs)
- `@firebase/rules-unit-testing`[^1] described [here](https://firebase.google.com/docs/rules/unit-tests) (Firebase docs)

[^1]: This was called `@firebase/testing`, until Aug 2020

These are both tools for unit testing. The first one tests Cloud Functions and the second access of Realtime Database or Cloud Firestore.

The approach taken by this repo differs from that provided by Firebase. We...

1. try to give a unified approach to Firebase testing, so developers don't need to bring in multiple dependencies to their app
2. take a more integration testing approach than Firebase's libraries 
3. prefer normal clients (or a similar API) over test specific APIs
4. focus on a specific testing framework (Jest), allowing us to fluff the pillows better than an agnostic library can

For priming data, we use `firebase-admin` internally, and take data from human-editable JSON files. Firebase approach leans on snapshot-like binary files, instead.

For testing Security Rules, our approach is originally derived from the Firebase `rules-unit-testing` library, but then enhanced by making database access behave as immutable, not depending on a certain Firebase client, and providing the allowed/denied test at the end of the line, for better readability.

As a testing framework, we use Jest, and have extended its normally unit testing -based approach to integration tests, just so much that we don't need to teach the application developer two testing frameworks. At least, not for the back-end.[^2]

[^2]: Using Cypress for the front end is likely too big a temptation for most. But having one tool for front, another for the back-end may be acceptable.
