# Problems

Some obstacles faced, avoiding implementation in the way that was seen as ideal. Based on Jest 26.2 and Firebase 7.17.x, `firebase-tools` 8.8.1.


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

```
// Instead of:
//import * as firebase from 'firebase/app'

import firebase from 'firebase/app'
```

The difference is not big. It's just that the [documented way](https://firebase.google.com/docs/web/setup#add-sdks-initialize) of loading does not succeed.


## Node/Jest: self-referencing the package by its name - not working

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

Use a custom resolver in Jest, as explained in [Writing tests](Writing%20tests.md) > Preparations.


## Firebase: testing in a CI

Testing both back-end and front-end features in a CI is part of the developer experience - and as such should be made easy.

Currently (8.7.0; 21-Aug-20) this is not so.

- there is no documentation about setting up a CI pipeline
- there are various Docker images, but nothing provided by Firebase itself (or "blessed")
- needing to tie to an online project (`firebase use`), and maybe authenticate(?) makes CI more burdensome than it needs to be

If the emulators ran without needing to "touch the sky", CI becomes a lot simpler.

<font size="+7">💨</font>

---

Well... [this blog](https://medium.com/firebase-developers/run-continuous-integration-tests-using-the-firebase-emulator-suite-9090cefefd69) (Dec 2019) states:

>Note that if your tests rely on Firebase Hosting, then you will need to provide an access token in order to run firebase emulators:exec. The other emulators do not require this token. If you have enabled Hosting but you do not need it in your integration tests, feel free to use the --only flag to include only the emulators that you need.

Is that truly so??

My `firebase.json` is:

```
{
  "firestore": {
    "rules": "sample/firestore.rules"
  },
  "emulators": {
    "firestore": {
      "port": "6767"
    }
  },
  "//": {
    "": [
      "The normal Firebase config. Used for deployments and testing of Security Rules"
    ]
  }
}
```

No hosting, anywhere...

For `firestore`, emulation can indeed be done without authentication:

```
$ firebase emulators:exec --config firebase.json --only firestore true
⚠  emulators: You are not currently authenticated so some features may not work correctly. Please run firebase login to authenticate the CLI.
i  emulators: Starting emulators: firestore
i  firestore: Firestore Emulator logging to firestore-debug.log
i  Running script: true
✔  Script exited successfully (code 0)
i  emulators: Shutting down emulators.
i  firestore: Stopping Firestore Emulator
```

For `functions`, however:

```
$ firebase emulators:exec --config firebase.json --only firestore,functions true
⚠  emulators: You are not currently authenticated so some features may not work correctly. Please run firebase login to authenticate the CLI.
i  emulators: Starting emulators: functions, firestore
i  emulators: Shutting down emulators.

Error: No currently active project.
To run this command, you need to specify a project. You have two options:
- Run this command with --project <alias_or_project_id>.
- Set an active project by running firebase use --add, then rerun this command.
To list all the Firebase projects to which you have access, run firebase projects:list.
To learn about active projects for the CLI, visit https://firebase.google.com/docs/cli#project_aliases
```

Hopefully, this is a bug.

I'd be really pleased if CI of services other than hosting - as stated - can use the emulator unauthenticated.

---

This works (providing `--project`):

```
$ firebase emulators:exec --project dummy --only firestore,functions true
```

>NOTE: Was able to solve this for `firebase-jest-testing` but keeping here, since it seems like a bug in Firebase 8.8.1.


## Firebase: what are the App / project id / database for???

Firebase API seems to suffer from abstraction overload. This means there are degrees of freedom that - in the lack of clear roadsigns to the developers - lead to confusion and development friction.

This is likely mostly a documentation problem. The author has not found answers to the following questions in Firebase docs (and is now diving into sources..):

### 1. What is the role of an "app"?

Firebase clients do things like [creating a random app name](https://github.com/firebase/firebase-js-sdk/blob/master/packages/rules-unit-testing/src/api/index.ts#L95).

An `.app` instance's `.firestore.app("other")` [allows one to fetch another app](https://github.com/firebase/firebase-js-sdk/blob/61b4cd31b961c90354be38b18af5fbea9da8d5a3/packages/firebase/index.d.ts#L1027) by its name. That's confusing.

The documentation has lines like:

>When called with no arguments, the default app is returned. When an app name is provided, the app corresponding to that name is returned.

What is a default app?

When would one create multiple?

Firebase sources state:

>A FirebaseApp holds the initialization information for a collection of services.

Essentially it looks to be just that: a collection of options. It would make more sense for **app** developers to call it that, instead of "app".

A `Map` of `string` -> `FirebaseOptions` would do just as well.

Still, the real questions remain:

- **When should one use the "default app"?**
- **When should one use one with another (static) name?**
- **When should one use a randomly named one?**

Is this an unnecessary abstraction?

### 2. Project id

This is more familiar. We use it all the time to point a Firebase project to its cloud presence.

The docs state that for emulating other than hosting, a project is not necessary. (thanks! That's how it should be!)

What is not documented is the emulator's behaviour when various project id's are passed to it.

- It shows Firestore data for the **active project** - not others.

   Active project is the one shown by `firebase use` command.

- One can use any other project id's, against emulation, and the data streams work but the emulator UI is out of this loop. This may be by design?

All of this could be documented somewhere?


### 3. Database

It seems one can have multiple databases within the one Firebase project, but why and when should one do so??

Since project id already covers the separation of data (e.g. in emulation), and since collections within Firebase are kind of separate entities, what is the use case for having more than the default database?

Don't take me wrong. It's fully okay to be prepared for multiple databases, and never exercising that freedom. But it is not clearly stated within the docs that this is the case.

The docs should clearly state, whether there is a use case for multiple databases, and what it is.


### Where could this documentation be?

Firebase could have a "terminology" page (unless it already has). That could cover these.

It looks to the author that the source code is the main culprit, though. Once abstractions are clarified **for the team**, it should eventually rain down to the code, so that things like the `app.firestore().app("other")` are not possible (unless there is a use case). We developers use type hints and looking into source comments a lot, to get a feel of what's available. Those should only provide roads that are worth travelling; not dead ends or obfuscation by the amount of options.

