# `dc-tools`

Docker images for using with the CI `docker-compose.yml`.

- `n14`

   Provides:

   - Node 14; npm 6
   - `wait-for-it` CLI

   Configured so that there's no version upgrade announcements.

These images get automatically built, by `docker compose`.

## NOTE!

If you make changes to the `Dockerfile`s, you **must** explicitly rebuild them:

```
$ docker compose build test
```

## Motivation

Such build images form an abstraction for the `docker-compose.yml`, reducing the number of lines needed in the `docker-compose` file. It's really about separation of setup vs. actual build steps.

### The cost

The down side is slightly longer CI execution times, since in CI the build happens again, for each run. We redeem this cost bearable.
