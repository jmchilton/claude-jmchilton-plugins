The user will supply you with a plan file that
has been implemented.

Launch a subagent to review the plan against the
implemented code. Evaluate how the implementation
went against the plan - does it look correct,
do the places things deviated make sense, does it
look like the plan is done or do we need to 
update the plan to track progress.

Come up with a list of prioritized potential next steps.

Have the subagent write the summary of this research to a file in the same directory as the
plan with _DEBRIEF appended to the basename
of the plan file.

The subagent, should use the AskUserQuestionTool to determine if we should update the plan with
our progress or not, and if not if we should create a new plan with follow up actions or not.
The subagent should should also use the AskUserQuestionTool to figure out which of the follow up actions make sense to include in the
follow up plan document if one is being created.
