---
name: code-documentation
description: Write or update documentation for software, including READMEs, setup guides, API descriptions, examples, and migration notes. Use when accuracy depends on the current code and its behavior.
---

# Code documentation

Inspect the relevant code, configuration, tests, and existing docs before describing behavior. Identify the intended reader and the task they need to complete.

- Open with the user task and the observable result. Put the most common path first; move internal architecture into a later section when readers need it.
- For each workflow, show inputs, the action or command, expected output, and the next step. Explain why a step matters when its purpose is not obvious.
- Use names, defaults, arguments, and output formats that match the current implementation. Distinguish released behavior from planned behavior.
- Make examples minimal and runnable when practical. Run commands or checks that are available locally; otherwise state what remains unverified.
- Define domain terms by their effect on the user's data or task. Replace vague capability claims with concrete behavior and conditions under which it works.
- Document prerequisites, configuration, likely errors, and limitations that affect the user's next step. Link to source or deeper references instead of repeating large code blocks.
- When updating docs after a code change, check related pages and examples for contradictions.

Before delivery, verify paths, commands, links, and examples. Remove repetitive introductions, promotional adjectives, and closing promises. Say which claims were checked against code and which still need confirmation.
