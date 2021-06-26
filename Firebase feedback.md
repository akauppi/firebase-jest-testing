# Firebase feedback

## What are the App / project id / database for???

Firebase API seems to suffer from abstraction overload. This means there are degrees of freedom that - in the lack of clear roadsigns to the developers - lead to confusion and development friction.

This is likely mostly a documentation problem. The author has not found answers to the following questions in Firebase docs:

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

Naming the "apps" seems unnecessary, to the author. Just allow creation of multiple, and treat them all as default. Pass by handle, not the name.


### 2. Project id

This is more familiar. We use it all the time to point a Firebase project to its cloud presence.

The docs state that for emulating other than hosting, a project is not necessary.[^1-emul-callables] (thanks! That's how it should be!)

What is not documented is the emulator's behaviour when various project id's are passed to it.

- It shows Firestore data for the **active project** - not others.

   Active project is the one shown by `npx firebase use`.

- Cloud Functions triggers (`.firestore[...].onWrite`) only seem to be running for the named project (this is okay; just not documented); if one stores Firestore data on multiple projects, background triggers only take place in the named one.

- One can use any other project id's, against emulation, and the data streams work but the emulator UI is out of this loop. This may be by design?

All of this could be documented somewhere?

[^1-emul-callables]: That's not quite true. It's needed when Cloud Functions emulate `httpsCallable`s, as well.

### 3. Database

It seems one can have multiple databases within the one Firebase project, but why and when should one do so?

Since project id already covers the separation of data (e.g. in emulation), and since collections within Firebase are kind of separate entities, what is the use case for having more than the default database?

Don't take me wrong. It's fully okay to be prepared for multiple databases, and never exercising that freedom. But it is not clearly stated within the docs that this is the case.

The docs should clearly state, whether there is a use case for multiple databases, and what it is.


### Where could this documentation be?

Firebase could have a "terminology" page. That could cover these.

It looks to the author that the source code is the main culprit, though. Once abstractions are clarified **for the team**, it should eventually rain down to the code, so that things like the `app.firestore().app("other")` are not possible (unless there is a use case). We developers use type hints and looking into source comments a lot, to get a feel of what's available. Those should only provide roads that are worth travelling; not dead ends or obfuscation by the amount of options.


## Command line overrides for `firebase.json` values

For `firebase.json`, command line overrides for **all** (or most) of the config entries would take away the need to have two config files in one's project[^1]. There'd only be the main file (at root) and commands such as starting an emulator could override the fields they need.

[^1]: We got away from that :)
