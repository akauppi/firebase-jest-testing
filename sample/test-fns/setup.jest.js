/*
* sample/test-fns/setup.jest.js
*
* Sets the data for functions tests.
*/
import { docs } from './docs.js'

import { prime } from 'firebase-jest-testing/firestoreAdmin/setup'

//import { debug as debugGen, enable } from 'debug'   // ESM API (fictional)
const { debug: /*as*/ debugGen, enable } = await import('debug').then( mod => mod.default );    // CommonJS API only
//
const dSetup = debugGen('test-fns:setup');
//enable('test-fns:*');

// Note: start with 'demo-' so that Firebase Emulators treat it as a fully "offline" project [1].
//    [1] -> https://firebase.google.cn/docs/emulator-suite/connect_functions?hl=en&%3Bauthuser=3&authuser=3#choose_a_firebase_project
//
const projectId = "demo-1"    //was: "fns-test";    // must be lower case

const setup = async _ => {

  dSetup('Starting global setup');
  await prime(projectId, docs);

  dSetup('Global setup: done');   // 2s (DC); 747, 538 ms (native)
}

export default setup;
