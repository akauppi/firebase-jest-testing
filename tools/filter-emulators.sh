#!/bin/bash
#set -euf -o pipefail

# tools/filter-emulators.sh
#
# Output a command for filtering unnecessary output (as we think) from the Firebase Emulators.
#
# Context:
#   Alpine Linux (under Docker or Cloud Build)
#     - run as user; doing piping with root in Docker causes all output to miraculously disappear...
#
# Ideally...:
#   - Firebase Emulators would not have unnecessary logging (such as the "Detected demo project"). If we run a demo
#     project, we know it.
#   - Firebase (on a "demo" project, which is told to be "offline" in the docs!) wouldn't warn about unnecessary stuff.
#   - Firebase would set up a process _specifying_ what shall be warned about! Currently, it looks like individual
#     programmers just dropped in lines, as they saw best (but not considering all use cases).
#
# Note on 'grep':
#   - Need to give the keys to 'grep -v' as a _single_ parameter ('grep -v ... | grep -v ...' suffocates all output, for some reason..).
#   - Multiple approaches with quotes and '\ ' failed (in connection to launching from 'package.json'); replacing with '.' works. :P
#

# Filtering if started with '--project demo-...'
# <<
#   i  emulators: Detected demo project ID "demo-1", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
#   ⚠  functions: You are not signed in to the Firebase CLI. If you have authorized this machine using gcloud application-default credentials those may be discovered and used to access production services.
#   ⚠  emulators: You are not currently authenticated so some features may not work correctly. Please run firebase login to authenticate the CLI.
# <<
#
if [[ true ]]; then
  KEY1="Detected demo project"
  KEY2="You are not signed in to the Firebase CLI"
  KEY3="You are not currently authenticated"
  echo "grep -v ${KEY1// /.}\\|${KEY2// /.}\\|${KEY3// /.}"
fi

#>&2 echo "(( Some Firebase Emulator warnings SUPPRESSED. ))"
