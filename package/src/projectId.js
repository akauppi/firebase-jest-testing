/*
* src/firestore/projectId.js
*
* Dig the Firebase projectId (needed for accessing Firestore data).
*
* Our means:
*   - 'GCLOUD_PROJECT' env.var. set by 'firebase emulators:exec', automatically
*   - For 'firebase emulators:start', setting that env.var. explicitly. For us, it's 'bunny' (name doesn't matter);
*     application projects can use `GCLOUD_PROJECT=$(firebase use)` so they use the project's actual id.
*/
let projectId = process.env["GCLOUD_PROJECT"];

if (!projectId) {
  const msg = "No 'GCLOUD_PROJECT' env.var. set. PLEASE set it explicitly, e.g. like: 'GCLOUD_PROJECT=$(firebase use)'";

  console.error(msg);
  throw new Error(msg);
}

export {
  projectId
}
