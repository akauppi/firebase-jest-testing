/*
* test-fns/matchers/toContainObject.js
*
* From -> https://medium.com/@andrei.pfeiffer/jest-matching-objects-in-array-50fe2f4d6b98
*   (but against a single object, not array)
*
* Usage:
*   <<
*     const state = { type: 'START', data: 'foo' }
*     expect(state).toContainObject({ type: 'START' })
*     expect(state).not.toContainObject({ data: 'bar' })
*   <<
*/
expect.extend({
  toContainObject(received, expected) {   // (any, object) => { message: () => string, pass: boolean }
    const { printReceived, printExpected } = this.utils;

    const pass = this.equals(received,
      expect.objectContaining(expected)
    )

    return pass ? {
      message: () => `expected ${ printReceived(received) } not to contain object ${ printExpected(expected) }`,
      pass: true
    } : {
      message: () => `expected ${ printReceived(received) } to contain object ${ printExpected(expected) }`,
      pass: false
    }
  }
})
