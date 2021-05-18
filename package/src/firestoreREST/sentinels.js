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
* Returns:
*   [0]: Object with sentinel keys (and values) removed
*   [1]: Field transforms adhering to the Firestore REST API, to write values in the server side
*/
function splitSentinels(obj) {    // (object) => [object, Array of FieldTransform]
  const transforms = [];

  // Collect transforms, recursively
  //
  // prefix: "" or a string that ends in a dot ('.').
  //
  function convert(o, prefix) {   // (object, string) => object   ; side effect: collects 'transforms'

    const pairsRemain = Object.entries(o).map( ([k,v]) => {
      const transform = typeof v === 'object' && v[sentinelSymbol];    // false | undefined | [] | [transformKey, transformValue]

      if (transform) {   // some sentinel
        if (v === deleteFieldSentinel) {
          // Add no transform but set the key 'undefined' - this takes it to 'updateMask' but omits from the payload.
          return [k,undefined];

        } else {
          const [tk, tv] = transform;
          transforms.push({
            fieldPath: prefix + k,    // eg. "a.b"
            [tk]: tv
          });
          return undefined;
        }
      } else {        // normal
        if (typeof v === 'object' && v !== null && !(v instanceof Date)) {
          if (Array.isArray(v)) {
            // Sentinels within arrays skipped (are they supported by Firestore?). We could see if there are any,
            // and issue a warning. #later
            //
            return [k,v];
          } else {
            const o2 = convert(v, `${prefix}${k}.`);
            return [k,o2];
          }
        } else {
          return [k, v];
        }
      }
    }).filter(x => x);

    return Object.fromEntries(pairsRemain);
  }

  const o2 = convert(obj,"");
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
