/*
* Emulation support for 'readOnly.js'
*
* We provide the illusion of a Firestore API that simply doesn't change the underlying contents.
*
* Note: Jest executes tests in sequence (within a file) but we should be prepared to handle multiple tests running
*     in parallel. These are in separate JavaScript contexts (courtesy Jest architecture). Thus, any locking needs
*     to be in the OS level, spanning all Jest contexts (since they use the same data).
*/

const DEBUG = false;  // switch tracing on/off

/*
* Provide a 'firebase.firestore.CollectionReference'-like object to test Firestore Security Rules - with the illusion
* that the data does not change.
*
* Note: In reality, an accepted change gets through. It is immediately revoked.
*/
function emul(collAdmin, collAuth) {   // (CollectionReference, CollectionReference, { uid: string }|null) => 'firebase.firestore.CollectionReference' -like

  return {    // firebase.firestore.CollectionReference -like object
    get: () => collAuth.get(),

    doc: (docPath) => {
      const authD = collAuth.doc(docPath);    // can be used for 'get'
      const adminD = collAdmin.doc(docPath);    // for reading & writing back

      return {  // firebase.firestore.DocumentReference -like object

        // Note: Also gets need to be locked, so that one test wouldn't write to a collection (and succeed) while
        //    another one reads.
        //
        //    We return 'Promise of ()' from 'get'; the purpose is just to test whether reads are allowed.
        //    Use '._dump()' to get the actual data.
        //
        get:    () => SERIAL_op( "GET", adminD, () => authD.get().then( _ => null ), false ),
        set:    o => SERIAL_op( "SET", adminD, () => authD.set(o) ),
        update: o => SERIAL_op( "UPDATE", adminD, () => authD.update(o) ),
        delete: () => SERIAL_op( "DELETE", adminD, () => authD.delete() ),
        //
        _dump:  () => SERIAL_op( "GET", adminD, () => authD.get().then( snap => snap.data() ), false )
      }
    }
  };
}

//--- private ---

const mutex = {
  claim() {
    //...
  },
  release() {
    //...
  }
}

/*
* Carry out one get/set/update/delete, preventing other operations from touching the same document, while we're in.
*/
async function SERIAL_op(opDebug, adminD, realF, restore = true) {   // (string, DocumentReference, () => Promise of any, false|undefined) => Promise of any
  const fullDocPath = adminD.path;

  await mutex.claim();    // LOCKED

  let was;
  try {
    if (DEBUG) console.debug('>> IN', opDebug, fullDocPath);
    was = restore ? undefined : await adminD.get();   // undefined | firebase.firestore.DocumentSnapshot
    return await realF();
  }
  catch (err) {
    // "Permission denied" are normal. Other exceptions may happen at the Firebase protocol level, and Jest did not
    // necessarily report them (this may have changed).
    //
    // For now, make sure we catch them. e.g. (seen in the wild):
    //    <<
    //      Response deserialization failed: invalid wire type 7 at offset 8
    //    <<
    //
    if (err.name === "FirebaseError" && err.code === "permission-denied") {
      // nothing
    } else {
      console.fatal("UNEXPECTED exception within Firebase operation:", err);
    }
    throw err;    // pass on; matchers may filter them and Jest reports the rest.
  }
  finally {
    if (was) {
      try {
        const o = was.data();   // Object | undefined
        await o ? adminD.set(o) : adminD.delete();
      }
      catch (err) {
        console.fatal("UNEXPECTED exception within Firebase restore - it may have failed!", err);   // not seen
        throw err;
      }
      finally {
        mutex.release();
      }
    }
  }
}

export {
  emul
}
