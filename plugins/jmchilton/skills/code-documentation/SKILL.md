---
name: code-documentation
description: Write or update documentation for software, including READMEs, setup guides, API descriptions, examples, and migration notes. Use when accuracy depends on the current code and its behavior.
---

# Code documentation

Inspect the relevant code, configuration, tests, and existing docs before describing behavior. Identify the intended reader and the task they need to complete.

## John's hard rules

- No semicolons in prose. Use a period, a closed em-dash, or a comma. Preserve punctuation inside quotations, citations, code, and data.
- Use closed em-dashes (`—`) for appositive naming and load-bearing asides, without surrounding spaces. Use them where they help the sentence, not as decoration.
- Keep overviews and opening summaries conceptual and accessible. Put API names, file formats, and implementation terms in the sections where readers need them.
- Keep a metaphor only when it explains something the literal sentence cannot. Prefer concrete behavior to decorative flourishes.
- In original prose, avoid `ships` and `ships today`, `substrate` as technology jargon, `uses rather than owns`, and `gate` for a human decision. Name the actual behavior, infrastructure, ownership arrangement, or approval step instead. Literal, technical, and quoted uses can remain.

## Draft and verify

- Open with the user task and the observable result. Put the most common path first. Move internal architecture into a later section when readers need it.
- For each workflow, show inputs, the action or command, expected output, and the next step. Explain why a step matters when its purpose is not obvious.
- Use names, defaults, arguments, and output formats that match the current implementation. Distinguish released behavior from planned behavior.
- Make examples minimal and runnable when practical. Run commands or checks that are available locally. Otherwise state what remains unverified.
- Define domain terms by their effect on the user's data or task. Replace vague capability claims with concrete behavior and conditions under which it works.
- Document prerequisites, configuration, likely errors, and limitations that affect the user's next step. Link to source or deeper references instead of repeating large code blocks.
- When updating docs after a code change, check related pages and examples for contradictions.

Before delivery, verify paths, commands, links, and examples. Remove repetitive introductions, promotional adjectives, and closing promises. Say which claims were checked against code and which still need confirmation.
