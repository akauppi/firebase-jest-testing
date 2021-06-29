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

# BUILD_ID=1 npm test
```

Note: The files are mounted; making changes within Docker affects the host directory.


## Misc notes

- Default timeout for the builds seems to be 10min (600s); seen in `gcloud builds describe <id>`.


## References

- `gcloud topic gcloudignore`
- `gcloud builds submit --help`

