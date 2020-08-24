/*
* src/cjs/prime.cjs
*
* Prime a project's Firestore data, in cjs.
*
* NOTE: Once Jest 'globalSetup' can use ES modules, this goes away. Use 'firebase-jest-testing/prime'.
*/
const assert = require('assert').strict;

const admin = require('firebase-admin');

const { FIRESTORE_HOST } = require("./config.cjs");

const PRIME_ROUND = !global.afterAll;   // are we called from 'globalSetup'
assert(PRIME_ROUND);

function getRandomAppName() {
  return 'app-' + new Date().getTime() + '-' + Math.random();
}

/*
* Prime with data
*
* Note: It is enough to call this once, per Jest test run (via 'globalSetup').
*/
async function prime(projectId, docs) {    // (string, { <docPath>: { <field>: <value> } }) => Promise of ()
  const appAdmin = admin.initializeApp({
    projectId
  }, getRandomAppName());

  const db = appAdmin.firestore();
  db.settings({         // affects all subsequent use (and can be done only once)
    host: FIRESTORE_HOST,
    ssl: false
  });

  const batch = db.batch();

  for (const [docPath,value] of Object.entries(docs)) {
    batch.set( db.doc(docPath), value );
  }
  await batch.commit();

  /*await*/ const ignore = appAdmin.delete();    // clean the app; data remains (free running Promise)
}

module.exports = prime;
