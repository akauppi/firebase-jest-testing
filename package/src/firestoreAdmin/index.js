/*
* src/firestoreAdmin/index.js
*
* Context:
*   ONLY called from within JEST Global Setup. This allows 'prime' to pick the project id as a parameter and
*   pass it on to *everything* (all tests) via an env.variable.
*/
import { prime } from "./prime.js"

export {
  prime
}