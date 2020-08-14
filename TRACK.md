# Track

## Jest allowing `globalSetup` to use `import`

We use this in `sample.rules/jest.config.[cm]js`:

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
 
- Do the priming of `sample.rules` using CommonJS - including dependencies.

 
## firebase-js-sdk #2895

- [FR: Immutability when testing Firestore Security Rules](https://github.com/firebase/firebase-js-sdk/issues/2895) 
   - let's see what Firebase authors reply
		- no reply in 3 months #sniff 😢
	