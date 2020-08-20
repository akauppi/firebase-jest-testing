# Track

## Jest cannot handle package `exports` ⚠️⚠️⚠️

- <strike>[jest-resolve can't handle "exports"](https://github.com/facebook/jest/issues/10422) (Jest #10422)</strike>
- [Support package exports in `jest-resolve`](https://github.com/facebook/jest/issues/9771) (Jest #9771)
- [Support ESM resolution](https://github.com/browserify/resolve/issues/222) (browserify/resolve #222)

This is a **show stopper** for us, since an application project cannot use our features.

The issues state:

>Duplicate of #9771. I haven't had time to work on ESM support in general for the last few months, and the immediate future doesn't look any more promising in that regard, unfortunately... Any help via PRs or research is of course welcome.

&nbsp;

>I chatted with @ljharb about this, and a future version of resolve will support this. So we don't have to implement anything here. Will just hook it up when resolve is released with support for it 🎉

**Direction:**

I'd rather see us (users of this repo) helping SimenB with the native resolver:

>I'm currently working on support for ESM natively in Jest, and while we have a version today that sorta works, it's not a compliant implementation. (author of Jest, 25-Apr-20)



**Work around:**

In application code (Jest tests):

```
//import { FieldValue } from 'firebase-jest-testing/firestoreTesting'
import { FieldValue } from 'firebase-jest-testing/src/firestoreTesting/index'
```

i.e. import by the filename paths under `node_modules/`. This is of course GROSE 🧟‍♀️.


## Jest allowing `globalSetup` to use `import`

We use this in `sample/test-rules/jest.config.[cm]js`:

```
  globalSetup: "./setup.jest.[cm]js"
```

Cannot use an ES module there.

Tried all kinds of `cm` combinations, either getting:

```
/Users/asko/Git/firebase-jest-testing/sample.rules/setup.jest.js:16
import { docs } from './docs.js'
^^^^^^

SyntaxError: Cannot use import statement outside a module
    at wrapSafe (internal/modules/cjs/loader.js:1172:16)
    at Module._compile (internal/modules/cjs/loader.js:1220:27)
    at Module._extensions..js (internal/modules/cjs/loader.js:1277:10)
    at Object.newLoader [as .js] (/Users/asko/Git/firebase-jest-testing/node_modules/pirates/lib/index.js:104:7)
    at Module.load (internal/modules/cjs/loader.js:1105:32)
    at Function.Module._load (internal/modules/cjs/loader.js:967:14)
    at Module.require (internal/modules/cjs/loader.js:1145:19)
    at require (internal/modules/cjs/helpers.js:75:18)
    at ScriptTransformer.requireAndTranspileModule (/Users/asko/Git/firebase-jest-testing/node_modules/@jest/transform/build/ScriptTransformer.js:676:20)
    at /Users/asko/Git/firebase-jest-testing/node_modules/@jest/core/build/runGlobalHook.js:72:27
```

..or:

```
Error [ERR_REQUIRE_ESM]: Must use import to load ES Module: /Users/asko/Git/firebase-jest-testing/sample.rules/setup.jest.mjs
    at Module.load (internal/modules/cjs/loader.js:1103:11)
    at Function.Module._load (internal/modules/cjs/loader.js:967:14)
    at Module.require (internal/modules/cjs/loader.js:1145:19)
    at require (internal/modules/cjs/helpers.js:75:18)
    at ScriptTransformer.requireAndTranspileModule (/Users/asko/Git/firebase-jest-testing/node_modules/@jest/transform/build/ScriptTransformer.js:676:20)
    at /Users/asko/Git/firebase-jest-testing/node_modules/@jest/core/build/runGlobalHook.js:72:27
    at pEachSeries (/Users/asko/Git/firebase-jest-testing/node_modules/p-each-series/index.js:8:9)
    at async _default (/Users/asko/Git/firebase-jest-testing/node_modules/@jest/core/build/runGlobalHook.js:58:5)
    at async runJest (/Users/asko/Git/firebase-jest-testing/node_modules/@jest/core/build/runJest.js:345:5)
    at async _run10000 (/Users/asko/Git/firebase-jest-testing/node_modules/@jest/core/build/cli/index.js:416:7)
```

Track:

- [Native support for ES Modules > comment on globalSetup](https://github.com/facebook/jest/issues/9430#issuecomment-653818834)


**Work around:**
 
- Do the priming of `sample/test-rules` using CommonJS - including dependencies.

 
## firebase-js-sdk #2895

- [FR: Immutability when testing Firestore Security Rules](https://github.com/firebase/firebase-js-sdk/issues/2895) 
   - let's see what Firebase authors reply
		- not a reply in 4 months #sniff 😢
	