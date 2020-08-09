# firebase-jest-testing

Tools for testing Firebase back-end features, using Jest.

This repo provides a "one stop", opinionated approach to testing Firebase projects. Using it may save you from reading countless pages of documentation and evaluating different testing strategies and libraries.

Also, the tools handle configuring emulation for you. In all, we're trying to give a simpler development experience than the current (Aug 2020) Firebase tooling by itself.

More about the [DESIGN](DESIGN.md).


## Requirements

- npm
- `firebase` CLI:
   
   `$ npm install -g firebase-tools`
- Have a Firebase project set up

Tie to the Firebase project:

```
$ firebase use --add --config firebase.testing1.json
```

The alias you choose does not matter.

>Note: Firebase needs the project, even when all we do is run a local emulation.

<!-- Q: is this strictly necessary?
Set up the Firestore emulator:

```
$ firebase setup:emulators:firestore
```
-->


## Getting started

Fetch dependencies:

```
$ npm install
```

You'll need to do this separately also for the functions emulated:

```
$ (cd functions && npm install)
```

After this, you're ready to start the emulation and run tests against it.


## Testing Cloud Functions

There are two ways to run these tests, each with their own pros and cons. We'll start with the one where a server is manually started.

### Dev: Start an emulator

We start a Firebase emulator in one terminal, and run the tests in another - or in an IDE.

**Starting the emulator**

```
$ npm run start
```

Once we run tests, it's worth checking the emulator output, occasionally.

**Running tests**

In another terminal:

```
$ npm run test:monitoring
$ npm run test:callables
$ npm run test:userInfo
...
$ npm run test:all
```

These are prepared for you in `package.json`. When developing functions, it's meaningful to run only one suit, at a time.


### CI: As a single command

Once tests pass, you'll likely be just running them over and over, e.g. from a CI script.

This command starts the emulator in the background, for the duration of running the tests. Launching adds ~5..6s to the execution time.

```
$ npm run ci
...
```

<_!-- tbd. output above --_>
-->


## Using in your project

<font color=red>...tbd. about how to pull in...</font>


<!--
## Developer notes

The structure is made to resemble that of your Firebase project, so that it would feel normal to test the tools out.

- `functions/`: This is where your Cloud Function sources live. Demanded by Firebase to have this name.
- `test.fns/`: Tests for your cloud functions. Choose a suitable name.
- `src/`: Tool sources. Don't copy to your project but take the files via `npm`.

Some files:

- `firebase.testing1.json`: The Firebase configuration file.
-->

<!--
## References

- Cloud Functions > [Get Started](https://firebase.google.com/docs/functions/get-started) (Firebase docs)
-->

