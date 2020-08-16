/*
* fns-test/prime-docs.js
*
* Write the data in 'docs.js' to the running emulator's Firestore instance.
*/
import { docs } from './docs.js'

//import { prime } from 'firebase-jest-testing/prime'
import { prime } from '../src/prime/index.js'

await prime(docs);
console.info("Primed :)");
