/*
* sample/.eslintrc.cjs
*
* References:
*   - Configuring ESLint
*     -> https://eslint.org/docs/user-guide/configuring
*/
const [off,warn,error] = ['off','warn','error'];

module.exports = {
  extends: [
    'eslint:recommended'
  ],

  env: {
    node: true,
    es6: true     // 'Promise'
  },

  parserOptions: {
    ecmaVersion: 2020,  // we (might) use: object spread (2018), dynamic import (2020)
    sourceType: 'module'
  },

  rules: {
    "no-constant-condition": [warn]
    //... add more above
  },

  overrides: [
    // cjs build files (including this one)
    {
      files: ["*.cjs"],    // .eslintrc.cjs
      env: {
        node: true
      },
      globals: {
        module: true
      }
    }
  ]
};
