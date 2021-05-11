/*
* src/rules-unit-testing/createUnsecuredJwt.js
*
* Adapted from:
*   https://github.com/firebase/firebase-js-sdk/blob/master/packages/rules-unit-testing/src/api/index.ts
*
* Note: This file is under the Apache 2.0 license.
*
* We do not wish to depend on '@firebase/rules-unit-testing' because it brings the client side JS SDK and getting one
* restricts the users to either 8.x or 9.x API.
*/

// Note: Since we're kind of in third party code area here, 'projectId' is provided, not imported from '../config.js'.

/*
* Changes from 'rules-unit-testing':
*   - Typescript types commented out
*   - Reduced token options
*
* References:
*   - firebase-js-sdk > util > emulators.ts [1]
*     -> https://github.com/firebase/firebase-js-sdk/blob/ac4ad08a284397ec966e991dd388bb1fba857467/packages/util/src/emulator.ts#L36
*
*     Describes the use of token fields, under emulation (eg. that 'iss' is "always set to 'https://securetoken.google.com/{projectId}').
*/
function createUnsecuredJwt(uid, projectId) {   // (string, string) => string
  // Unsecured JWTs use "none" as the algorithm.
  const header = {
    alg: 'none',
    kid: 'fakekid',
    type: 'JWT'
  };

  const iat = 0;  // "token issue time, in seconds since epoch"

  const payload = {   // all required fields to decent defaults
    iss: `https://securetoken.google.com/${projectId}`,   // always like this (see [1])
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

  return [
    encode( JSON.stringify(header) ),
    encode( JSON.stringify(payload) ),
    ''    // Unsecured JWTs use the empty string as a signature.
  ].join('.');
}

/*
* Note: Node >= 16.0 has 'buffer.btoa' for "compatibility with legacy web platform APIs", but it's just a wrapper around
*   '<Buffer>.toString('base64')', which the documentation suggests to use.
*/
function encode(str) {
  const buffer = Buffer.from(str, 'binary');
  return buffer.toString('base64');
}

export {
  createUnsecuredJwt
}
