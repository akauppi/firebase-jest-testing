# Approach

## One-stop shop

The user of the library is not expected to know about `firebase-admin` or Firebase JS SDK details (or the differences between the "alpha" and 9.x APIs). We do follow the `firebase-admin` API as closely as it makes sense, but don't expect the user to need to read the corresponding documentation.

>Note: The version of `firebase-admin` in the parent application is constrained by our (semi-internal) use of it. This matters especially within the transition from 9.x to "modular" Node.js admin library.
>
>This should not matter, since the idea is that the test project would not need to import `firebase-admin` directly, at all.


<!-- phasing out...
## Where to prime the data

This is very self-evident, in hindsight.

During development, functions test data was primed *at the launch of the emulator*. 

Now, tests themselves prime the data as part of their setup. This means:

- running tests is consistent - they always have the same initial dataset
- one can change the dataset (this happens rarely, but..) and not need to restart the emulators

You probably should stick with this setup.
-->

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
   const projectId = "demo-1";  // was: "fns-test"
   
   const setup = async _ => {
     await prime(projectId, docs);
   }
   ```

2. `prime` uses it for itself, but also sets the `PROJECT_ID` env.var. for the clients
3. When tests run, `config.js` reads the project id from `PROJECT_ID`

The name of the env.var. is completely internal to the implementation. It's nice that the test setup provides the project id to use, since those matter also for launching the emulators (selects, which project's data is shown in the emulator UI).


## Immutability cloaking

>Immutability cloaking means the act of making Firestore data look (to the tests) like it wouldn't change, when in fact it does.

Immutability cloaking needs to know the original contents of the data.

We tried a couple of approaches to this:

- reading before each potentially mutating operation (takes 12..32 ms per operation)
- reading only once, per doc, then keeping in cache (~20..45 ms per operation) <!-- no idea why the timing is different than above -->
- reading *all* primed data at the launch (~400 ms initial delay)

None of these approaches is very good. Access to the emulated Firestore is *really slow*, pushing us towards:

- reading the data directly from disk, also in the tests


## Firebase vs. our approach?

Firebase provides some npm modules to help with testing:

- `firebase-functions-test` described [here](https://firebase.google.com/docs/functions/unit-testing) (Firebase docs)
- `@firebase/rules-unit-testing`[^1] described [here](https://firebase.google.com/docs/rules/unit-tests) (Firebase docs)

[^1]: This was called `@firebase/testing`, until Aug 2020

These are both tools for unit testing. The first one tests Cloud Functions and the second access of Realtime Database or Cloud Firestore.

The approach taken by this repo differs from that provided by Firebase. We...

1. try to give a unified approach to Firebase testing, so developers don't need to bring in multiple dependencies to test their app
2. take a more integration testing approach than Firebase's libraries 
3. focus on a specific testing framework (Jest), allowing us to fluff the pillows better than an agnostic library can

For priming data, we use `firebase-admin` internally, and take data from human-editable JSON files. Firebase approach leans on snapshot-like binary files, instead.

For testing Security Rules, our approach is originally derived from the Firebase `rules-unit-testing` library, but then enhanced by making database access behave as immutable, not depending on a certain Firebase client, and providing the allowed/denied test at the end of the line, for better readability.

As a testing framework, we use Jest, and have extended its normally unit testing -based approach to integration tests, just so much that we don't need to teach the application developer two testing frameworks. At least, not for the back-end.[^2]

[^2]: Using Cypress for the front end is likely too big a temptation for most. But having one tool for front, another for the back-end may be acceptable.


## What counts as an "offline" project?

Firebase Emulators documentation defines a "real" and a "demo" project [here](https://firebase.google.cn/docs/emulator-suite/connect_functions?hl=en&%3Bauthuser=3&authuser=3#choose_a_firebase_project).

- Real project is *"one you configured and activated in the Firebase console"*.

- Fake / offline ("demo") project *"has no Firebase console configuration"* and *"has the `demo-` prefix"*.

This leaves a hole. 🕳 

Not having an active project - just providing a random name with the `--project` flag, is not categorized as either "real" or "demo" project.

The author advocates defining a fake (or "offline") project as:

>A fake (offline) project is one that is not activated in the Firebase console.

"demo" could be mentioned under the "Real" definition as:

>A real project cannot have an id that starts with `demo-`.

This would be clearer than the existing definition, yet fully compatible with it (`demo-` projects are also "fake", because they are not - and cannot be - "activated").

---

To be compatible with the current state of affairs, the `fns-test` project id was changed to `demo-1`, with the hope that the naming rule be scrapped.


## Warm-up (CI)

All the tests are expected to pass in a relatively tight (2000 ms) window.

This is not necessarily the case for CI, using Docker, rather limited machine resources and always a cold start. To provide comparable results to those on a development machine (where the services may be running continuously in the background), CI runs warm up certain parts of the emulation by executing tests twice, first with a wider timeout and ignoring their output.

>Note: The set of tests needing warm-up has varied, over time (and Firebase Emulator versions). 
>
>Ideally, the author would like Firebase Emulators to start always warmed up.

The purpose is to provide results more akin to the normal developer experience (not the initial cold run), and to catch tests that would truly (repeatedly) run slow.

### Fluctuations

Whether warm-up is needed is dependent on individual CI runs (time of day; who knows what). Here's one:

```
Step #2:   '/symbols' rules
Step #2:     ✓ unauthenticated access should fail (1166 ms)
Step #2:     ✓ user who is not part of the project shouldn't be able to read (81 ms)
Step #2:     ✓ project members may read all symbols (328 ms)
Step #2:     ✓ all members may create; creator needs to claim the symbol to themselves (754 ms)
Step #2:     ✓ members may claim a non-claimed symbol (362 ms)
Step #2:     ✓ members may do changes to an already claimed (by them) symbol (151 ms)
Step #2:     ✓ members may revoke a claim (143 ms)
Step #2:     ✓ claim cannot be changed (e.g. extended) (131 ms)
Step #2:     ✓ members may delete a symbol claimed to themselves (130 ms)
Step #2: 
```

Note that all is under 2s (no warm-up would be needed).

Other times, you do.


## Using native `fetch()` so early

The underlying aim in moving to Node's native `fetch` API is minimizing the number of dependencies. At one point, `test:fns:greet` started to fail and it wasn't clear which change had done that. Instead of going up/down `node-fetch` versions, I decided to ditch it.
