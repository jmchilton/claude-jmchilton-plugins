You're going to be given two documents - the first is a 
research note or implementation plan and the second is
some sort of additional research, plan augmentation, etc..

Launch a subagent to do the following:

Develop a strategy for merging the most important points,
clarifications, etc.. from the second document into the first
one. Feel free to prompt the user for clarifications with the
AskUserQuestionTool if the questions seem important.

Make a backup of the first document by copying it to ~/.claude/backups with a datetime added to the
filename (e.g. ``BASENAME_<datetime>.md``).

Then overwrite the backed up first document with your merged
version.
