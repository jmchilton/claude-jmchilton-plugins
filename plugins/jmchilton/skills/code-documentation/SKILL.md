---
name: code-documentation
description: Write or update documentation for software, including READMEs, setup guides, API descriptions, examples, and migration notes. Use when accuracy depends on the current code and its behavior.
---

# Code documentation

Inspect the relevant code, configuration, tests, and existing docs before describing behavior. Identify the intended reader and the task they need to complete.

- Explain what the software does, how to use it, and what result to expect. Put the most common path first.
- Use names, defaults, arguments, and output formats that match the current implementation. Distinguish released behavior from planned behavior.
- Make examples minimal and runnable when practical. Run commands or checks that are available locally; otherwise state what remains unverified.
- Document prerequisites, configuration, errors, and limitations that affect a user's next step. Link to source or deeper references instead of repeating large code blocks.
- When updating docs after a code change, check related pages and examples for contradictions.

Before delivery, verify paths, commands, links, and examples. Say which claims were checked against code and which still need confirmation.
