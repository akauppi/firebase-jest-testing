import { storageAdmin } from "./storageAdmin.js"

function bucket() {
  return storageAdmin.bucket();
}

export {
  bucket,
}
