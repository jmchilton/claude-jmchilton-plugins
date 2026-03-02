The current commit is contains a bunch of random linting
fixes and such - small things that belong in other commits.
Break up this commit into smaller commits that the user can
then interactively rebase. The commit messages should indicate which target commit each new commit should be
rebased into.

If the user provides a commit or branch - that commit represents the starting point that these commits could
potentially belong in.
