import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentProfile, SuggestedPrompt } from '../types'

const PANE = 'suggested-prompts'
const NEW_PANE = 'new-agent'
const PROFILE_PANE = 'new-agent-profile'
const FILE = 'SUGGESTED_PROMPTS.md'
const SHARED = '../_shared/SUGGESTED_PROMPTS.md'
const LABEL_MAX = 100
// galaxy-brain layout: agent dirs are siblings of the session's cwd.
const LAUNCH = '../_shared/scripts/launch_agent.sh'
const PROFILES = '../_shared/AGENT_PROFILES.yml'

const prompts = atom({ plugin: 'suggested-prompts', key: 'prompts' } as const, [])
const lastPrompt = atom({ plugin: 'suggested-prompts', key: 'lastPrompt' } as const, null)
const agentDirs = atom({ plugin: 'suggested-prompts', key: 'agentDirs' } as const, [])
const profileDir = atom({ plugin: 'suggested-prompts', key: 'profileDir' } as const, null)
const profiles = atom({ plugin: 'suggested-prompts', key: 'profiles' } as const, [])

// `## Label` sections (body is the prompt, the label when empty), else top-level bullets.
export function parsePrompts(markdown: string): SuggestedPrompt[] {
  const lines = markdown.split(/\r?\n/)
  const sections: SuggestedPrompt[] = []
  let label: string | null = null
  let body: string[] = []
  const flush = () => {
    if (label !== null) {
      const text = unfence(body.join('\n').trim())
      sections.push({ label, text: text || label })
    }
  }
  let isFenced = false
  for (const line of lines) {
    if (line.startsWith('```')) {
      isFenced = !isFenced
    }
    const heading = isFenced ? null : /^##\s+(.+?)\s*$/.exec(line)
    if (heading) {
      flush()
      label = heading[1] ?? ''
      body = []
    } else if (label !== null) {
      body.push(line)
    }
  }
  flush()
  if (sections.length > 0) {
    return sections
  }
  return lines
    .map(line => /^[-*]\s+(.+?)\s*$/.exec(line)?.[1])
    .filter((text): text is string => Boolean(text))
    .map(text => ({ label: text, text }))
}

function unfence(text: string): string {
  const fenced = /^```[^\n]*\n([\s\S]*?)\n```$/.exec(text)
  return fenced?.[1] ?? text
}

// New `## ` section, or a bullet when the file is a bullet list and the prompt is one line.
export function appendPrompt(markdown: string, text: string): string {
  const isBullets = !/^##\s/m.test(markdown) && /^[-*]\s/m.test(markdown)
  const isOneLine = !text.includes('\n')
  const entry = isBullets && isOneLine
    ? `- ${text}\n`
    : `## ${shorten(text.split('\n')[0] ?? text)}\n${isOneLine ? text : '```\n' + text + '\n```'}\n`
  const base = markdown.trimEnd()
  if (base === '') {
    return entry
  }
  return `${base}\n${isBullets && isOneLine ? '' : '\n'}${entry}`
}

// The label's leading emoji when it starts with exactly one, then a space.
export function quickEmoji(label: string): string | undefined {
  const match = /^(\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)\s+(?!\p{Extended_Pictographic})/u.exec(label)
  return match?.[1]
}

function shorten(text: string): string {
  const line = text.replace(/\s+/g, ' ')
  return line.length > LABEL_MAX ? `${line.slice(0, LABEL_MAX - 1)}…` : line
}

// This directory's prompts, then the shared ones it doesn't already have.
async function load($: EngineInterface): Promise<SuggestedPrompt[]> {
  const found: SuggestedPrompt[] = []
  for (const path of [FILE, SHARED]) {
    if (await $.fs.exists(path)) {
      for (const one of parsePrompts(await $.fs.read(path))) {
        if (!found.some(seen => seen.text === one.text)) {
          found.push(one)
        }
      }
    }
  }
  await update($, prompts, () => found)
  return found
}

// Sibling agent dirs (with a CLAUDE.md, not `_`-prefixed) when the launch script is there.
async function loadAgentDirs($: EngineInterface): Promise<string[]> {
  const dirs: string[] = []
  if (await $.fs.exists(LAUNCH)) {
    for (const entry of await $.fs.list('..')) {
      if (entry.kind === 'dir' && !entry.name.startsWith('_') && (await $.fs.exists(`../${entry.name}/CLAUDE.md`))) {
        dirs.push(entry.name)
      }
    }
  }
  dirs.sort()
  await update($, agentDirs, () => dirs)
  return dirs
}

