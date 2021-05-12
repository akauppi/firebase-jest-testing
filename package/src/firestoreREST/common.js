/*
* src/firestoreREST/common.js
*/
import {FIRESTORE_HOST, projectId} from '../config'

const path_v1 = `http://${FIRESTORE_HOST}/v1/projects/${projectId}/databases/(default)/documents`;

export {
  path_v1
}