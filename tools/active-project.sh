#!/bin/bash

#
# Checks whether there is an active Firebase project
#
# THIS IS A TEMPORARY SOLUTION; the real one is changing the concept of "fake project" in Firebase CLI, itself (by PRs).
#
# Requires:
#   - grep
#
# Note:
#   Don't use 'npx firebase-tools use', since it's way too slow (3s). Our approach is 3ms.
#

# Just checking whether the current dir is on some line (simplistic, but enough). The entry would be in '.activeProjects'
# as a key.
#
FIREBASE_CONFIG=~/.config/configstore/firebase-tools.json
  #
  # Is this the same for all supported systems? (Linux, WSL2)?

cat $FIREBASE_CONFIG | grep -q \"$(pwd)\"
if [[ $? -eq 0 ]] ; then
  exit 0
elif [[ $? -eq 1 ]] ; then
  exit 1
else
  echo 2&>1 "ERROR in detection of Firebase CLI active project"
fi

#---REMOVE
# <<
#   ⚠  functions: The following emulators are not running, calls to these services from the Functions emulator will affect production: auth, database, hosting, pubsub, storage
#   ⚠  functions: Unable to fetch project Admin SDK configuration, Admin SDK behavior in Cloud Functions emulator may be incorrect.
# <<
#WARN1_KEY="The following emulators are not running"
#WARN2_KEY="Unable to fetch project Admin SDK configuration"

##if cat $FIREBASE_CONFIG | grep -q \"$(pwd)\"; then
#if false; then
#  # Active project - no filtering
#  echo "cat"
#else
#  # No active project
#  #echo "grep -v \"${WARN1_KEY}\" | grep -v \"${WARN2_KEY}\""
#
#  # Had problems with the spaces: replacing with '.' (and no quotes) seems to work
#  #
#  echo "grep -v ${WARN1_KEY// /.} | grep -v ${WARN2_KEY// /.}"
#fi
