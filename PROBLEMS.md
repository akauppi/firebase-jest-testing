# Problems

Some obstacles faced, avoiding implementation in the way that was seen as ideal. Based on Jest 26.2 and Firebase 7.17.x.


## Jest: No test timeout hook

The `expect.never` would like to turn a timeout into a pass.

Also `expect.eventually` could benefit from catching a timeout (or a moment just before), and turning the Jest timeout into a more described fail of the test.

Is there a way to do this in Jest? Likely not.

### Proposal

When a test is described, or executing, it could do:

```
/* HYPOTHETICAL API that would allow us to reject a test instead of it timing out. */
jest.onTimeout( () => {
  reject();
});
```

Jest would behave like this:

- if timing out, and one or more `onTimeout` are defined for the test
  - call those functions
  - leave the actual timing out to a teeny bit later (`setTimeout({...},0)` or similar)
    - that code should still check whether the test has passed/failed, since it's possible calling the `onTimeout` has caused this.
    
This would allow the timeouts, and Promises created by them, to run before the test really times out.

This allows the `onTimeout` body to turn the test into a pass or fail, if it so wishes, using the normal Jest mechanisms (resolving or rejecting a pending Promise, for example).

**Work-arounds:**

In Jest, there is the default test timeout but each test can also separately get an override, as the last parameter. It would be natural for the developer to descibe the timeout for a `expect.never` using this mechanism, instead of needing to learn a new one.

However, the currently running test does not seem to have access to its timeout parameter.

If this was provided, the test library could emulate the `onTimeout` by setting a timer a bit before. This is not very accurate, so actually having an `onTimeout` hook feels better.

In the absence of knowing the test's timeout, a further parameter could be given to `expect.never`. This feels wrong, so not going there.

The "after approach" of using a timed Promise and checking the expectation once (no extension to Jest) is currently the preferred approach, in the opinion of the author.

```
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

test("Some"), () => {
  ...
  
  await sleep(300).then( expect(...condition...) );
});
```

This is clear and simple, but brings its own timeout parameter. We *can* improve the developer experience if an `onTimeout` hook were provided by Jest.


## Firebase: ES module packaging not compatible with node.js

Firebase 7.18.0 packaging:

```
$ cat node_modules/firebase/app/package.json 
{
  "name": "firebase/app",
    "main": "dist/index.cjs.js",
    "browser": "dist/index.cjs.js",
    "module": "dist/index.esm.js",
    "typings": "../index.d.ts"
}
```

The ESM version is pointed to by the `module` field. This is a convention used in bundlers but seems to be going away. E.g. node.js ignores the `module` field.

[Dual CommonJS/ES modules packages](https://nodejs.org/api/esm.html#esm_dual_commonjs_es_module_packages) (Node.js docs; v.14.8) tells, how dual packaging should be done.


**Work around:**

Load modules directly from the file system:

```
// Instead of:
//import * as firebase from 'firebase/app'
//import "firebase/firestore"

import firebase from 'firebase/app/dist/index.cjs.js'
import "firebase/firestore/dist/index.cjs.js"
```


## Node: self-referencing the package by its name - not working

[Self-referencing a package using its name](https://nodejs.org/api/esm.html#esm_self_referencing_a_package_using_its_name) (node.js docs) should be possible, but does not work for us.

With `sample/test-rules/*test.js` having:

```
import { another } from 'firebase-jest-testing';
```

<!-- (actual sample is:
import { dbAuth, FieldValue } from 'firebase-jest-testing/firestoreTestingReadOnly';
) -->

..running the test gives:

```
Determining test suites to run...Data cleared for projectId 'rules-test'.
 FAIL  sample.rules/visitedC.test.js
  ● Test suite failed to run

    Cannot find module 'firebase-jest-testing' from 'visitedC.test.js'

      at Resolver.resolveModule (../node_modules/jest-resolve/build/index.js:307:11)
```

Could it be that...

- since we're running the code from a sample (not `src`), it does not work? Tried adding `sample.rules` to `package.json: files` but the same.
- Jest somehow isn't compatible with node's "self-referencing" setup?
- Something else?

node.js 14.8.0

**Work around:**

Use relative `../src/..` paths in import.

```
import { dbAuth, FieldValue } from '../src/firestoreTestingReadOnly.js';
```

- Doesn't work so well as a sample.
- Bypasses the `exports` mapping. :(((
- Dependent on directory structure.


## Firebase: where to place project files?

In a normal Firebase project, the `firebase.json` and `.firebaserc` files are in the root.

Here are examples:

**firebase.json**

```
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "emulators": {
    "firestore": {
      "port": "6768"
    }
  }
}
```

**.firebaserc**

```
{
  "projects": {
    "abc": "vue-rollup-example"
  }
}
```

>Note: It also seems, these must be in the same folder.

If we place them in the root, that limits the number of possible samples to 1, so we've placed them in the subdir.

But ideally, we'd like not to have them. At all. Please...

The short idea the author has is that the launch and configuration of the emulator should be separated from the configuration of the sources. This could be done e.g. by:

- allow command line arguments to steer the emulator. All of it. Now most details (e.g. rules or not) can only be provided via the configuration file. This would make `firebase.json`'s (we have two of them) disappear.
- expose the running emulator(s) settings in a (new) REST API. This way, code could sniff the settings instead of trying to parse the configuration files that steer Firebase. 

The current situation seems to be "in flux" (`firebase` 8.7.0). An overhaul of how emulation is configured would make this side of the development experience as simple as the API side of the various Firebase products is.

<font size="+7">💐</font>

