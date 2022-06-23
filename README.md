# firebase-jest-testing

This `README` is for the developers. 

For using the package, see [package/README.md](package/README.md) (that ships with the package).

---

Tools for testing Firebase back-end features, using Jest.

This repo provides a "one stop", opinionated approach to testing Firebase projects. Using it may save you from reading countless pages of documentation and evaluating different testing strategies and libraries.

Also, the tools handle configuring emulation for you. In all, this tries to give a simpler development experience than the current (Aug 2021) Firebase tooling does.

The idea is that you don't have to pull in either `firebase-admin` nor `firebase` in your own testing project, but get all the tools through here.


## Folder structure

The package itself is placed under `package`.

The `sample` folder contains a sample Firebase backend used for testing:

- `sample/functions` has the definitions of the Cloud Functions
- `sample/firestore.rules` has the Firestore Security Rules
- `sample/test-fns` contains Cloud Function tests
- `sample/test-rules` contains Security Rules tests

You can use this sample as a template for your own Firebase backend testing project.

## Requirements

- node >= 16.5
- npm >= 7.7.0

<!--
Developed with:
- macOS 12.4
- node 18.4
- npm 8.12

+ Docker Desktop for Mac 4.9.1
  - 3 cores, 2 GB, 512 MB swap
  - VirtioFS enabled
-->

## Getting started

Fetch dependencies:

```
$ npm install
```

Now, you're ready to start the emulation and run tests against it.


## Two ways ahead

There are two ways to run the tests, each with their own pros and cons. We'll call them the "CI" (Continuous Integration) and "dev" (development) flows, according to their main use cases.

Let's start with the simpler one.


### CI: Run all the tests

Launching the tests is this easy:

```
$ cd sample
$ npm install
...
```

```
$ npm test
...
Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.547 s, estimated 3 s

...
Test Suites: 5 passed, 5 total
Tests:       29 passed, 29 total
Snapshots:   0 total
Time:        5.389 s
```

There are two separate Jest test suites run here, one after the other. One for Cloud Functions and another for Security Rules tests. It is possible to merge these but the author currently thinks it's best to keep them separate.

In "CI mode", each run launches the emulators anew. This takes ~5s that we can spare, by using the "dev" mode.


### Dev mode

In dev mode, a server runs continuously on the background so repeated runs of the tests are a bit faster. This same server can be used for both Cloud Functions and Security Rules testing - even in parallel.

```
$ cd sample  # unless you already are there
```

**Starting the emulator**

Start the emulator in one terminal, and leave it running:

```
$ npm run start
```

Once we run tests, it's worth checking the emulator output, occasionally.

**Running tests**

In another terminal:

```
$ npm run test:fns:greet
$ npm run test:fns:userInfo
...
```

For testing Security Rules:

```
$ npm run test:rules:invites
$ npm run test:rules:projects
$ npm run test:rules:symbols
$ npm run test:rules:userInfo
$ npm run test:rules:visited
```

Sure you get the gist of it. 🤓

These are prepared for you in `package.json`. When developing something, it's meaningful to run only one suite, at a time.

Once you think things are rolling fine, run `npm test` to confirm.

>Note: Since both CI and dev use the same emulator ports (defined in `firebase.json`), one cannot launch `npm test` while the emulator is running. Shut it down by Ctrl-C.


## Using Docker Compose 🎁

This is a more advanced (complex) setup, but one you should study for your own projects. It has some advantages:

- no need for multiple terminals. Docker Compose keeps the emulators running and their console output can be observed in the Docker Desktop application.
- no need for installing `concurrently` or `firebase-tools` npm modules.

See [`sample.dc/README`](sample.dc/README.md) for details.


## CI setup

Continuous Integration uses Docker Compose, to run the same tests.

See [`ci/README`](ci/README.md) for details.


## Other docs

- [Approach](APPROACH.md)
- [Developer notes](DEVS.md)
- [Known issues](KNOWN.md)
- [Tracked issues](TRACK.md)

## References

- [ES modules in Node today](https://blog.logrocket.com/es-modules-in-node-today/) (blog, Mar 2020)
