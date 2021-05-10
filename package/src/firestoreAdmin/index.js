/*
* src/firestoreAdmin/index.js
*/
import { prime, init as initPrime } from "./prime.js"

function init(projectId) {
  initPrime(projectId);
}

export {
  init,
  prime
}