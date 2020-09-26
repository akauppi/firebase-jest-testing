# Changelog

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
