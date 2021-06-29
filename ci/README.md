# CI

The repos' CI is set up using Cloud Build. Tests are run for each PR targeting `master` or `next` branches.

The CI is run in a particular GCP project (`ci-builder`) that the author has for this purpose.

>Note: Commands in this document are intended to be executed in the `ci` folder.

## Requirements

- `gcloud` Google Cloud Platform CLI

   <details><summary>Installation on macOS</summary>
   Follow [Installing Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
	
	After unpacking, move the folder to a permament location (author uses `~/bin/google-cloud-sdk`). The installation is on that directory only, and uninstalling means removing the directory.

   ```
   $ gcloud --version
	Google Cloud SDK 343.0.0
	...
   ```

   Update by: `gcloud components update`
	</details>

   <details><summary>Installation on Windows 10 + WSL2</summary>
   tbd.. `#contribute`
   </details>

- Docker

   Needed for building the builders.


### GCP: CI project, Builder image

- [Building the builder](Building%20the%20Builder.md)

You can either finish with this document and check it later, or drop in their right now. Your CI script will eventually need the builder to exist.

### GitHub: Enable App triggers

- In [GitHub Marketplace](https://github.com/marketplace), enable the "Google Cloud Build" application
- Add your GitHub repo to the Cloud Build app


## Building manually

Make sure you are logged into the GCP project used for the Cloud Build.

```
$ gcloud config get-value project
ci-builder
```

```
$ gcloud builds submit ..
```

This packages the files (filtered by `../.gcloudignore`), ships them to Cloud Build, runs the build in the cloud, and streams the output to your terminal.

It's a GREAT way to check builds when developing them. You don't need to commit changes to git until the builds work!

>Side note: 
>There is also a `cloud-build-local` tool that allows to run the whole build, locally. However, it's badly maintained (Jun 2021), slow, and needs restarting Docker every now and then. Avoid it.


## Setting up Triggers

We wish the CI to run tests when:

- a new PR (or a change to an existing PR), targeting `master` (or `next`) is available.
  
  This will help us see, whether merging the changes is relatively safe.

Deployment of versions to `npm` is left to be done manually.

### Trigger for PRs

Cloud Build > `Triggers` > `Create Trigger`

Something like this:

>![](.images/edit-trigger.png)

Note: The above is just a sample. Study each choice in turn, and make your own decisions.

We can test this trigger only by making a PR. 

#### Testing the trigger

Let's make a Pull Request and see how it shows in GitHub.

```
$ git checkout -b temp-230521

# edit some change; eg. add white space to non-document file

$ git commit -m "testing CI"

$ git push --set-upstream origin temp-230521
```

Go to [GitHub](https://github.com/akauppi/firebase-jest-testing).

Create a pull request with the button there, mentioning the recent push.

![](.images/github-pr-checks-pass.png)

Make a breaking change that would cause a test to fail.

```
$ git commit -m "break test"
$ git push
```

The GitHub PR page should show this:

![](.images/github-pr-processing.png)

...turning into this:

![](.images/github-pr-failed.png)

Note that the "Merge pull request" button is still available, though not highlighted.


## Use of Cloud Storage (extra)

Cloud Build uses Cloud Storage (of the same project) to store files. The buckets look like this:

>![](.images/cloud-storage-buckets.png)

|bucket|file sizes|purpose|
|---|---|---|
|`artifacts.*/containers/images`|1..25 MB|(unknown)|
|`*_cloudbuild/source/*.tgz`|~33 kB|source tarballs|

The storage requirements are minimal, but by default there's no lifecycle rule for these files, meaning they will be kept "forever".

>Here is one benefit of keeping one's CI's running on a separate GCP project - all the storage buckets we see here are connected to CI/CD runs (and therefore easier to clean).

Either:

- forget about this :)
- visit it once a year, and remove the buckets totally
- add lifecycle rules that remove aged stuff

CI/CD older than a month are likely not ever needed (= 30 days and delete would be fine).


## References

- [Cloud Build](https://cloud.google.com/build/) (GCP)
- [Creating GitHub App triggers](https://cloud.google.com/build/docs/automating-builds/create-github-app-triggers) (Cloud Build docs)
- [Building and debugging locally](https://cloud.google.com/build/docs/build-debug-locally) (Cloud Build docs)
- [Building Node.js applications](https://cloud.google.com/build/docs/building/build-nodejs) (Cloud Build docs)
- `gcloud builds submit --help`

