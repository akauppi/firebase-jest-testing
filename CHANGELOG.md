# Changelog

## 22-Aug-21 (packaging/testing changes)

- Brought back support for `npm` 6.
- CI scripts with help of Docker Compose (`docker/compose` image 1.29.2).
- moved temporary files to use `/tmp`

## 18-Aug-21 (0.0.4-alpha.3)

- **ADD**: Ability to set emulator host via `EMUL_HOST` env.var. Needed for use under Docker Compose.

## 17-Jul-21 (0.0.4-alpha.2)

- **FIX**: Clean up remaining `doc` listeners, allowing Jest to return to OS prompt. Counteracts [Jest #11464](https://github.com/facebook/jest/issues/11464) Unfortunately no Firebase Admin SDK issue, though the root cause is likely there.
- **CHANGE**: No more leaking through Firebase Admin SDK APIs, but exposing only selected methods, deemed useful for testing.
- **CLEANUP**: Removed old (commented out) `eventually` code
- **OPTIMIZATION**: 10..20% speed improvement on rules tests, due to transferring primed data via "intercom" temporary files.

## 30-Jun-21 (0.0.3-beta.4b)

- **BUG FIX**: Resolver fixed so `firestoreAdmin` works, from customer project.

## 29-Jun-21 (0.0.3-beta.4)

- **REWORK:** `preheat_EXP` replaces `listener_EXP` (same thing, more focused role, reduced implementation)
- **BIG CHANGE:** using the "modular API" Admin SDK (still in alpha)
- Docs revised (root and `ci`).
- **CHANGE (API):** Removed `eventually` - was too specific and can be done in tests.
- **CHANGE (SAMPLE):** No launch of emulators if there is an active Firebase project.
- **FIX (SAMPLE)**: Using `demo-1` as the project ID (makes Firebase Emulators play local)

## 13-Jun-21 (0.0.3-beta.3)

- **[REWORK]** Global lock waiting no longer polls, but listens to the document changes.
- **[API CHANGE]** `eventually` returns a Promise; no longer a polling Jest extension.

## 27-May-21 (0.0.3-beta.2)

- Updated to Jest 27.0.1
- **CHANGE:** Moved `firebase-admin` to be an implementation detail (dependency instead of peer dependency)
- Updated to `firebase-admin` 9.9.0, `firebase-tools` 9.12.0
- **FIX:** Added `setRegion` for `firebaseClientLike` (callables testing), due to Cloud Functions Emulators in 9.12.0 being aware of regions.

## 19-May-21 (0.0.3-alpha.3)

- Documentation revise

## 16-May-21 (0.0.3-alpha.2)

- Re-implemented efficient locking.
- Implemented also `arrayRemove` and `arrayUnion` sentinels/transforms, using `Symbol`.
- Implemented `firebaseClientLike` for `httpsCallables` testing.

## 11-May-21 (0.0.3-alpha.0)

- Replaced `@firebase/rules-unit-test` with REST API calls.

## 6-May-21 (0.0.3-alpha.0)

- Upgraded to Jest 27.0.0-beta.9
  - allowing making the Global setup scripts with ES modules! 🎉🥳

## 16-Apr-21 ()

- Not requiring `firebase-tools` to be globally installed.
- Launching Jest without `npx`.
- Dependency updates

## 5-Apr-21 (0.0.2-beta.5)

- Separated publishable part to `package` - better separation of core code vs. build and sample/tests.
- Changed Jest configuration files to use `export`.

## 3-Apr-21 (0.0.2-beta.4)

- **CHANGE**: Removed `cloudFunctions` from the exported features; keeping this server-side only. Sample code is provided in the `README` in case the downstream wants to test callables (only case where one needs a client side library in addition to `firebase-admin`).
- Updated dependencies

## 25-Mar-21 (0.0.2-beta.3)

- Dependency updates
- Needing `npm` >= 7.7.0 (or likely works with `npm` 6)

## 10-Mar-21 (0.0.2-beta.2)

- Dependency updates
  - especially Jest `27.0.0.next4` fixes an earlier bug

## 21-Feb-21 (0.0.2-beta.1)

- Dependency updates
- Having a problem with `npm run test:fns:userInfo` - may be connected to this: https://github.com/facebook/jest/issues/11093
  - <font color=red>[ ] settle that before release</font>

## 29-Jan-21 (0.0.2-beta.0)

- Changed to Jest v27 (next.2)

## 29-Jan-21 (0.0.2-alpha.0)

- Updated to be compatible with Node.js 15 (15.5.0)
- Updated dependencies
- Reduced noise in `npm run ci` console output

## 26-Sep-20 (0.0.1-beta.3)

- Dependency updates
- Bugfix: Moved `firebase` from `dependency` to `peerDependency`. Was always the intention but somehow 0.0.1-beta.2 had it wrong.
- Allows Cloud Functions emulator port to be defined in `firebase.json`: `emulators.functions.port`.

## (0.0.1-beta.2)

- BUGFIX: changed references from scoped package.
- Changed to `node-fetch` `3.0.0-beta`

## 13-Sep-20 (0.0.1-beta.1)

- Publishing to `npm` (was: GitHub Packages)
- Documentation revise
- Dependency updates
- No API changes

## 27-Aug-20

**API changes**

- Full reorganization of the import names, based on Firebase product

## 26-Aug-20 (0.0.1-alpha.9)

**Fixes**

- Fixed bug in `jestResolver.cjs` that caused the package not to load in an app.

## 26-Aug-20 (0.0.1-alpha.8)

- Changes to make use from application work; e.g. `cjs/jestResolver` provided
- Started publishing to GitHub Packages, as `@akauppi/firebase-jest-testing`

## 23-Aug-20 (0.0.1-alpha.7)

**Usage changes**

- Runs on only one `firebase.json` per project (good so!!!)
- only one `npm run start` command
- `ci` tasks can be run against the same emulator

**API changes**

- `db` renamed `dbUnlimited`
- tools for `globalSetup` now available as CommonJS code (`cjs`); until Jest supports ES modules there

**Internal changes**

- Using `@firebase/rules-unit-testing` 
- Using `firebase-admin` directly, instead of `.initializeAdminApp`
- Using REST API `DELETE` directly, instead of `@firebase/rules-unit-testing`

**Dependency changes**

- `@firebase/rules-unit-testing` replaces `@firebase/testing` (deprecated)
- `node-fetch` added
- `proper-lockfile` added (omitted by mistake)

## 21-Aug-20

- removed the use of `firebase use`. Replaced with `--project=bunny`, see [#1](https://github.com/akauppi/firebase-jest-testing/issues/1)

## 20-Aug-20

- using Jest custom resolver to be able to use package `exports`
- picking active project only from `GCLOUD_PROJECT` (well, fallback to run `firebase use`)

## 19-Aug-20 (0.0.1-alpha.3)

- used with `npm link` with an app project
- some `export` changes
- need to publish because Jest might dislike `npm link`

## 17-Aug-20

- `firebase**.json` and `.firebaserc` brought to the root dir
- Everything mentioned in `README` should work.

## 16-Aug-20

- reorganisation to `sample/test-fns`, `sample/test-rules`
- [x] `npm run test:rest:all` passes
- [~] `npm run test:rules:all` passes

## 14-Aug-20

- Security Rules tests implemented (uses ES modules, yay!)
- some tests still fail

## 9-Aug-20

- `npm run test:all` passes
- initial; `expect.eventually` works
