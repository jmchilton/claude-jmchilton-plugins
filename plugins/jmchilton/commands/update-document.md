# update-document <file_path>

The specified document is out of date. Review recent repository changes and build a plan to update it.

**Usage:**
- `/update-document README.md` - Update the main README
- `/update-document PLAN.md` - Update implementation plan
- `/update-document docs/SCHEMA.md` - Update schema documentation

**What this does:**
1. Reviews recent git commits and changed files
2. Identifies outdated sections in the target document
3. Creates an update plan with specific changes needed
4. Can optionally implement the changes with user approval

**Additional context:**
If the user provides additional context, tailor the search and update plan accordingly.
