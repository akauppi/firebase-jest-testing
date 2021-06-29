#!/bin/bash
set -euf -o pipefail

# tools/filter-emulators.sh
#
# Output a command for filtering unnecessary warnings (as we think) from the Firebase Emulators console output.
#
# THIS MUST ONLY BE CALLED WHEN THERE'S NO ACTIVE PROJECT.
#
# Reasoning:
#
#   Without an active project (and no other means of authentication, such as tokens), the emulators won't be able
#   to reach the cloud instance, and there's no need for the warnings. Rrright???
#
# Ideally...: 🤞
#
#   - Firebase would have a more "offline first" approach to testing, meaning the _safest_ configuration is also the
#     _easiest_ to set up.
#   - Firebase Emulators would _not call Wolf!_ if there's not one around. (imagine wolf emoji!)
#
# Note on 'grep':
#   - Need to give the keys to 'grep -v' as a _single_ parameter ('grep -v ... | grep -v ...' suffocates all output, for some reason..).
#   - Multiple approaches with quotes and '\ ' failed (in connection to launching from 'package.json'); replacing with '.' works. :P
#

# If running CI, suppress other set of messages than in dev (no warning about suppression)
# <<
#   ⚠  emulators: You are not currently authenticated so some features may not work correctly. Please run firebase login to authenticate the CLI.
#   ⚠  functions: You are not signed in to the Firebase CLI. If you have authorized this machine using gcloud application-default credentials those may be discovered and used to access production services.
# <<
#
if [[ ${BUILD_ID-} ]]; then
  KEY1="You are not currently authenticated"
  KEY2="If you have authorized this machine using gcloud"
  echo "grep -v ${KEY1// /.\\|${KEY2// /.}}"
  exit 0
fi

# <<
#   ⚠  functions: The following emulators are not running, calls to these services from the Functions emulator will affect production: auth, database, hosting, pubsub, storage
#   ⚠  functions: Unable to fetch project Admin SDK configuration, Admin SDK behavior in Cloud Functions emulator may be incorrect.
# <<
WARN1_KEY="The following emulators are not running"
WARN2_KEY="Unable to fetch project Admin SDK configuration"

echo "grep -v ${WARN1_KEY// /.}\\|${WARN2_KEY// /.}"

>&2 echo "(( Some Firebase Emulator warnings SUPPRESSED. ))"
