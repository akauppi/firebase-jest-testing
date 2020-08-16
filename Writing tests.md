# Writing tests

You can see the [sample/test-fns](sample/test-fns) tests for practical samples. This serves as a quick reference.

## Testing Cloud Function callables

```
import { fns } from 'firebase-jest-testing'

fns.httpsCallable(...);
```

In short, you get straight to the Cloud Functions; no need to initialize Firebase application and/or set it up for emulation.


## Priming with data

It seems like a good idea to have static data that gets "primed" to the database, before exercising tests on it. We make this easy by:

```
import { docs } from './docs.js'   # your docs
import { prime } from 'firebase-jest-testing'

await prime(docs);
console.info("Primed :)");
```

The data is stored as JSON (here as ES module, but you can read pure JSON also with `--experimental-json-modules` node flag). This allows one to craft such data by hand, in an editor. In comparison, the Firebase import/exports are binary snapshots. Of course, you can use that approach in your tests just as well - we just provide the JSON alternative.


## Testing Cloud Firestore

Your Cloud Firestore tests may also test Cloud Functions, indirectly.

In our `test:userInfo` sample, writing to one collection causes a change in another, via the Cloud Functions. This normally takes ~150ms, even when locally emulated. Jest does not natively support such "wait-until" tests, but we made it do it, anyways.

Like this:

```
import { db, eventually } from 'firebase-jest-testing'

# First, write to the collection. 'db' is the normal Cloud Firestore handle.
await db.collection("userInfo").doc("abc").set(william);

# Wait for the other collection to change
await expect( eventually( _ => shadow.get("abc") ) ).resolves.toContainObject(william);
```

The approach we've taken in `sample/userInfo.test.js` is that there's a `shadow` object that tracks changes to the target collection, and the test tracks changes to the object.

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

*<font color=red>This section is not implemented yet, but here's the approach.</font>*

Testing security rules can be done on static (immutable) data. The tests are not concerned of changing the data - just knowing whether changes *would* get through.

We enable this approach, by making a layer above the Cloud Firestore access functions that quickly turns data back if it happened to change. The tests can then be written in a simpler way, since you don't have state, at all.

... tbd. code

```
```

### WARNING: Use of dates in `data.js`

Firebase clients can take JavaScript `Date` objects and convert them to its `Timestamp` automatically.

HOWEVER, `Date.now()` and `Date.parse` do <u>not</u> produce Date objects but Unix epoch numbers, so be warned.

||Use|<font color=red>Don't use!</font>|
|---|---|---|
|Current time|`new Date()`|<strike>`Date.now()`</strike>|
|Specific time|`new Date('27 Mar 2020 14:17:00 EET')`|<strike>`Date.parse('27 Mar 2020 14:17:00 EET')`</strike>|

*Note: One could detect these automatically by applying the access rules also to the admin setup. That would catch the discrepancies when priming data.*


