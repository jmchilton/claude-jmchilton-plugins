Take the provided markdown file path containing a plan and publish it to a GitHub gist.

Steps:
1. Read the file to confirm it exists and extract a description from the first heading or first line
2. Create a public gist using `gh gist create --public --desc "<description>" <filepath>`
3. Return the gist URL for sharing

If no file path is provided, ask the user for the path to the plan markdown file.
