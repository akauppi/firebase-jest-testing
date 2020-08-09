# Problems

Some obstacles faced, avoiding implementation in the way that was seen as ideal. Based on Jest 26.2.


## No test timeout hook

The `expect.never` would like to turn a timeout into a pass.

Also `expect.eventually` could benefit from catching a timeout (or a moment just before), and turning the Jest timeout into a more described fail of the test.

Is there a way to do this in Jest? Likely not.

### Proposal

When a test is described, or executing, it could do:

```
/* HYPOTHETICAL API that would allow us to reject a test instead of it timing out. */
jest.onTimeout( () => {
  reject();
});
```

Jest would behave like this:

- if timing out, and one or more `onTimeout` are defined for the test
  - call those functions
  - leave the actual timing out to a teeny bit later (`setTimeout({...},0)` or similar)
    - that code should still check whether the test has passed/failed, since it's possible calling the `onTimeout` has caused this.
    
This would allow the timeouts, and Promises created by them, to run before the test really times out.

This allows the `onTimeout` body to turn the test into a pass or fail, if it so wishes, using the normal Jest mechanisms (resolving or rejecting a pending Promise, for example).

**Work-arounds:**

In Jest, there is the default test timeout but each test can also separately get an override, as the last parameter. It would be natural for the developer to descibe the timeout for a `expect.never` using this mechanism, instead of needing to learn a new one.

However, the currently running test does not seem to have access to its timeout parameter.

If this was provided, the test library could emulate the `onTimeout` by setting a timer a bit before. This is not very accurate, so actually having an `onTimeout` hook feels better.

In the absence of knowing the test's timeout, a further parameter could be given to `expect.never`. This feels wrong, so not going there.

The "after approach" of using a timed Promise and checking the expectation once (no extension to Jest) is currently the preferred approach, in the opinion of the author.

```
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

test("Some"), () => {
  ...
  
  await sleep(300).then( expect(...condition...) );
});
```

This is clear and simple, but brings its own timeout parameter. We *can* improve the developer experience if an `onTimeout` hook were provided by Jest.