// AGENT_PROFILES.yml's `profiles:` list: scalar fields plus an inline `args: [...]`.
export function parseProfiles(yaml: string): AgentProfile[] {
  const found: AgentProfile[] = []
  let entry: Record<string, string> | null = null
  const flush = () => {
    const agent = entry?.agent
    if (entry?.name && (agent === 'claude' || agent === 'codex')) {
      const args = (entry.args ?? '').replace(/^\[|\]$/g, '').split(',').map(unquote).filter(Boolean)
      found.push({ name: entry.name, agent, model: entry.model, effort: entry.effort, args })
    }
  }
  for (const line of yaml.split(/\r?\n/)) {
    const field = /^\s*(-\s+)?(\w+):\s*(.*?)\s*$/.exec(line.replace(/\s+#.*$/, ''))
    if (!field || line.trimStart().startsWith('#')) {
      continue
    }
    if (field[1]) {
      flush()
      entry = {}
    }
    if (entry) {
      entry[field[2]!] = unquote(field[3]!)
    }
  }
  flush()
  return found
}

function unquote(text: string): string {
  return text.trim().replace(/^(["'])(.*)\1$/, '$2')
}

// Same flags as the Obsidian launch dialog.
export function profileArgs(profile: AgentProfile): string[] {
  const args: string[] = []
  if (profile.agent === 'claude') {
    if (profile.model) args.push('--model', profile.model)
    if (profile.effort) args.push('--effort', profile.effort)
  } else {
    if (profile.model) args.push('-m', profile.model)
    if (profile.effort) args.push('-c', `model_reasoning_effort="${profile.effort}"`)
  }
  return [...args, ...profile.args]
}

// Closes this session's herdr pane (and its workspace when it was the last pane), ending Claude.
async function closeAgentPane($: EngineInterface): Promise<void> {
  const { exitCode, stdout, stderr } = await $.process.run(['sh', '-c', 'herdr pane close "$HERDR_PANE_ID"'])
  if (exitCode !== 0) {
    $.ui.toast(`Close failed: ${stderr.trim() || stdout.trim()}`)
  }
}

async function launchAgent($: EngineInterface, dir: string, profile?: AgentProfile): Promise<void> {
  await $.ui.close({ id: NEW_PANE })
  await $.ui.close({ id: PROFILE_PANE })
  const kind = profile?.agent ?? 'claude'
  const args = profile ? profileArgs(profile) : []
  const { exitCode, stdout, stderr } = await $.process.run(['sh', LAUNCH, dir, kind, dir, '', ...args], { timeoutMs: 90_000 })
  $.ui.toast(exitCode === 0 ? stdout.trim() : `New ${dir} agent failed: ${stderr.trim() || stdout.trim()}`)
}

async function openPicker($: EngineInterface, count: number): Promise<void> {
  await $.ui.open({
    id: PANE,
    title: 'Suggested prompts',
    focus: true,
    closeOnEscape: true,
    holdToasts: true,
    rows: Math.min(count, 12) + 4,
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'prompts',
      description: `Pick a prompt from ${FILE} to send or draft`,
    })
    const started = await next(e)
    await load($)
    await loadAgentDirs($)
    return started
  })

  on('prompt.submit', async ($, e, next) => {
    const submitted = await next(e)
    const text = e.text.trim()
    if (e.origin.kind === 'composer' && text !== '' && !text.startsWith('/')) {
      await update($, lastPrompt, () => text)
    }
    return submitted
  })

  on('command.run', { command: 'prompts' }, async $ => {
    const found = await load($)
    if (found.length === 0 && (await read($, lastPrompt)) === null) {
      return { text: `No prompts in ${FILE} in ${await $.session.cwd()}.` }
    }
    await openPicker($, found.length)
    return { text: '' }
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const engine = await next(e)
    const list = await read($, prompts)
    const dirs = await read($, agentDirs)
    if (list.length === 0 && dirs.length === 0) {
      return engine
    }
    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box>
        {engine}
        {dirs.length > 0 && [
          <Text> </Text>,
          <Button
            key="new"
            label="➕"
            onPress={async () => {
              const found = await loadAgentDirs($)
              if (found.length > 0) {
                await $.ui.open({ id: NEW_PANE, title: 'New agent', focus: true, closeOnEscape: true, holdToasts: true, rows: found.length + 3 })
              }
            }}
          />,
          <Text> </Text>,
          <Button key="close" label="✖" onPress={() => closeAgentPane($)} />,
        ]}
        {list.flatMap((one, i) => {
          const emoji = quickEmoji(one.label)
          return emoji === undefined ? [] : [
            <Text> </Text>,
            <Button
              key={`quick:${i}`}
              label={emoji}
              onPress={() => $.prompt.submit({ text: one.text, asUser: true })}
            />,
          ]
        })}
        {list.length > 0 && <Text> </Text>}
        {list.length > 0 && <Button
          key="open"
          label={`📋 ${list.length}`}
          onPress={async () => {
            const found = await load($)
            if (found.length > 0) {
              await openPicker($, found.length)
            }
          }}
        />}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: NEW_PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const dirs = await read($, agentDirs)
    return (
      <Box flexDirection="column">
        {dirs.map((dir, i) => (
          <Box key={`row:${dir}`}>
            <Button key={`new:${dir}`} label="⚡" autoFocus={i === 0 ? true : undefined} onPress={() => launchAgent($, dir)} />
            <Text> </Text>
            <Button
              key={`gear:${dir}`}
              label="⚙️"
              onPress={async () => {
                const list = (await $.fs.exists(PROFILES)) ? parseProfiles(await $.fs.read(PROFILES)) : []
                await update($, profiles, () => list)
                await update($, profileDir, () => dir)
                await $.ui.close({ id: NEW_PANE })
                await $.ui.open({ id: PROFILE_PANE, title: `New ${dir} agent`, focus: true, closeOnEscape: true, holdToasts: true, rows: list.length + 3 })
              }}
            />
            <Text> {dir}</Text>
          </Box>
        ))}
        <Text dimColor>⚡ blank Claude, ⚙️ pick model + effort; new herdr workspace. Esc closes</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PROFILE_PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const dir = await read($, profileDir)
    const list = await read($, profiles)
    return (
      <Box flexDirection="column">
        {dir !== null && list.map((profile, i) => (
          <Box key={`row:${i}`}>
            <Button key={`profile:${i}`} label={profile.name} autoFocus={i === 0 ? true : undefined} onPress={() => launchAgent($, dir, profile)} />
            <Text dimColor> {profile.agent} {profileArgs(profile).join(' ')}</Text>
          </Box>
        ))}
        {list.length === 0 && <Text>No profiles in {PROFILES}.</Text>}
        <Text dimColor>Esc closes</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const list = await read($, prompts)
    const last = await read($, lastPrompt)
    const isListed = last !== null && list.some(one => one.text === last)

    const addLast = async () => {
      if (last === null) {
        return
      }
      const existing = (await $.fs.exists(FILE)) ? await $.fs.read(FILE) : ''
      await $.fs.write(FILE, appendPrompt(existing, last))
      await load($)
      $.ui.toast(`Added to ${FILE}`)
    }

    const finish = async (prompt: SuggestedPrompt, action: 'send' | 'draft') => {
      await $.ui.close({ id: PANE })
      if (action === 'send') {
        await $.prompt.submit({ text: prompt.text, asUser: true })
      } else {
        await $.prompt.fill({ text: prompt.text })
      }
    }

    return (
      <Box flexDirection="column">
        {list.map((one, i) => (
          <Box key={`row:${i}`}>
            <Button
              key={`send:${i}`}
              label="Send"
              autoFocus={i === 0 ? true : undefined}
              onPress={() => finish(one, 'send')}
            />
            <Text> </Text>
            <Button
              key={`draft:${i}`}
              label="Draft"
              hotkey={i < 9 ? String(i + 1) : undefined}
              onPress={() => finish(one, 'draft')}
            />
            <Text> {i < 9 ? `${i + 1}. ` : '   '}{shorten(one.label)}</Text>
          </Box>
        ))}
        {last !== null && !isListed && (
          <Box>
            <Button key="add-last" label="Add last prompt" hotkey="a" onPress={addLast} />
            <Text dimColor> {shorten(last)}</Text>
          </Box>
        )}
        <Text dimColor>Arrows move, Enter presses, 1-9 drafts, a adds last prompt, Esc closes</Text>
      </Box>
    )
  })
}
