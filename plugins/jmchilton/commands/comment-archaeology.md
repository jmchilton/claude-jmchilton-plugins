Review docstrings and inline comments on a set of changes for "code archaeology" smell — comments that describe a previous implementation, a plan, or a commit-message-worthy bit of history instead of describing the current code as if it were designed well.

Accept input in one of three forms:
1. A Git commit reference or range (review comments added/modified by that commit / range)
2. A working directory path with no explicit ref (review the diff against the upstream / default branch — typically `dev` or `main`)
3. A list of file paths (review every new or modified comment / docstring in those files)

## The smell

Legacy code documentation is legitimate **when behavior must be preserved and the reason is non-obvious**. The smell is comments whose primary content is a retrospective narration of what the previous code did, written into a refactor instead of into the commit message. Common shapes:

- "The legacy two-pass code applied X then Y; we reproduce that by …"
- "Previously this used FooBar — we changed to BazQux because …"
- "The legacy contract relied upon by `test_foo.py::test_bar`."
- A docstring that explains why the file / function lives here rather than somewhere else.
- Speculative future-proofing ("lets future schemes slot in without bloating X").
- Section divider blocks like `# --- Entry shapes ---` with a paragraph defending a design choice.
- Test-path references baked into comments (rots when tests are renamed).

Flag also when a justified preservation comment is **bloated** — i.e. it correctly notes "we preserve the legacy ordering" but spends four lines re-narrating the legacy ordering when one line stating the current invariant would do.

## What to leave alone

- Cross-references to currently-existing siblings (e.g. "matches the semantics of `active_dataset_collections`" when that method still exists in the same module).
- Comments that explain a **non-obvious invariant in the current code** without invoking the previous code (e.g. "rows_consumed, not len(rows), is the right cursor advance because …").
- One-line "why" comments for surprising-looking current code.

## What to do

1. Resolve the input to a concrete diff and list the files touched.
2. For each new or modified comment / docstring, judge it against the smell criteria above. Read enough surrounding code to tell whether the comment is narrating history or describing a current invariant.
3. For each hit, produce:
   - **File:line** reference
   - The offending comment (quoted, trimmed)
   - One-sentence explanation of why it reads as archaeology
   - A concise rewrite suggestion (state the current invariant, drop the historical narration)
4. Separately note anything you considered but **chose to leave alone** so the reviewer can sanity-check the boundary.
5. End with a one-paragraph overall read: "found N hits / N reviewed / nothing caught".

## Tone

- It is fine — and common — to catch nothing. Do not invent hits to justify the review.
- Do not edit code unless explicitly asked. This is a review command.
- Be terse.
