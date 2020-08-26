# Publish

The code is published to GitHub Packages. 

This is selected mostly because of familiarity, and the supposed benefit of using one less tool. Let's see how it fairs..

Publishing is done **manually**, by the author. The steps involved are described here.

Note that GitHub Packages "only supports scoped npm packages." i.e. we need to have the owner in the package name.


## Requirements

Study [GitHub Packages docs](https://docs.github.com/en/packages/publishing-and-managing-packages/publishing-a-package) on publishing, authentication etc.


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


