/*
* test/misc.test.js
*
* Test that both 'fns' and 'db' can be used in same tests.
*/
import { db } from '../src/db'
import { fns } from '../src/fns'

describe("Misc tests", () => {

  // We already know, since 'import' worked

  test("Both 'fns' and 'db' must be usable, in same test.", done => done());
});

