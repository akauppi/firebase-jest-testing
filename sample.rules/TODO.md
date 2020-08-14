# Todo

## Speed up! 🚀

The overall test execution time is pretty slow.

|||
|---|---|
|`test:projects`|~1.50 s|
|`test:symbols`|~1.51 s|
|`test:invites`|~1.35 s|
|`test:all`|~5.8 .. 6.1 s|

During the execution, the CPU load is hardly noticable.

- [ ] Where does the calendar time go?
- [ ] Can we make these 5..10x faster?

```
$ time npm run test:all
...
real	0m10.375s
user	0m16.624s
sys	0m3.472s
```
