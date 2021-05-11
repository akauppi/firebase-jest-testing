/*
* src/firestoreRules/sentinels.js
*
* Collection of sentinels for Firestore.
*
* We use our own API-side tricks here. The way Firebase web client does this seems overly complicated (not sure, why).
*/

// Used as normal in Firestore APIs (with '()'). In our code, it's checked by reference - thus no overlap with objects.
//
const serverTimestampSentinel = {}

/* others:
  increment,
  arrayRemove,
  arrayUnion,
  deleteField
*/

export {
  serverTimestampSentinel
}