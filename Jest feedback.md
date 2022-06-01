# Jest problems

Some obstacles faced, avoiding implementation in the way that was seen as ideal. Based on Jest 27.0.5.


## No test timeout hook

---

>Actually, all we need is `.timesOut` since promises can do cleanup using `afterAll`, if they so wish. Suggesting to Jest. 👍
---

**Problem**

There is currently (Jest 27) no way to tap into the timing out of a test, when Jest default timeout takes place.

For some tests, it would be beneficial to turn a timeout into pass/fail.

For some others, it may be good to be able to cancel an operation if timeout occurs (while JavaScript `Promise`s cannot be cancelled from outside, they can be made to reject from inside; and eg. release resources).


### Proposal

When a test is described, or executing, it could do:

```
  /* HYPOTHETICAL API that would allow us to reject a test instead of it timing out. */
  jest.beforeTimeout( () => {
    reject();
  });
```

Jest would behave like this:

- if timing out, and one or more `beforeTimeout` are defined for the test
  - call those functions
  - leave the actual timing out to a teeny bit later (`setTimeout({...},0)` or similar)
  - that code should still check whether the test has passed/failed, since it's possible calling the `beforeTimeout` has caused this.

i.e. the `beforeTimeout` function would not return anything. It can affect the promise itself.

>A somewhat related issue is Firebase/Jest with "unstopped async operations": [Firebase side](https://github.com/firebase/firebase-js-sdk/issues/4884), [Jest side](https://github.com/facebook/jest/issues/11464#issuecomment-850055381) issue.

**Alternative(s):**

Ability to read the test's timeout, within the test (the last parameter). It could then make a timer go off slightly prior to that, and resolve/reject before the timeout. 

This is not nearly as elegant approach - and prone to timing glitches.

**Work-arounds:**

- Using a timed Promise that carries its separate timeout, and disabling the test's timeout by setting it to, say, 9999:

   ```
   const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
   
   test("Some"), async () => {
     await sleep(300).then( expect(...condition...).toBe(...) );
   }, 9999 /*ms*/);
```

   This looks clumsy, and checks the value only once (inefficient). 
   
   One must also remember to disable the Jest timeout (i.e. steering the timeout from eg. config file no longer applies to this test).

---

The same with proposed `.beforeTimeout` would allow two kinds of test-facing APIs to be crafted:

- make the Promise itself timeout-aware (turning to pass/fail):
 
   ```
   await expect(prom).resolves.toBe(...);
   ```

- have an `expect.timesOut` extension

   ```
   await expect(prom).timesOut;
   ```

There's also a combination of the two, where the promise is timeout-aware (can eg. cancel an upstream subscription), but does not turn the Promise to pass/fail but lets `.timesOut` report it.

