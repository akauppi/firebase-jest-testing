/*
* src/config.js
*
* Provides access to e.g. 'firebase.json'
*/
import fs from "fs";

const fn = process.env["FIREBASE_JSON"] || './firebase.json';

const firebaseJson = JSON.parse(
    fs.readFileSync(fn, 'utf8')
);

export {
  firebaseJson
}