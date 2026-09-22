---
name: software-documentation
description: Write or update standalone software documentation such as help manuals, READMEs, user guides, tutorials, API reference pages, and migration guides. Do not use for docstrings or code comments.
---

# Software documentation

Read and apply the shared rules in [Writing](../writing/SKILL.md) first. This skill adds software documentation requirements.

Produce reader-facing pages outside the source code. Inspect relevant code, configuration, tests, and existing docs to verify behavior. Identify the intended reader and the task they need to complete.

## Draft and verify

- Choose the page's main job: teach through a guided example, solve a task, explain a concept, or provide exact reference facts. A README may combine these when one reader journey connects them. Split material when readers or goals conflict.
- Open with the user task and the observable result. Put the most common path first. Move internal architecture into a later section when readers need it.
- For each workflow, show prerequisites, inputs, the action or command, expected output, and the next step. Explain why a step matters when its purpose is not obvious. Include how to recognize success and recover from likely errors.
- Name the component that acts. Write `the parser rejects invalid input` or `the command writes a report` when the code supports it, instead of saying a feature `may help` or a system `is designed to enable` something.
- Use names, defaults, arguments, and output formats that match the current implementation. Distinguish released behavior from planned behavior.
- In reference material, expose accepted values, required or optional status, defaults, validation rules, side effects, and errors. Use a table when it makes those contracts easier to scan.
- Make examples minimal and runnable when practical. Run commands or checks that are available locally. Otherwise state what remains unverified.
- Define domain terms by their effect on the user's data or task. Replace vague capability claims with concrete behavior and the conditions under which it works.
- Give headings and major sections enough context to make sense when reached directly through search. Name the subject instead of relying on `this`, `it`, or `the above` without a clear referent.
- Document configuration and limitations that affect the user's next step. Link to source or deeper references instead of repeating large code blocks.
- When updating docs after a code change, check related pages and examples for contradictions.

Before delivery, follow the page as its intended reader. Can they tell when it applies, complete the task, recognize success, and recover from an expected failure? Verify paths, commands, links, and examples. Say which claims were checked against code and which still need confirmation.
