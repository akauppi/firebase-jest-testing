/*
* src/firestoreReadOnly/tools/jwt.js
*
* Creation of JWT token for emulated Firestore REST API.
*/

/*
* Adapted from 'rules-unit-test':
*   https://github.com/firebase/firebase-js-sdk/blob/master/packages/rules-unit-testing/src/api/index.ts
*/
function createUnsecuredJwt(uid, projectId) {   // (string, string) => string
  //assume(uid && projectId);

  const project = projectId;
  const iat = 0;

  const payload = {   // all required fields to decent defaults
    iss: `https://securetoken.google.com/${project}`,
    aud: project,
    iat: iat,
    exp: iat + 3600,
    auth_time: iat,
    sub: uid,
    user_id: uid,
    firebase: {
      sign_in_provider: 'custom',
      identities: {}
    }
  };

  const signature = '';
  return [
    btoa /*base64.encodeString*/ ( JSON.stringify(header) /*, /_*webSafe=*_/ false*/  ),
    btoa /*base64.encodeString*/ ( JSON.stringify(payload) /*,, /_*webSafe=*_/ false*/ ),
    signature
  ].join('.');
}

/*
* 'btoa' is a browser function that the '@firebase/util' library falls to with 'webSafe==false', which is what our use
* case would have.
*
* tbd. This code can be simplified, when working!!!
*/
function btoa(str) {
  let buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = Buffer.from(str.toString(), 'binary');
  }

  return buffer.toString('base64');
}

export {
  createUnsecuredJwt
}

console.log( createUnsecuredJwt('abc', 'bunny' ));

