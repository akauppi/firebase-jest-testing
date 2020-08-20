/*
* src/projectId.js
*
* Dig the Firebase projectId (needed for showing Firestore data in the Emulator UI).
*
* Our means:
*   1. 'GCLOUD_PROJECT' env.var. set by 'firebase emulators:exec', automatically
*
*     For other use, setting as 'GCLOUD_PROJECT=$(firebase use)' is recommended at the app level: this causes the
*     process to be launched only once.
*
*   2. (fallback) Run 'firebase use' and parse its output.   <-- we may discontinue this!
*/
import { strict as assert } from 'assert'
import { spawnSync } from 'child_process'

let projectId = process.env["GCLOUD_PROJECT"];

if (!projectId) {
  console.warn("No 'GCLOUD_PROJECT' env.var. We'll detect the active project, but it is RECOMMENDED that you use 'GCLOUD_PROJECT=$(firebase use)' to run the command only once.");

  /*
  * 'firebase use' behaves differently when launched from the terminal, or from a program.
  *
  * Terminal:
  * <<
  * $ firebase use
  * Active Project: abc (vue-rollup-example)
  * ...
  * <<
  *
  * Program:
  * <<
  *     vue-rollup-example\n
  * <<
  *
  * Q: Is this a documented behaviour?
  *
  * Note: Running 'firebase use' takes ~1s (which will happen once per test, unless the developer gives 'GCLOUD_PROJECT' to us).
  */
  const { status, stdout, error } =
    spawnSync('firebase', ['use'], { timeout: 5000, maxBuffer: 9999, encoding: 'utf8' });

  if (status !== 0) {
    throw new Error(`Running 'firebase use' failed (status=${status}): ${error}`);
  }
  assert(!error);

  projectId = stdout.split('\n')[0];    // first (and only) line, without terminating newline
}

export {
  projectId
}
