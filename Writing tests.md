# Writing Tests

## Testing Security Rules

For testing security rules, the library provides an *immutable* way of testing Firestore operations. This means your test data is not modified - you merely get the information whether it *would* be modified, by such operation and authentication. 

Because of this, the tests can now be written in a simpler way, since you don't have to worry about state.

```
import { dbAuth } from 'firebase-jest-testing/firestoreReadOnly'
```

>Note: The operations are not *really* read-only because the Firestore interface doesn't support it. What we do is revert the operations if they succeed, and serialize the access so that they become atomic. This allows one to run Jest rules tests in parallel, if needed.

`dbAuth` provides a `firebase.firestore.Firestore` -like interface (not the full thing!) that can be used to get a collection handle:

```
{
  collection: collectionPath => {
    as: string|null => firebase.firestore.CollectionReference -like
  }
}
```

Authentication (or setting the access role) happens at the *collection* level. An example:

```
describe("'/invites' rules", () => {
  let unauth_invitesC, auth_invitesC, abc_invitesC, def_invitesC;

  beforeAll( async () => {
    try {
      const coll = dbAuth.collection('invites');   // root collection

      unauth_invitesC = coll.as(null);
      auth_invitesC = coll.as({uid:'_'});
      abc_invitesC = coll.as({uid:'abc'});
      def_invitesC = coll.as({uid:'def'});

      assert(unauth_invitesC && auth_invitesC && abc_invitesC && def_invitesC);
    }
    catch (err) {
      console.error( "Failed to initialize the Firebase database: ", err );   // not seen
      throw err;
    }
  });

  ...
```

The `coll.as({uid:...})` allow you to get multiple handles where *both* the collection and the role using it are defined.

Note that the now taken order of *collection first* is simply an API decision. This style seems to match practical use cases (like above) better than the reverse - or setting both at once.

You can now use the provided `CollectionReference`-like handles in the normal `firebase-admin` fashion (`.get`, `.where`, `.set`, `.delete`, ...):

```
expect( unauth_invitesC.get() ).toDeny()
```

### `.toDeny()` and `.toAllow()` 

These are Jest extensions, originally introduced by Jeff Delaney in Oct 2018: [Testing Firestore Security Rules With the Emulator](https://fireship.io/lessons/testing-firestore-security-rules-with-the-emulator/).

Their use is self-explanatory. You have a Promise that should pass the security rules? `expect` it `.toAllow()`. It should not? `.toDeny()`.

The implementation checks for exceptions unrelated to Security Rules and throws those as normal exceptions.

### `Promise.all` - or not?

You can parallelize any and all of your Security Rules tests.

However, in practise it does not seem to matter much whether one runs 4 `expect`s in parallel (`await Promise.all(...)`), or as sequential `await`s. Theoretically the first one is cooler, but when your tests fail, it may in fact be easier to debug when the execution is happening one-by-one. The choice is yours.


## Testing Cloud Function events

Your Cloud Firestore tests may also test Cloud Functions, indirectly.

In the `test:userInfo` [sample](sample/test-fns/userInfo.test.js), writing to one collection causes a change in another, via the Cloud Functions. This normally takes ~150ms, even when locally emulated. Jest does not natively support such "wait-until" tests, but we made it do it, anyways.

Like this:

```
import { dbUnlimited } from 'firebase-jest-testing/firestore'
import { eventually } from 'firebase-jest-testing/jest'

// First, write to the collection
await dbUnlimited.collection("userInfo").doc("abc").set(william);

// Wait for the other collection to change
await expect( eventually( _ => shadow.get("abc") ) ).resolves.toContainObject(william);
```

The approach taken in `sample/test-fns/userInfo.test.js` is that there's a `shadow` object that tracks changes to the target collection, and the test tracks changes to the object.

This is just one way. You can code your tests like this, or differently, but `eventually` should still be useful.

>Note: The `dbUnlimited` is the same as a `firebase-admin` Firestore handle.

### No `never`

We tried to make a `never` to complement `eventually`, but this turned out difficult, with Jest 26.

Instead, the recommended approach (for now) is:

```
await sleep(200).then( _ => expect( shadow.keys() ).not.toContain("xyz") );
```

`sleep` is a Promise that resolves after some milliseconds and then runs your expectation.

This is error prone, and we'd rather use the test's own timeout than an arbitrary sleep. Please share if you know a way to do it! :)


## Testing Cloud Function callables

Whereas the other tests are run with `firebase-admin`, here you'll need to use a [Firebase client SDK](https://github.com/firebase/firebase-js-sdk) since `firebase-admin` does not support "callables".

>Note: We *might* bring back the client support as an <u>optional</u> dependency at some point, but at the moment (Apr 2021) Firebase is transitioning from a JS 8.x client API to `@exp` (ES modules based) API. We'll likely let this transitioning pass before taking a stand. Until then, please copy-paste the below code to your liking.

---

>❗️Warning! At the time of writing (Apr 2021), using the below sample code makes the tests *never* to return to the command line. Using the earlier 8.x API approach works. Check the `sample/test-fns/greet.8x.test.js` code. We'll report the problem to Firebase and hopefully it'll be soon over also on the `@exp` (modular) API.

---

Snippet from [sample/test-fns/greet.test.js](sample/test-fns/greet.test.js):

```
function fail(msg) { throw new Error(msg); }

// Client SDK (not 'firebase-admin')
//
import { initializeApp, deleteApp } from '@firebase/app'
import { getFunctions, useFunctionsEmulator, httpsCallable } from '@firebase/functions'

let myApp;
let fns;

const FUNCTIONS_EMULATOR_PORT= 5002;
const projectId = process.env["GCLOUD_PROJECT"] || fail("No 'GCLOUD_PROJECT' env.var.");

beforeAll( () => {
  myApp = initializeApp({
    projectId,
  }, "testing");

  fns = getFunctions(myApp);
  useFunctionsEmulator(fns, "localhost", FUNCTIONS_EMULATOR_PORT );
});

afterAll( () => {
  deleteApp(myApp);
} );
```

*If the code snippet above doesn't work, check the sources.*


## Priming with data

It seems like a good idea to have static data that gets "primed" to the database, before exercising tests on it. We make this easy by:

```
import { docs } from './docs.js'
import { prime } from 'firebase-jest-testing/firestore'

await prime(docs);
console.info("Primed :)");
```

The data is stored as JSON (here as an ES module). This allows one to craft such data by hand, in an editor.

>Note: Firebase provides means to import/export the Firestore contents as a binary file. If you prefer that methods, you can naturally keep using it.


### WARNING: Use of dates in `docs.js`

Firebase clients take JavaScript `Date` objects and convert them to Cloud Firestore's `Timestamp`, automatically.

HOWEVER, `Date.now()` and `Date.parse` do <u>not</u> produce Date objects but Unix epoch numbers, so be warned.

||expression|value|
|---|---|---|
|Current time|`new Date()`|Mon Aug 24 2020 17:16:58 GMT+0300|
||<strike>`Date.now()`</strike>|1598278705728|
|Specific time|`new Date('27 Mar 2020 14:17:00 GMT+0300')`|Fri Mar 27 2020 13:17:00 GMT+0200|
||<strike>`Date.parse('27 Mar 2020 14:17:00 GMT+0300')`</strike>|1585307820000|

>Note: One could detect such inconsistencies automatically, with Security Rules. But the priming happens bypassing them, so that would not really work. Just be cautious, and check this out if you experience problems in the tests with some date field.


