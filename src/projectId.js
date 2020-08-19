/*
* src/projectId.js
*
* Dig the Firebase projectId (needed for showing Firestore data in the Emulator UI).
*/
const projectId = process.env["GCLOUD_PROJECT"];

if (!projectId) {
  const msg = "'GCLOUD_PROJECT' env.var. not set - we need it or you won't see any data.";
  console.fatal(msg);
  throw new Error(msg);
}

export {
  projectId
}
