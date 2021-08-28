# Analysis

We want all the tests to perform under 2000ms, all the time, on all the platforms.

There's timing indications embedded in certain tests (and Jest setup code), to see where time is taken.

The guinea pigs (selected based on their performance in normal test runs) are:

||alias|native (macOS)|DC (macOS)|CI (Cloud Build)|
|---|---|---|---|---|
|`timings:1`|`test:fns:userInfo`|1064, 1116 (263, 275)|<font color=red>3304, 3267</font> (780, 801)|
|`timings:2`|`test:rules:projects`|664, 677 (528, 566)|<font color=red>2994, 2930</font> (<font color=red>2562, 2449</font>)|


*Timings in ms. First run (consequtive ones)*

`firebase-tools` version:

<!--
macOS 11.5
Node.js 16.7
npm 7.21
Docker for Mac 3.6.0

firebase-tools
- for native: 9.16.5 (or 9.16.6)
- for DC: 9.16.0 (or 9.16.6)
-->

Only the first runs (emulators cold started) are under focus, since eg. in CI it's always the case.

<!--
The goal is to analyse the causes of sluggishness, and eliminate them, bringing first-time execution times below 2000ms.
-->

## Launch

```
$ DEBUG_COLORS=1 npm run start
```

>`DEBUG_COLORS` seems to also change the output to ms diffs (which we prefer).

```
i  functions: Watching "/Users/asko/Git/firebase-jest-testing/sample/functions" for Cloud Functions...
>    sample:functions Loading 'functions/index.js' +0ms
>    sample:functions Firebase app initialized +1ms
>    sample:functions Firestore handle initialized +15ms
>    sample:functions Have 'regionalFunctions' +0ms
>    sample:functions 'greet' declared +0ms
>    sample:functions 'userInfoShadow' declared +1ms
✔  functions[mars-central2-greet]: http function initialized (http://0.0.0.0:5002/demo-1/mars-central2/greet).
✔  functions[mars-central2-userInfoShadow]: firestore function initialized.
```

Looks good! (native)

>DC goes through the same in ~150ms. Good.


## Functions tests

### Global Setup (Jest)

Priming the data takes:

||ms|
|---|---|
|native (macOS)|713 (435, 535)|
|DC (macOS)|2s (2s)|

### Jest test execution

||pre-heat|1|2|3|
|---|---|---|---|---|
|native (macOS)|645|1|320|1s|
|DC (macOS)|**2s**|33|625|**3s**|

`pre-heat` means priming. 

`3` is the stage where change is waited, in another document.

Based on this, it just seems that Firestore is tremendously sluggish under emulation, when the first data is being lifted. This sluggishness is there in native (645ms for priming; 1s for waiting, *once the data has already changed in the back-end*).

Expectation would be for those steps to be < 500 ms in *any* case. It's a local machine, and there shouldn't be network delays.

This is **SAD!** and it **hinders meaningful test based development**.

> The answer?  Faster emulation!

>It is increasingly SAD if Firebase has built such sluggishness <b>IN</b> into the implementation. This is possible, and allowed, to keep people from locally hosting the emulators. But it should only kick in with certain bandwidth that exceeds what's needed into testing. The author has no proof that this is the case - nor that it isn't.

... 🥱

### Server side

Time it takes to relay change to another document:

||find docs the person is a member|write those docs|
|---|---|---|
|native (macOS)|544 (24)|1015 (13)|
|DC (macOS)|1559 (51)| 88 (79)|

Comparison between first-time and n:th time speeds clearly shows the problem.

- [ ] How to tune Emulators so that everything is hot-started, instead of cold-started?  Running the test twice would do??? (with humongous timeouts for the first run)








