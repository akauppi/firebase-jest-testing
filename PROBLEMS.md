# Problems

Some obstacles faced, avoiding implementation in the way that was seen as ideal. Based on Jest 27.0.0-next.9.


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

The real questions remain:

- **When should one use the "default app"?**
- **When should one use one with another (static) name?**
- **When should one use a randomly named one?**

Is this an unnecessary abstraction?

### 2. Project id

This is more familiar. We use it all the time to point a Firebase project to its cloud presence.

The docs state that for emulating other than hosting, a project is not necessary.[^1-emul-callables] (thanks! That's how it should be!)

What is not documented is the emulator's behaviour when various project id's are passed to it.

- It shows Firestore data for the **active project** - not others.

   Active project is the one shown by `firebase use` command.

- One can use any other project id's, against emulation, and the data streams work but the emulator UI is out of this loop. This may be by design?

All of this could be documented somewhere?

[^1-emul-callables]: That's not quite true. It's needed when Cloud Functions emulate `httpsCallable`s, as well.

### 3. Database

It seems one can have multiple databases within the one Firebase project, but why and when should one do so??

Since project id already covers the separation of data (e.g. in emulation), and since collections within Firebase are kind of separate entities, what is the use case for having more than the default database?

Don't take me wrong. It's fully okay to be prepared for multiple databases, and never exercising that freedom. But it is not clearly stated within the docs that this is the case.

The docs should clearly state, whether there is a use case for multiple databases, and what it is.


### Where could this documentation be?

Firebase could have a "terminology" page. That could cover these.

It looks to the author that the source code is the main culprit, though. Once abstractions are clarified **for the team**, it should eventually rain down to the code, so that things like the `app.firestore().app("other")` are not possible (unless there is a use case). We developers use type hints and looking into source comments a lot, to get a feel of what's available. Those should only provide roads that are worth travelling; not dead ends or obfuscation by the amount of options.


