# Writing tests

Please see [sample/test-fns](sample/test-fns) and [sample/test-rules](sample/test-rules) tests for practical examples. This document serves as an API reference.


## Preparations

Within your project:

- have this in `jest.config.cjs`:

   ```
  // Without this, the 'firebase-jest-testing' modules are not correctly loaded, due to being declared using 'exports'.
  //
  resolver: "firebase-jest-testing/src/cjs/jestResolver.cjs"
   ```

See [TRACK](TRACK.md) as to why this is needed, for now. (TL;DR Jest ES modules resolver does not treat modules with `exports` field appropriately; Aug 2020).


## Testing Cloud Function callables

```
import { fns } from 'firebase-jest-testing'

fns.httpsCallable(...);
```

In short, you get straight to the Cloud Functions; no need to initialize Firebase application and/or set it up for emulation.


<!-- disabled; older text is better
## Testing Cloud Functions events 

In this, a function triggered by one data change causes another, in Cloud Firestore.

```
import { dbUnlimited } from 'firebase-jest-testing'
import { eventually } from 'firebase-jest-testing/eventually'
```

>Note: `eventually` is a helper feature that allows Jest to actively wait for a condition to become true. The testing toolkit does not have that capability, built in.

`dbUnlimited` is a Cloud Firestore handle where Security Rules are not applied (`admin.firestore.Firestore`).

`eventually` creates a Promise that occasionally (every 100ms) polls the condition given to it, and if other than `undefined`, resolves with that value.

Type: `(() => any) => Promise of any`

Usage:

```
await expect( eventually( _ => shadow.get("abc") ) ).resolves.toContainObject(william);
```

In that test, we've set up a `shadow` map that reflects the database collection we wish to observe.

Note that though we test Cloud Functions in this tests, there's nothing about them in the `import`s. It's just testing that if we poke Firestore this way, does the other place jiggle.
-->


## Testing Cloud Function events

Your Cloud Firestore tests may also test Cloud Functions, indirectly.

In our `test:userInfo` sample, writing to one collection causes a change in another, via the Cloud Functions. This normally takes ~150ms, even when locally emulated. Jest does not natively support such "wait-until" tests, but we made it do it, anyways.

Like this:

```
import { dbUnlimited, eventually } from 'firebase-jest-testing'

# First, write to the collection. 'db' is the normal Cloud Firestore handle.
await dbUnlimited.collection("userInfo").doc("abc").set(william);

# Wait for the other collection to change
await expect( eventually( _ => shadow.get("abc") ) ).resolves.toContainObject(william);
```

The approach we've taken in `sample/test-fns/userInfo.test.js` is that there's a `shadow` object that tracks changes to the target collection, and the test tracks changes to the object.

This is just one way. You can code your tests like this, or differently, but `eventually` should still be useful.

### No `never`

We tried to make a `never` to compliment `eventually`, but this turned out difficult, with Jest.

Instead, the approach for now is this:

```
await sleep(200).then( _ => expect( shadow.keys() ).not.toContain("xyz") );
```

`sleep` is a Promise that resolves after some milliseconds and then runs your expectation.

This is error prone, and we'd rather use the test's own timeout than an arbitrary sleep. Let us know if you know a way to do it! :)



## Testing Security Rules

Testing security rules can be done on static (immutable) data. The tests are not concerned of changing the data - just knowing whether changes *would* get through.

We enable this approach, by making a layer above the Cloud Firestore access functions that quickly turns data back if it happened to change. This works as long as all access to the data is via the `dbReadOnly` objects.

The tests can now be written in a simpler way, since you don't have to worry about state.


```
import { dbAuth } from 'firebase-jest-testing/firestoreTestingReadOnly'
```

This provides a `firebase.firestore.Firestore` -like interface (not the full thing!) that can be used to instantiate multiple access profiles:

```
{
  collection: collectionPath => {
    as: string|null => firebase.firestore.CollectionReference -like
  }
}
```

Check the samples for how this can be used.

You can now use the provided `CollectionReference`-like handle in the normal Firebase API fashion (`.get`, `.where`, `.set`, `.delete`, ...):

```
expect( unauth_invitesC.get() ).toDeny()
```

### `.toDeny()` and `.toAllow()` 

These are Jest extensions, originally introduced by Jeff Delaney in Oct 2018: [Testing Firestore Security Rules With the Emulator](https://fireship.io/lessons/testing-firestore-security-rules-with-the-emulator/).

Their use is self-explanatory. You have a Promise that should pass the security rules? `expect` it `.toAllow()`. It should not? `.toDeny()`.

The implementation checks for exceptions unrelated to Security Rules and throws those as normal exceptions.

### Parallelism - `Promise.all` or not?

Since the underlying data is immutable in nature, you can parallelize any and all of your Security Rules tests.

However, in practise it does not seem to matter much whether one runs 4 tests in parallel (`Promise.all`), or as subsequent `await`s. 

When your tests fail, it may in fact be easier to debug when the execution is happening one-by-one. All of this is **on you** and not enforced by the testing library.


## Priming with data

It seems like a good idea to have static data that gets "primed" to the database, before exercising tests on it. We make this easy by:

```
import { docs } from './docs.js'
import { prime } from 'firebase-jest-testing'

await prime(docs);
console.info("Primed :)");
```

The data is stored as JSON (here as an ES module). This allows one to craft such data by hand, in an editor. In comparison, the Firebase import/exports are binary snapshots. Of course, you can use that approach in your tests just as well - we just provide the JSON alternative.


## WARNING: Use of dates in `docs.js`

Firebase clients take JavaScript `Date` objects and convert them to Cloud Firestore's `Timestamp`, automatically.

HOWEVER, `Date.now()` and `Date.parse` do <u>not</u> produce Date objects but Unix epoch numbers, so be warned.

||expression|value|
|---|---|---|
|Current time|`new Date()`|Mon Aug 24 2020 17:16:58 GMT+0300|
||<strike>`Date.now()`</strike>|1598278705728|
|Specific time|`new Date('27 Mar 2020 14:17:00 GMT+0300')`|Fri Mar 27 2020 13:17:00 GMT+0200|
||<strike>`Date.parse('27 Mar 2020 14:17:00 GMT+0300')`</strike>|1585307820000|

>Note: One could detect such inconsistencies automatically, with Security Rules. But the priming happens bypassing them, so that would not really work. Just be cautious, and check this out if you experience problems in the tests with some date field.
