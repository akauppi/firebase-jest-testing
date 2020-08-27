# Publish

The code is published to GitHub Packages. This is selected mostly because of familiarity, and the supposed benefit of using one less tool. Let's see how it fairs..

Publishing is done **manually**, by the author. The steps involved are described here.

>Note: We plan to eventually have an organization for this project. That would imply a name change. In the beginning, it's published with the author's private account, since Github "only supports scoped npm packages".


## Requirements

Study [Configuring npm for use with GitHub Packages](https://docs.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages) and follow its guidance.

## Steps

### Raedy, set.. 

Check the to-be contents before it's late:

```
$ npm pack
...
```

If you see unwanted files, edit the `.npmignore` or `files` in `package.json`.

### Bang! 🚀

```
$ npm publish
...
+ @akauppi/firebase-jest-testing@0.0.1-alpha.8
```

>Note: MUCH smoother than the same for npmjs.com.

>Deep note: `tag: alpha` comes from the `publishConfig` section in `package.json`.

### Tag the repo

```
# See everything's committed
$ git tag 0.0.1-alpha.8
$ git push --tags
```

This helps us get back to what got published, if we ever need to. (yes, it could be automated; not expecting that many releases).


## Viewing packages

Here: [https://github.com/akauppi/firebase-jest-testing/packages/](https://github.com/akauppi/firebase-jest-testing/packages/)


