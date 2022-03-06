#!/bin/bash
set -eu -o pipefail

# Provide audit info, without changing repo.
#
PATHS="package sample sample/functions sample.dc"

false   # NOT TESTED!!! tbd.

for _PATH in $PATHS
do
  (cd "$_PATH" && \
    rm .npmrc && \
    npm install && \
    (npm audit || true) && \
    \
    git restore .npmrc && \
    rm package-lock.json \
  )
done
