# Publish

## Requirements

- `npm` account
   - with 2FA enabled

## Steps

```
$ cd package
```

Check that `CHANGELOG.md` contains mention of what the release contains.

```
$ npm publish --tag beta [--dry-run]
...
Enter OTP: ...
+ firebase-jest-testing@0.0.2-beta.3
```

>Hint: You can store your access token by `npm set //<registry>/:_authToken $TOKEN`

>Note: Once stable, remove the `publishConfig.tag` entry from `package.json`.

View [https://www.npmjs.com/package/firebase-jest-testing](https://www.npmjs.com/package/firebase-jest-testing).

Check you don't have uncommitted files (`git status`); commit them.
 
```
$ git tag 0.0.2-beta.3    	# what you published
$ git push --tags
```

That's it!

