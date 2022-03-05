# Building the Builder

In order for Cloud Build to be able to run Firebase Emulators, a Docker image suitable to the task is needed.

Unfortunately, the current choices (Mar 2021) don't offer a suitable image for this:

- Community [Firebase image](https://github.com/GoogleCloudPlatform/cloud-builders-community/tree/master/firebase) does not know about emulators.
- [`timbru31/docker-java-node`](https://github.com/timbru31/docker-java-node) did not work effortlessly for the author, and he didn't want to use an exotic "Azul" OpenJDK image.

So another builder repo was born. 👶

The `firebase-ci-builder` is provided for you as a git submodule (so you skip cloning it):

```
firebase-ci-builder.sub/
├── CHANGELOG.md
├── DEVS.md
├── Dockerfile
├── Makefile
└── README.md
```

For building the builder, you need:

- Docker
- `gcloud` 

For pushing the image to a Cloud Registry, you need:

- an active `gcloud` project

>Note: Details on installing and operating `gcloud` are in the main `README` (one link back).

<p />

>**Further info**
>
>A [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) is a git repository, within another. `cd firebase-ci-builder; git pull` updates its contents. Making changes in it are not visible in the enclosing repository.
>
>For us, it's a way to bring another repo in without mixing their commit histories, and without asking you to clone it.


## Why do I need to build the builder?

No-one is hosting `firebase-ci-builder` (or a suitably similar, current image) online.

But this is not the only reason. Building one's own allows one to:

- better check what the image contains
- make customizations; e.g. decide versions to use

The needs *may* be sufficiently different that it makes sense for people to "build (and host) their builders". We will see.


## Steps

```
$ cd firebase-ci-builder.sub/
```

### 1. `build`

```
$ ./build
[+] Building 1.6s (9/9) FINISHED
...
 => => naming to firebase-ci-builder:9.16.0-node16-npm7
```

This created the `firebase-ci-builder:9.16.0-node16-npm7` image.

>```
>$ docker image ls firebase-ci-builder  
>REPOSITORY            TAG                  IMAGE ID       CREATED        SIZE
>firebase-ci-builder   9.16.0-node16-npm7   9016a3bba25f   8 seconds ago  467MB
>```
>
>It's 467 MB.


### 2. Push to Container Registry

We need to push the image to a registry that our CI/CD (Cloud Build) can access.

Here are many options. 

1. Push to each GCP project where you intend to use the image.

  This makes using the image easy (no further access needs to be allowed).

2. Push to a certain GCP project's registry, and allow other project access to it.

3. Maybe other meaningful destinations..?

#### Set the active `gcloud` project

```
$ gcloud config set project testing-230321
```

```
$ ./push-to-gcr
...
docker build --pull --build-arg FIREBASE_VERSION=9.16.0 . -t firebase-ci-builder:9.16.0-node16-npm7
[+] Building 1.6s (9/9) FINISHED                                                                                                                                                                                                                          
...
```

You can now refer to the image in the `cloudbuild.yaml` as `gcr.io/$PROJECT_ID/firebase-ci-builder`.

### 3. Use the image

Return to the main `README` to proceed.
