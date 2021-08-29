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

1. try to give a unified approach to Firebase testing, so developers don't need to bring in multiple dependencies to their app
2. take a more integration testing approach than Firebase's libraries 
3. prefer normal clients (or a similar API) over test specific APIs
4. focus on a specific testing framework (Jest), allowing us to fluff the pillows better than an agnostic library can

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

To be compatible with the current state of affairs, the `fns-test` project id was changed to `demo-1`, with the hope that the naming rule can be scrapped, later.[^3]

[^3]: It feels awkward to be call tests "demo", since they obviously aren't...


## Docker Compose only for CI (for now...)

In the repo, Docker Compose (DC) is used only for CI runs. 

This is intentional. While DC is awesome, it adds complexities that a regular `npm` developer can do without.

Also, stability and testing speed (developer experience as a whole) are better, with the `npm` and `concurrently` (native) approach. 

You can try it out with:

```
$ docker compose run test
```

### Speed

As you can see, the setup is not 1-to-1. But let's see...

**native (macOS):** Firebase CLI 9.16.5; Node 16; npm 7

```
$ time npm test
...
real	0m18.000s
user	0m8.551s
sys  	0m1.834s

real	0m19.091s
user	0m8.870s
sys 	0m1.867s
```

**DC:** Docker Desktop for Mac 3.6.0; Firebase CLI 9.16.0 (in the builder image); Node 14; npm 6

```
$ docker compose down    # so service launch time is included

$ time docker compose run test
...
real	0m48.236s
user	0m0.222s
sys 	0m0.254s
```

The real world timing matters for DX. 18..19 s vs. ~48 s. Brain free choice.

Also individual test execution times are better in the native approach (Firebase Emulators seem faster that way, at least on a Mac).

See [this comment](https://github.com/akauppi/firebase-jest-testing/issues/25#issuecomment-904027683) (GitHub Issues).


### Stability

Use of `socat` for the warming up seems to have introduced a trouble for `docker compose down`.

This is not a concern in the CI, where a machine is one-time-used. It would, however, need to be fixed in order to use DC for development (or we could skip the warming up in development; it has value mostly in CI).

Anyways, complications...

>Earlier, port 5002 (Cloud Functions) was left open by DC, but haven't seen that for a while..

The native `npm test` workflow doesn't suffer from these issues.


## CI using a custom `n14-user` image

This is a story.

There are three tiers we could go. Tried them all.

- have commands in the `docker-compose.yml` and use stock `node:14-alpine`
- use `builds: ../n14` from `docker-compose.yml`
- have a separate file that needs to be pushed to the Container Registry

All of these work.

### Stock `node:14-alpine`

|||
|---|---|
|**Pros:**|
||Cloud Build would nicely reuse the stock image (load only once).|
|**Cons:**|
||Non test-related commands (eg. tuning `npm`) in the `docker-compose.yml`.|

### `builds:`

|||
|---|---|
|**Pros:**|
||Doesn't need pushing to Container Registry; yet removes complexity from `docker-compose.yml`|
|**Cons:**|
||Gets re-built at each CI run, slowing them down.|

### Custom image

|||
|---|---|
|**Pros:**|
||Fast for execution|
|**Cons:**|
||Needs to be pushed before use|
|**Potential:**|
||Using same image for multiple (all) projects of the same author|


## Warm-up is essential!!! 🏃‍♀️

We finally have reliable, sub-2000 ms, timings, in CI!

This is due to the `warm-up` service, added in `docker-compose.yml`. It waits for the emulators to have started (port 6767 = Firestore), then exercises a run of Cloud Functions tests, where a) timeouts are way higher than normally, b) the results are ignored (unless the tests fail).

This preceding round is like the warm-up before a race.

`warmed-up` then opens a TCP port (with `socat`, but anything would do) to inform `test` to go further.

### Alternatives

Tried file-based synchronization, briefly. It works, but the temporary files would need to be cleaned up *outside* of `docker-compose.yml` (if any left overs were to be there), in order not to have race conditions. So it's more risky than the port approach.

Tried Firestore synchronization, way back. It works, but needed an explicit dependency to eg. `firebase-admin` that we otherwise don't need (it does come via `firebase-jest-testing`, but that's beside the point). It felt like over-complexity.

### Problems

At the same time `socat` was added, these started to show up:

```
$ docker compose down
[+] Running 1/1
 ⠿ Container firebase-jest-testing_emul_1  Removed                                                                                                                                                                                         10.3s
 ⠿ Network firebase-jest-testing_default   Error                                                                                                                                                                                            0.0s
failed to remove network 9d8b09047e85d335a5a2dea7da467873eb20dd0a05714ef3691dfc903396976a: Error response from daemon: error while removing network: network firebase-jest-testing_default id 9d8b09047e85d335a5a2dea7da467873eb20dd0a05714ef3691dfc903396976a has active endpoints
```

Keep an eye on it.

>If it ever is a real problem, launch an ultra-simple Node.js server, instead of opening a port with `socat`.
