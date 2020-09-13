# Publish

## To npm registry

```
$ npm login   	# including 2FA
```

```
$ npm publish --tag beta [--dry-run]
...
Enter OTP: ...
+ firebase-jest-testing@0.0.1-beta.1
```

### Check the outcome


###

>Note: Once stable, remove the `publishConfig.tag` entry from `package.json`.

- Check you don't have uncommitted files (`git status`); commit them.
 
```
$ git tag 0.0.1-beta.1    	# what you published
$ git push --tags
```

<!-- hmmm
## To publish (also) to GitHub Packages:

1. change the name in `package.json`:

   ```
   "name": "@akauppi/firebase-jest-testing"
   ```
2. ...
-->
