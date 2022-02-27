## Attitude against `firebase-tools`

I think it's two products in one - and that the whole approach is outdated. And that the Firebase community is hurt by this.

### Claim: two products in one

`firebase-tools` is used both as a Firebase CLI as well as for running the emulators. These are two *fundmentally different* problems and binding the tools under the same umbrella has only the benefit that they get distributed as one.

However.. this is also the problem it creates!

As a person (well, project) *only* interested in the **emulation** side of things (since we don't eg. deploy anything here), I still must crawl the Changelogs when they don't actually affect this project, at all.

A solution is to use a Docker image for running the emulators. This brings to the second claim.

### Claim: the whole approach is outdated

Firebase bundles the tools together as an `npm` package. For some reason, it also provides a "standalone" version (that no-one needs, am I right??) that has/carries/fakes `npm`, internally.

This is self-inflicted complexity. We can live without it.

The modern (well, ca. 2020 anyways! ;) ) approach would be to provide a Docker image and allow people to run emulations there. It's sandboxed (read: safe), it's isolated, it would allow Firebase to optimize the image to their heart's content.

But no. Firebase offers no such image.

### Claim: Firebase community is hurt by this

It's too complex to set up a Firebase project (with deployment; with testing). There are too many issues to follow, too many questions on StackOverflow. It's not simple.

If bundling the products did serve a purpose is 2000's, it does no more. **Separate them**. Provide emulators only via Docker (yes, people will complain but so what.. maybe allow them to also build them natively?)

While at it, please drop the thinking that emulation needs to be artificially slowed down (so that people wouldn't run it instead of the cloud offering). We won't. And you can always address that in the license text.

Please also optimize that Docker image so that it would **start fast**. This means **heat up the functions** instead of lazy-loading them.

These are attitude issues, not technical ones.

`firebase-tools` deserves to be a CLI only. Developers deserve to have a **speedy emulator** in their hands.

We are **far from this**, but by just changing the attitude at Firebase, the change can begin. Until it does, this repo will likely move towards using a Docker image, instead of pulling in `firebase-tools` from npm.
