#!/bin/bash
set -eu -o pipefail

# List possibly outdated dependencies, in all the subpackages.
#
PATHS=". sample sample/functions package"

for _PATH in $PATHS
do
  # '|| true': carry on even if there are listed entries
  npm --prefix "$_PATH" outdated || true
done
