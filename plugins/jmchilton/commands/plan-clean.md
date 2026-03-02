# plan-clean

Flattens and normalizes phase/iteration/step structure in plan documents by renumbering sequentially and updating all cross-references.

## Description

This command processes plan documents that have been built iteratively with Claude, cleaning up:
- Out-of-order phases (e.g., Phase 1, Phase 1.5, Phase 2 → Phase 1, Phase 2, Phase 3)
- Non-sequential numbering that accumulates from multiple editing sessions
- All references throughout the document (section headers, cross-references, table of contents)
- Works with various naming conventions: Phase, Iteration, Step, or custom terms

## Usage

```bash
/cleanup-plan <path-to-plan>
```

## Parameters

- `path-to-plan` (required): Path to the markdown plan file to clean up (absolute or relative)

## Examples

```bash
# Clean up a plan file
/cleanup-plan ./planning/my-feature-plan.md

# Clean up with absolute path
/cleanup-plan /Users/username/projects/my-plan.md

# Clean up in current directory
/cleanup-plan plan.md
```

## What It Does

1. **Parse the Plan**
   - Reads the entire plan document
   - Identifies all phase/iteration/step references regardless of naming:
     - "Phase X", "Phase X.Y", "Phase X.Y.Z"
     - "Iteration X", "Iteration X.Y"
     - "Step X", "Step X.Y"
     - Case-insensitive matching (phase, PHASE, Phase, etc.)
   - Handles various punctuation and formatting patterns

2. **Extract Numbering**
   - Collects all unique phase identifiers found in the document
   - Sorts naturally (Phase 0 < Phase 1 < Phase 1.5 < Phase 2)
   - Identifies the naming convention used (Phase/Iteration/Step)

3. **Create Mapping**
   - Builds a sequential mapping:
     - Phase 0 → Phase 1
     - Phase 1 → Phase 2
     - Phase 1.5 → Phase 3
     - Phase 2 → Phase 4
   - Preserves the original naming convention

4. **Rewrite Document**
   - Updates all phase definitions (headers, list items)
   - Updates all cross-references (links, text references)
   - Maintains original formatting and styling
   - Preserves all non-phase content

5. **Review & Validate**
   - Checks for consistency across all phase references
   - Identifies any broken or unclear references
   - Verifies that ordering makes logical sense in context
   - Flags any potential issues for manual review

## Output Format

### Before/After Mapping

```
Phase Renumbering:
- Phase 0 → Phase 1
- Phase 1 → Phase 2
- Phase 1.5 → Phase 3
- Phase 2 → Phase 4
```

### Cleaned Plan

The full reformatted plan with:
- All phase headers renumbered sequentially
- All cross-references updated
- Table of contents (if present) updated
- Consistent formatting maintained

### Review Checklist

A validation report noting:
- Total phases found and renumbered
- All reference updates made
- Any potential issues detected
- Confirmation that phase flow makes logical sense

## Common Patterns Handled

- Phase definitions in headers: `## Phase 1.5: Feature X` → `## Phase 2: Feature X`
- Inline references: `As discussed in Phase 0.5` → `As discussed in Phase 1`
- List items: `- Phase 2.1: Item` → `- Phase 3: Item`
- Table of contents entries
- Markdown links with phase references
- Multiple consecutive decimal phases (Phase 1.1, 1.2, 1.3)

## Best Practices

When using this command:

1. **Backup first**: Keep the original file in case of issues
2. **Review the mapping**: Check the before/after mapping carefully
3. **Verify cross-references**: Ensure phase relationships still make sense after renumbering
4. **Test any automation**: If the plan drives build scripts or automation, verify they still work
5. **Update related files**: Check if other files reference these phases

## Tips for Better Results

- **Use consistent naming**: Stick to one term (Phase, Iteration, or Step) throughout
- **Use simple numbering**: Avoid deeply nested phases (Phase X.Y.Z) when possible
- **Keep references clear**: Use consistent syntax for cross-references
- **Document dependencies**: Note phase dependencies before cleaning if important
- **Preserve context**: The command maintains your planning narrative - just fixes the numbering

## Notes

- The command preserves all content exactly except for phase numbering/references
- No content is removed or reordered - only numbers are updated
- Formatting (bold, italic, lists) is preserved
- Works with any heading level that contains phase references
- Case sensitivity is preserved for the phase naming convention
