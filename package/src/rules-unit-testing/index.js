/*
* src/rules-unit-testing/index.js
*
* Adapted from:
*   https://github.com/firebase/firebase-js-sdk/blob/master/packages/rules-unit-testing/src/api/index.ts
*
*   - Typescript types commented out
*
* Note: This file is under the Apache 2.0 license.
*
* We do not wish to depend on '@firebase/rules-unit-testing' because it brings the client side JS SDK and getting one
* restricts the users to either 8.x or 9.x API.
*/

function createUnsecuredJwt(uid, projectId) {   // (string, string) => string
  // Unsecured JWTs use "none" as the algorithm.
  const header = {
    alg: 'none',
    kid: 'fakekid',
    type: 'JWT'
  };

  const iat = 0;

  const payload = {   // all required fields to decent defaults
    iss: `https://securetoken.google.com/${projectId}`,   // hmm.. how does this fare with emulation (we are only run under emulation) tbd.
    aud: projectId,
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

  // Unsecured JWTs use the empty string as a signature.
  const signature = '';
  return [
    btoa /*base64.encodeString*/ ( JSON.stringify(header) /*, webSafe= false*/ ),
    btoa /*base64.encodeString*/ ( JSON.stringify(payload) /*, webSafe= false*/ ),
    signature
  ].join('.');
}

/*
* 'btoa' is a browser function that the '@firebase/util' library falls to with 'webSafe==false', which is what our use
* case would have.
*
* Note: It is available in Node >= 16.0 (for "compatibility with legacy web platform APIs"). However, we don't wish
*   to abandon Node 14 support, just yet.
*/
function btoa(str) {
  let buffer;

  if (str instanceof Buffer) {    // note: we likely don't have the parameter a 'Buffer', ever.
    buffer = str;
  } else {
    buffer = Buffer.from(str.toString(), 'binary');
  }

  return buffer.toString('base64');
}

export {
  createUnsecuredJwt
}

