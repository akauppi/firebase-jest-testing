/*
* src/firestoreREST/sentinels.js
*
* Collection of sentinels for Firestore.
*
* Firestore REST API uses a transforms concept instead of shipping sentinel objects across the wire. Not really sure, why;
* it seems unnecessarily complicated.
*/
import { arrayValue } from './commit'

const sentinelSymbol = Symbol("sentinel");

// Used as normal in Firestore APIs (with '()'). In our code, it's checked by reference - thus no overlap with objects.
//
const serverTimestampSentinel = {
  [sentinelSymbol]: ["setToServerValue", 'REQUEST_TIME']
}

// This is a special case. It's used in the Firestore client API but doesn't have a corresponding value on the wire.
// What happens is the sentinel gets removed from the main payload, is still in the 'updateMask' and thus gets removed
// in the server end.
//
const deleteFieldSentinel = {
  [sentinelSymbol]: []   // create no transforms
}

function arrayRemove(...args) {    // (Value [, ...])
  return {
    [sentinelSymbol]: ["removeAllFromArray", arrayValue(args)]
  }
}

function arrayUnion(...args) {    // (Value [, ...])
  return {
    [sentinelSymbol]: ["appendMissingElements", arrayValue(args)]
  }
}

/*
* Split sentinels for the 'commit' REST API.
*
* Note: Currently does a shallow scan, but can be implemented as recursive if needed.
*
* Returns:
*   [0]: Object with sentinel keys (and values) removed
*   [1]: Field transforms adhering to the Firestore REST API, to write values in the server side
*/
function splitSentinels(o) {    // (object) => [object, Array of FieldTransform]
  const transforms = [];

  const pairsRemain = Object.entries(o).map( ([k,v]) => {
    const transform = typeof v === 'object' && v[sentinelSymbol];    // false | undefined | [] | [transformKey, transformValue]

    if (transform) {   // some sentinel
      const [tk,tv] = transform;

      if (tk) {
        transforms.push({
          fieldPath: k,   // note: if doing recursive, we must prepend the field paths
          [tk]: tv
        });
      }
      return undefined;
    } else {        // normal
      return [k,v];
    }
  }).filter(x => x);

  const o2 = Object.fromEntries(pairsRemain);
  return [o2,transforms];
}

export {
  serverTimestampSentinel,
  deleteFieldSentinel,
  arrayRemove,
  arrayUnion,

  // for 'commit.js'
  splitSentinels
}
