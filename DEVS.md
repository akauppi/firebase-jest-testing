# Developer notes

## Tailing `firestore-debug.log`

Firestore prints out sometimes important information in the said file. You can follow it by:

```
$ tail -f -n 100  firestore-debug.log
```

## No `package/package-lock.json`

This is an implementation choice that can be reconsidered, if things change.

Currently, since there's so few dependencies (`node-fetch`), the author disabled creating the file.


## Rules tests: seeing Firestore contents

The `rules-test` dataset is intended to be read-only, protected by the locks.

If &ndash; for debugging this code &ndash; you ever need to see what the database contents became, just change the `--project` id in the `package.json` to `rules-test`:

```
  "start": "firebase emulators:start --project=rules-test",
```

Change the project id eventually back, so that functions tests work.

>Note: With a project name that doesn't start `demo-`, you'll get all kinds of warnings.


## Unnecessary emulator warnings

There are a number of warnings in the emulator output that don't seem reasonable. We grep these out in the `package.json`.

```
i  emulators: Detected demo project ID "demo-1", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
```

```
⚠  emulators: You are not currently authenticated so some features may not work correctly. Please run firebase login to authenticate the CLI.
```

```
⚠  functions: You are not signed in to the Firebase CLI. If you have authorized this machine using gcloud application-default credentials those may be discovered and used to access production services.
```

The warnings occur only on Windows+WSL2 (well, Linux); not macOS. The info occurs on all platforms.

The author thinks the root cause for such warnings is not a developer use case, but the confusion *within the code base*, as to what is the role of an offline project. 

More about that, in the next piece.


## Opinion: unnecessarily complex concept of "offline" project

Firebase full emulation was introduced with the Auth emulator in Oct 2020 [^1]. This shows in the way it treats project names, and adds unnecessary complexity, now that emulators are there.

[^1]: Some would say it's with the Storage emulator (Jul 2021 and ongoing..).

Here's a table of how Firebase sees different kinds of projects - and how the author intuitively approached them at first (just opinion!).

|litmus|kind|Firebase|author's view|
|---|---|---|---|
|`firebase use` returns the project name|active project|real cloud project; non-emulated access leads to the cloud|no need|
|`firebase use` returns "no active project";<br />any project name|undocumented|undocumented|expected offline project|
|project name starts with `demo-`|local project|actual offline project|surprise 🎂| 

Calling a project `demo-`something makes sense, in the cloud world, and has been used within GCP for a while.

But any such magic naming convention comes at a cost. Developers need to be aware of this - it needs to be documented - and so forth. Firebase aims at having a lesser learning footprint than GCP, which make the author think *...wish...* that maybe also the middle case (currently undocumented, as per the link above; it says *"A real project is one you configured and activated in the Firebase console..."*) could be treated, in the future, as a demo project by Firebase Emulators.

>In the mean time, this repo follows suit and uses the `demo-*` GCP convention so that we are not encouraging risky use of the library, by accident.
