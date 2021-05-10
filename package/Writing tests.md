# Writing Tests

## Testing Security Rules

For testing security rules, the library provides an *immutable* way of testing Firestore operations. This means your test data is not modified - you merely get the information whether it *would* be modified, by such operation and authentication.

The tests are run in a separate Firebase app (`rules-test`), to not overlap with other use of the emulator.

Because of these implementation details, the tests can now be written in a simpler way, since you don't have to worry about state.

```
import { collection } from 'firebase-jest-testing/firestoreRules'
```

The API is fashioned after the upcoming [modular `firebase-admin` Node.js SDK](https://modular-admin.web.app/get-started/quick-start). It is, however, completely unattached.

### `collection`

`collection` is a `CollectionRef` -like interface (not the full thing!):

```
{
  collection: collectionPath => {
    as: string|null => _: CollectionReference -like
  }
}
```

Authentication (or setting the access role) happens at the *collection* level. An example:

```
describe("'/invites' rules", () => {
  let unauth_invitesC, auth_invitesC, abc_invitesC, def_invitesC;

  beforeAll( () => {
    const coll = collection('invites');

    unauth_invitesC = coll.as(null);
    auth_invitesC = coll.as('_');
    abc_invitesC = coll.as('abc');
    def_invitesC = coll.as('def');
  });

  ...
```

>Note: the now taken order of *collection first* is simply an API decision. This style seems to match practical use cases (like above) better than the reverse, where role setting would be last. But we can offer choices in the future, if use cases warrant it.

You can now use the provided `CollectionReference`-like handles in the normal `firebase-admin` fashion:

```
expect( unauth_invitesC.get() ).toDeny()
```

|method|description|
|---|---|
|`.get()`|Check whether reading a random document within the collection is allowed.|
|`.get(docName)`|Check whether reading a specific document is allowed. Same as `.doc(docName).get()`.|
|`.doc(docName)`|Get a `DocumentReference`-like handle.| 

### `DocumentReference`-like

|method|description|
|---|---|
|`.get()`|Check whether reading the document is allowed.|
|`.set(any)`|Check whether writing the document, with the provided data, is allowed.|
|`.delete()`|Check whether deleting the document is allowed.|

>Note that Security Rules can reject access based on incoming or existing data, or the combination thereof. This is why the primed contents of your docs matter, as does the contents of your `set` calls.



### `serverTimestamp`

Where you would use `FieldValue.serverTimestamp()`, do:

```
import { serverTimestamp, ... } from 'firebase-jest-testing'
...

const doc = {
  someTime: serverTimestamp()
}  
```

i.e. we skip the `FieldValue` in the API, but otherwise it's familiar.


### `.toDeny()` and `.toAllow()` 

These are Jest extensions, originally introduced by Jeff Delaney in Oct 2018: [Testing Firestore Security Rules With the Emulator](https://fireship.io/lessons/testing-firestore-security-rules-with-the-emulator/).

Their use is self-explanatory. You have a Promise that should pass the security rules? `expect` it `.toAllow()`. It should not? `.toDeny()`.

<!-- disabled
The implementation checks for exceptions unrelated to Security Rules and throws those as normal exceptions.
-->

### `Promise.all` - or not?

In practise it does not seem to matter much whether one runs 4 `expect`s in parallel (`return Promise.all([ ... ])`), or as sequential `await`s. Theoretically the first one is cooler, but when your tests fail, it may in fact be easier to debug when the execution is happening one-by-one. The choice is yours.

*Suggestions on making this less boilerplaty are welcome.*


## Testing Cloud Function events

Your Cloud Firestore tests may also test Cloud Functions, indirectly.

In the `test:userInfo` [sample](https://github.com/akauppi/firebase-jest-testing/blob/master/sample/test-fns/userInfo.test.js), writing to one collection causes a change in another, via the Cloud Functions. This normally takes ~150ms, even when locally emulated. Jest does not natively support such "wait-until" tests, but we made it do it, anyways.

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

>Note: The `dbUnlimited` is the same as a `firebase-admin` Firestore handle. We've just taken care of emulation setup for your tests.

### No `never` 😥

We tried to make a `never` to complement `eventually`, but this turned out difficult, with Jest 26.

Instead, the recommended approach (for now) is:

```
await sleep(200).then( _ => expect( shadow.keys() ).not.toContain("xyz") );
```

`sleep` is a Promise that resolves after some milliseconds and then runs your expectation.

This is error prone, and we'd rather use the test's own timeout than an arbitrary sleep. Please share if you know a way to do it! :)

>*This may require support in the Jest side??=*


## Testing Cloud Function callables

Whereas the other tests are run with `firebase-admin`, here you'll need to use a [Firebase client SDK](https://github.com/firebase/firebase-js-sdk) since `firebase-admin` does not support "callables".

>Note: We *might* bring back the client support as an <u>optional</u> dependency at some point, but at the moment (Apr 2021) Firebase is transitioning from a JS 8.x client API to `@exp` (ES modules based) API. We'll likely let this transitioning pass before taking a stand. Until then, please copy-paste the below code to your liking.

<!-- 2c
Another way could be to run httpsCallables from REST API? Should be possible.
-->

Snippet from [sample/test-fns/greet.test.js](https://github.com/akauppi/firebase-jest-testing/blob/master/sample/test-fns/greet.skip-test.js):

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

To run tests - even testing Security Rules - you need some seed data in Firestore. Such data is often hand crafted alongside the tests, and reading it from a `.js` file seems like a good idea.

```
import { docs } from './docs.js'
import { prime } from 'firebase-jest-testing/firestore'

await prime(docs);
console.info("Primed :)");
```

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


