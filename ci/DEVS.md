# Developer notes

## `.gcloudignore`

Cloud Build ignores the files in the *root*'s `.gitignore` automatically but:

- it does not check the global `.gitignore`
- it does not check `.gitignore`s in subdirectories
- it makes sense not to send all the version controlled files to Cloud Build (eg. docs, images)

For these reasons, the repo has its own `.gcloudignore`, to keep the transports small.

## See what gets shipped

```
$ gcloud meta list-files-for-upload ..
```

## Running CI image locally

This is needed for debugging, if e.g. the Firebase Emulators get stuck.

```
$ docker run -it --rm -v $(pwd)/..:/workspace -w workspace firebase-ci-builder:9.12.1-node16-npm7 /bin/bash

# BUILD_ID=1 npm ci
```

Note: The files are mounted; making changes within Docker affects the host directory.

## Separating server and tests

Separating the *launch* of a server and the *use* of it is separation of concerns. It allows different base images to be used for the two. This is something that Docker Compose (DC) normally is used for, but it turns out, we can do the same using just Docker - for no increase in CI run times.

Note: This is *not* possible without Docker (the author didn't find a way, at least).

---

[Cloud Build Overview](https://cloud.google.com/build/docs/overview?hl=CA) states:

>Each build step is run with its container attached to a local Docker network named `cloudbuild`. This allows build steps to communicate with each other and share data.

It also means that one *can* launch services in the background, and have them available in the later CI steps. This is great![^1]

In practise, you do this:

```
- name: gcr.io/cloud-builders/docker
  args: [
    'run',
      '-d',
      '-p', '6767:6767', '-p', '5002:5002',
      '-v', '${_PWD}:/work', '-w', '/work',
      '--name', 'emul',
      '--network', 'cloudbuild',
      'gcr.io/${PROJECT_ID}/firebase-ci-builder:${_BUILDER_TAG}',
    'npm', 'run', 'start'
  ]
```

Everything there is pretty much needed. 

You can make this nicer in a Docker Compose file, but that implies an additional pull for every CI run, so in this repo (because it's simple) the author went with mere Docker (the image pre-exists in the Cloud Build instance so not delaying the run).

The services get launched. Their ports are exposed to further steps with the container's name (eg. `emul:6767`).

**References:**

- [this SO answer](https://stackoverflow.com/a/69098030/14455)

[^1]: In fact, it's **essential** for the expressiveness and usefulness of Cloud Build. Too bad [none of the official samples](https://github.com/GoogleCloudPlatform/cloud-build-samples) showcase this!


## Misc notes

- Default timeout for the builds seems to be 10min (600s); seen in `gcloud builds describe <id>`.


## References

- `gcloud topic gcloudignore`
- `gcloud builds submit --help`
