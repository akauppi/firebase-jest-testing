# Writing Tests

<!-- tbd. See if we can link to this from the `npmjs` package page.
-->

**Contents:**

- [Testing Security Rules](#testing-security-rules)
- Testing Cloud Functions
   - [events](#testing-cloud-functions-events)
   - [callables](#testing-cloud-functions-callables)
- [Priming with JSON data](#priming-with-json-data)
- [Why immutability matters...](#why-immutability-matters---and-a-bit-about-implementation)

---

## Testing Security Rules

For testing security rules, the library provides an *immutable* way of testing Firestore operations. This means your test data is not modified - you merely get the information whether it *would* be modified, by such operation and authentication.

Because of this, the tests can now be written in a simpler way.

```
import { 
  collection, 
  serverTimestamp,
  deleteField,
  arrayRemove,
  arrayUnion
} from 'firebase-jest-testing/firestoreRules'
```

*Your normal test might not need all the above imports - they are listed here for completeness.*


### `collection`

`collection` is a `CollectionRef` -like interface (not the full thing!):

```
{
  collection: collectionPath => {
    as: { uid: string }|null => CollectionReference -like
  }
}
```

Setting the access role happens at the *collection* level. An example:

```
describe("'/invites' rules", () => {
  let unauth_invitesC, abc_invitesC, def_invitesC;

  beforeAll( () => {
    const coll = collection('invites');

    unauth_invitesC = coll.as(null);
    abc_invitesC = coll.as({ uid: 'abc' });
    def_invitesC = coll.as({ uid: 'def' });
  });

  ...
```

This code prepares variants of the same collection: one unauthenticated, and two with varying users supposed to have signed in. These can then be used throughout the tests, to check who has access.

>Note: the now taken order of *collection first* is simply an API decision. This style seems to match practical use cases better than the reverse, since there's normally one collection but multiple users, per a test suite. More choices can be offered in the future, if use cases warrant the need for them.

You can use the provided `CollectionReference`-like handles in the normal Firebase fashion:

```
expect( unauth_invitesC.get() ).toDeny()
```

|method|description|
|---|---|
|`.get()`|Check whether reading any document within the collection is allowed (i.e. can the user subscribe to it).|
|`.get(docName)`|Check whether reading a specific document is allowed. Same as `.doc(docName).get()`.|
|`.doc(docName)`|Get a `DocumentReference`-like handle.| 

### `DocumentReference`-like

|method|description|
|---|---|
|`.get()`|Check whether reading the document is allowed.|
|`.set(any)`|Check whether writing the document, with the provided data, is allowed.|
|`.update(any)`|Check whether merging with the existing document is allowed.|
|`.delete()`|Check whether deleting the document is allowed.|

These methods try to be careful reproductions of the Firebase JS client SDK's similar methods. However, underneath there is no client - just REST API calls that interact with the Firebase Emulators.


### `FieldValue` look-alikes

The Firebase JS SDK provides server-side modifiers in the form of [FieldValue](https://firebase.google.com/docs/reference/js/firebase.firestore.FieldValue).

Here are the look-alikes:

||use|purpose|
|---|---|---|
|`serverTimestamp`|`serverTimestamp()`|Time of the request|
|`deleteField`|`deleteField()`|Removes the field|
|`arrayRemove`|`arrayRemove("a","b")`|Removes certain values from an array|
|`arrayUnion`|`arrayUnion("a","b")`|Adds certain values to an array, unless they already exist|

The use of these should be exactly as with a Firebase client.

Not all `FieldValue`s have a corresponding look-alike. Only the ones deemed essential for testing Security Rules are implemented. 

>Note: `serverTimestamp()` and `deleteField()` always return the same sentinel value. The API has been kept as a function nonetheless, to match the Firebase JS SDK API.

>Note: Our aim is not to provide comprehensive reproduction of a whole client, but all the *necessary* elements for testing Security Rules, in a fashion that is as 1-to-1 with the latest client API as it makes sense.

**Example:**

```
import { test, expect, describe, beforeAll } from '@jest/globals'

import { collection, serverTimestamp } from 'firebase-jest-testing/firestoreRules'

describe("'/invites' rules", () => {
  let abc_invitesC;

  beforeAll( () => {
    const coll = collection('invites');

    abc_invitesC = coll.as({uid:'abc'});
  });

  test('only a member of a project can invite', () => {
    const d = { email: "aa@b.com", project: "1", by: "abc", at: serverTimestamp() };

    return expect( abc_invitesC.doc("aa@b.com:1").set(d).toAllow(),   // author can invite
	]);
  })	
});
```

*This is a simplified take on the `test-rules/invitesC.test.js`. You can find the whole file (and more) in the project repo's [sample](https://github.com/akauppi/firebase-jest-testing/tree/master/sample) folder.*

While we are at the sample, notice the lack of Firebase specific setup.

The library picks up the configuration from `firebase.json` automatically (if you have renamed it, set the `FIREBASE_JSON` env.var). Just import the library and Jest.


### `.toAllow()` and `.toDeny()`

The example has a `.toAllow`, at the end of the test. Its counterpart, `.toDeny` can be used to check a user does not have access.

These are Jest extensions, and they are automatically enabled by importing `firestoreRules`.

Their use is self-explanatory. You have a Promise that should pass the security rules? `expect` it `.toAllow()`. It should not? `.toDeny()`.

>Note: The extensions were introduced by Jeff Delaney in Oct 2018: [Testing Firestore Security Rules With the Emulator](https://fireship.io/lessons/testing-firestore-security-rules-with-the-emulator/)

### `Promise.all` or sequencial `await`s?

You can use either fashion. `Promise.all` may increase the level of parallelism in your tests slightly, but there's no guarantee.

>If you have lots of tests, and do performance comparisons between `Promise.all` vs. sequential `await`s, let the author know how it went.


## Testing Cloud Functions > events

`firebase-jest-testing` does not provide function-level testing tools for Cloud Functions. Instead, the aim is at end-to-end testing, where the tests set some aspect of the Firestore database, and remain listening whether changes are propagated elsewhere, as expected.

This part of the library uses `firebase-admin` library (you are provided a properly configured handle for it), which means Security Rules are not involved. It's enough to test the Security Rules, separately.

```
import { 
  collection, 
  doc
} from 'firebase-jest-testing/firestoreAdmin'
```

See `sample/test-fns/userInfo.test.js` for an example.


### `collection`, `doc`

These are the `firebase-admin` `CollectionRef` and `DocumentRef` handles, and can be used in any way you like. 

The library has configured them for emulator access, and will do cleanup for you.


## Testing Cloud Functions > callables

Cloud Functions provide [callable functions](https://firebase.google.com/docs/functions/callable) that are "similar but not identical to HTTP functions".

To exercise these callables, one normally requires a client-side JS SDK. `firebase-admin` does not provide access to callables - it's not its thing.

`firebase-jest-testing` uses the REST API and ducks the need for pulling in a client dependency. Its `firebaseClientLike` interface tries to be *close to* that of the JS SDK, but it's not 100% the same.

```
import { 
  httpsCallable, 
  setRegion 
} from 'firebase-jest-testing/firebaseClientLike'
```

Here's the whole sample test:

```
/*
* sample/test-fns/greet.test.js
*/
import { test, expect, describe, beforeAll } from '@jest/globals'

import { httpsCallable, setRegion } from 'firebase-jest-testing/firebaseClientLike'

const region = "mars-central2";

describe ('Cloud Function callables', () => {
  beforeAll( () => {
    setRegion(region)
  });

  test ('returns a greeting', async () => {
    const msg = 'Jack';

    const fnGreet = httpsCallable("greet");
    const { data } = await fnGreet(msg);

    expect(data).toBe("Greetings, Jack.");
  });
});
```

### The regions story?

- Cloud Functions can be run in regions.
- The Cloud Functions emulator is regions aware (since 9.12.0) and tests need to target a region that exists.
- Your functions can use no regions (defaults to `us-central1`), one or multiple.
- We don't want your Cloud Functions implementation to have any special arrangements for testing.
- We cannot (without heuristics analysis of the Cloud Functions emulator logs) know in the tests, which regions your functions were set up to run on.

These statements lead us to the following advice, with regard to testing callables:

1. If you run Cloud Functions in the default region (even if you also run them in other regions), you don't need to do anything special. Skip `setRegion` in the example.
2. If you *only* run in non-default region(s), specify one such region in the `setRegion` call.

This should cover most of the use cases.

>If you have *different implementations* in different regions, and wish to test them separately, be in touch with the author. You can still use `setRegion` by calling it multiple times, but must take care of the execution order of such tests; `setRegion` influences *all* `httpsCallable` tests following it as a global setting. As a fallback, you can of course always use the normal JS SDK client instead of `firebaseClientLike` API (just remember to configure it for emulation).


### `httpsCallable`

Like the Firebase JS SDK call of the same name, but without the first (`fns`) parameter.

```
httpsCallable(name)   // (string) => ((data) => Promise of { data: any|undefined, error: object|undefined })
```

Give the name of the callable, and then call the returned function with input data.

The returned promise should work as the JS SDK client. If there are communication level problems (e.g. the named callable is not reached), the promise rejects.

>Note: Roles are not currently implemented, but can be. It would be like: `httpsCallable(name).as({ uid: "you" })` - but this is not implemented

### `setRegion`

Call this to set the region where your callables are running, under emulation. 

```
setRegion(region)    // (string) => ()
```

Only needed if one of the regions is not the Firebase default, or if your implementations vary between regions, and you wish to separately test them (see above for comments).

## Priming with JSON data

To run tests - even testing Security Rules - you need some seed data in Firestore. Such data is often hand crafted alongside the tests, and `firebase-jest-testing` provides the means to read it from a JSON / `.js` file.

Add this to your Jest configuration:

```
  globalSetup: "./setup.jest.js"
```

In the `setup.jest.js`:

```
/*
* sample/test-rules/setup.jest.js
*
* Sets the (immutable) data for the Rules tests.
*/
import { docs } from './docs.js'

import { prime } from 'firebase-jest-testing/firestoreAdmin/setup'

const projectId = "rules-test";

async function setup() {
  await prime(projectId, docs);
}

export default setup;
```

This is where you define a project ID for the tests (`rules-test` in the above sample). The project id's keep unrelated tests apart in Firestore. The specific id does not really matter (must be lower case, without spaces).

### `prime`

```
prime(projectId, docs)   // (string, { <docPath>: any }) => Promise of ()
```

Calling `prime` clears the earlier data contents, and primes the database with the `docs`.

The docs are simply a flat `object` with the doc path as the key.


### Warnings

Priming is done using `firebase-admin` and it therefore bypasses any security rules.

If you have schema checks as part of the Security Rules, the seed data may be in breach of these rules. Be extra careful to manually craft the data so that it is valid.

>Then again, maybe you need to test for earlier non-conforming data cases so this really is the way it should be.

As a particular case to watch for, create timestamps with `new Date()` (or `serverTimestamp()`). `firebase-admin` converts them to Cloud Firestore timestamps, but this is *not* the case for <strike>`Date.now()`</strike> and <strike>`Date.parse`</strike> which return Unix epoch numbers.

|expression|value|
|---|---|
|`new Date()`|Mon Aug 24 2020 17:16:58 GMT+0300|
|`new Date('27 Mar 2020 14:17:00 GMT+0300')`|Fri Mar 27 2020 13:17:00 GMT+0200|

Cloud Functions are *not* currently deactivated during the priming (we'll change that if it's needed).


## Why immutability matters (..and a bit about implementation)

In the core of this library is the Security Rules testing, with immutable operations.

To show why this is so important, the author disabled the restoring of data and ran the sample tests:

```
$ npm run test:rules:all
```

<pre><details>
<summary>Output (press to open..)</summary>
(node:27492) ExperimentalWarning: VM Modules is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
 FAIL  sample/test-rules/symbolsC.test.js
  '/symbols' rules
    ✓ unauthenticated access should fail (312 ms)
    ✓ user who is not part of the project shouldn't be able to read (28 ms)
    ✓ project members may read all symbols (106 ms)
    ✕ all members may create; creator needs to claim the symbol to themselves (161 ms)
    ✕ members may claim a non-claimed symbol (153 ms)
    ✓ members may do changes to an already claimed (by them) symbol (114 ms)
    ✓ members may revoke a claim (79 ms)
    ✕ claim cannot be changed (e.g. extended) (97 ms)
    ✓ members may delete a symbol claimed to themselves (62 ms)

  ● '/symbols' rules › all members may create; creator needs to claim the symbol to themselves

    Expected allowed but the Firebase operation was DENIED. [false for 'update' @ L182]

      56 |
      57 |       expect( abc_symbolsC.doc("99").set( d_claimed("abc") )).toAllow(),     // author, claimed
    > 58 |       expect( def_symbolsC.doc("99").set( d_claimed("def") )).toAllow(),     // collaborator, claimed
         |                                                               ^
      59 |
      60 |       expect( abc_symbolsC.doc("99").set( d_claimed_otherTime("abc") )).toDeny(),     // author, claimed, not server time
      61 |

      at Object.<anonymous> (symbolsC.test.js:58:63)

  ● '/symbols' rules › members may claim a non-claimed symbol

    Expected allowed but the Firebase operation was DENIED. [false for 'update' @ L182]

      72 |     return Promise.all([
      73 |       expect( abc_symbolsC.doc("1").update( s1_mod_valid("abc") )).toAllow(),     // author
    > 74 |       expect( def_symbolsC.doc("1").update( s1_mod_valid("def") )).toAllow(),     // collaborator
         |                                                                    ^
      75 |       expect( abc_symbolsC.doc("1").update( s1_mod_otherTime("abc") )).toDeny(),     // bad time
      76 |       expect( abc_symbolsC.doc("1").update( s1_mod_valid("def") )).toDeny()      // claiming for another
      77 |     ]);

      at Object.<anonymous> (symbolsC.test.js:74:68)

  ● '/symbols' rules › claim cannot be changed (e.g. extended)

    Expected denied but the Firebase operation was ALLOWED.

       99 |     const s2_extend = { claimed: { by: 'def', at: SERVER_TIMESTAMP } };
      100 |
    > 101 |     return expect( def_symbolsC.doc("2-claimed").update( s2_extend )).toDeny();     // claimed by him
          |                                                                       ^
      102 |   });
      103 |
      104 |   //--- symbolsC delete rules ---

      at Object.<anonymous> (symbolsC.test.js:101:71)

 FAIL  sample/test-rules/projectsC.test.js
  '/projects' rules
    ✓ unauthenticated access should fail (261 ms)
    ✓ user who is not part of the project shouldn't be able to read it (25 ms)
    ✓ user who is an author or a collaborator can read a project (that is not 'removed') (71 ms)
    ✓ user needs to be an author, to read a 'removed' project (35 ms)
    ✓ any authenticated user may create a project, but must include themselves as an author (165 ms)
    ✓ An author can change '.title' (66 ms)
    ✓ An author can not change the creation time (104 ms)
    ✓ An author can mark a project '.removed' (69 ms)
    ✓ An author can remove the '.removed' mark (200 ms)
    ✕ An author can add new authors, and remove authors as long as one remains (47 ms)
    ✓ no user should be able to delete a project (only cloud functions or manual) (135 ms)

  ● '/projects' rules › An author can add new authors, and remove authors as long as one remains

    Expected allowed but the Firebase operation was DENIED. [false for 'update' @ L44]

      129 |
      130 |     return Promise.all([
    > 131 |       expect( abc_projectsC.doc("1").update(p1_addAuthor) ).toAllow(),
          |                                                             ^
      132 |       expect( abc_projectsC.doc("3-multiple-authors").update(p3_removeAuthor) ).toAllow(),
      133 |
      134 |       // Possible Firestore emulator bug: if we remove the author with '{ authors: [] }', we are denied.

      at Object.<anonymous> (projectsC.test.js:131:61)

 PASS  sample/test-rules/visitedC.test.js
  '/visited' rules
    ✓ unauthenticated access should fail (164 ms)
    ✓ user who is not part of the project shouldn't be able to read (37 ms)
    ✓ project members may read each other's visited status (99 ms)
    ✓ only the user themselves can set their value (to server timestamp) (157 ms)

 FAIL  sample/test-rules/invitesC.test.js
  '/invites' rules
    ✓ no-one should be able to read (379 ms)
    ✕ only a member of a project can invite; only author can invite as-author (168 ms)
    ✓ validity: server time; identifying oneself; 'email:project' as id (264 ms)

  ● '/invites' rules › only a member of a project can invite; only author can invite as-author

    Expected allowed but the Firebase operation was DENIED. [false for 'update' @ L271]

      43 |     return Promise.all([
      44 |       expect( abc_invitesC.doc(id).set( dGen("abc",true )) ).toAllow(),   // author can invite as-author
    > 45 |       expect( abc_invitesC.doc(id).set( dGen("abc",false )) ).toAllow(),  // ..or as collaborator
         |                                                               ^
      46 |
      47 |       expect( def_invitesC.doc(id).set( dGen("def",true )) ).toDeny(),    // collaborator cannot invite as-author
      48 |       expect( def_invitesC.doc(id).set( dGen("def",false )) ).toAllow(),  // ..but can as collaborator

      at Object.<anonymous> (invitesC.test.js:45:63)
          at runMicrotasks (<anonymous>)

 PASS  sample/test-rules/userInfoC.test.js
  '/userInfo' rules
    ✓ no-one should be able to read (175 ms)
    ✓ only the user themselves can write the info (321 ms)

Test Suites: 3 failed, 2 passed, 5 total
Tests:       5 failed, 24 passed, 29 total
Snapshots:   0 total
Time:        5.93 s
Ran all test suites.
</details></pre>

Three out of the five Security Rules test suites and 5 out of 29 tests started failing, because immutability was taken away.

What kind of tests are those?

Case #5

```
expect( abc_invitesC.doc(id).set( dGen("abc",true )) ).toAllow(),   // author can invite as-author
expect( abc_invitesC.doc(id).set( dGen("abc",false )) ).toAllow(),  // ..or as collaborator
```

Here, the same key is written twice. The write is expected to be allowed, both times.

This fails (without immutability) because the Security Rules state that the document is allowed to be created, but not later modified. Without immutability, the second call becomes a modification, and is denied.

Case #4

```
expect( abc_projectsC.doc("1").update(p1_addAuthor) ).toAllow(),
```

Here, adding another user as a co-author is denied. 

This is part of a set of four `expect`s run in parallel, but disabling all them, the access is still denied. Some other test has changed the document in question so that it no longer takes in author changes (it could be that the `.removed` field is set, or the authority of the `abc` user could have been removed; it can really be anything).

Cases #3, #2, #1

The rest of the cases follow suit. The symbols collection has a `claimed` concept where an entry can only be modified by one user, at a time. Removing immutability breaks havoc in such a strongly managed test suite, failing 3/9 tests.

### The point .

Mutable testing of Security Rules is a malpractise. It provides a way for flakiness to creep in to your tests; failed tests are hard to debug and reason about, and it generally disincentifies agains making more tests.

Without having good test coverage, Security Rules remain trivial and don't take full advantage of the robustness they could bring to a project, by eg. checking the schema of changes, or intricate relationships between fields.

The complexities don't disappear. They surface as bugs in runtime, and the client app needs to learn to deal with them.

Contrast this with immutable testing. It makes creating Security Rules tests *scalable* - you can write 100's of them without the rate slowing down. It makes running the tests fast; you can get 100% parallelism to fill all your cores.

Because tests are solid, and easy to understand, you can now make more specific Security Rules and expect (pun) to reap the benefits downstream, in reduced app development time.

### Implementation details

Cloud Firestore does not provide support for immutability (or "dry run") requests.

We provide a locking mechanism over each of the get/set/update/delete operations, so that only one at a time is active. This locking is two-tiered: the Node.js environments (Jest runs your tests using a separate environment for each test suite) are locked via the Cloud Firestore database, itself (creating a lock document).

While the Node.js environment owns the lock document, it does the second tier locking using JS Promises. This is ultra-fast and means that N tests reaching for the Emulator from the same Node.js environment will do so, sequentially, but with practically no time wasted due to locking.

If a set, update or delete operation is successful, `firebase-jest-testing` restores the Firestore document before letting the next operation in.

All of this is profiled, and coding decisions were made based on observed real time behaviour. The outcome should be ultra fast testing for you.

