You will be given a plan file and an optional context about which questions to address.

There will be a list of unresolved or open questions toward the bottom of this plan, some of these
questions will have answers - either from "User" input (tagged as "User Input:" or "User:") or from
other research agents.

Launch a subagent to collect the questions with answers and filter this information back into the
main body of the plan. If the agent cannot find any relevant place to put this information - just have it
create a new "Additional Notes" section of the plan - someone thought the question was important and
we should reflect that. The subagent should then remove the now resolved or answered question.

If some questinos do not have answers or additional context - just keep them as is with perhaps a
reordering or renumbering. Have the subagent give you the new plan and a summary.

Copy the original plan to a unique file name with the datetime encoded in it into the ~/.claude/backup directory and overwrite the file with the new plan the subagent gave you. Show the user the summary the subagent came up 
with.