import { expect, test } from 'claude-code/testing'

import { appendPrompt, parsePrompts, parseProfiles, profileArgs, quickEmoji } from '../hooks/register'

const MD = `# Suggested

## Polish
\`\`\`
Run ./POLISH_BRANCH.md <branch_name>
\`\`\`

## Good morning
`

const PANE = {
  plugin: 'suggested-prompts',
  component: 'Pane',
  requestId: 'suggested-prompts',
  surface: 'terminal',
  props: {
    title: 'Suggested prompts',
    isFocused: true,
    bodyColumns: 80,
    placement: 'inline',
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

test('sections become prompts, fences stripped, empty body uses label', async () => {
  expect(parsePrompts(MD)).toEqual([
    { label: 'Polish', text: 'Run ./POLISH_BRANCH.md <branch_name>' },
    { label: 'Good morning', text: 'Good morning' },
  ])
})

test('bullets are prompts when there are no sections', async () => {
  expect(parsePrompts('intro\n- Run ./TICK.md\n* Launch a review of 123\n')).toEqual([
    { label: 'Run ./TICK.md', text: 'Run ./TICK.md' },
    { label: 'Launch a review of 123', text: 'Launch a review of 123' },
  ])
})

async function openPicker($: any, on: any, done: { submitted: string[]; filled: string[] }) {
  on('command.register', () => ({ value: { command: 'prompts' } }))
  on('session.cwd', () => ({ value: '/work' }))
  on('fs.exists', () => ({ value: true }))
  on('fs.read', () => ({ value: MD }))
  on('fs.list', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('prompt.submit', (_: unknown, e: { text: string }) => {
    done.submitted.push(e.text)
    return { text: e.text }
  })
  on('prompt.fill', (_: unknown, e: { text: string }) => {
    done.filled.push(e.text)
    return { isFilled: true }
  })
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/work', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'prompts', args: '' })
  return $.ui.mount(PANE)
}

test('Send submits the picked prompt', async ($, on) => {
  const done = { submitted: [] as string[], filled: [] as string[] }
  const ui = await openPicker($, on, done)
  await ui.press({ key: 'send:0' })
  expect(done).toEqual({ submitted: ['Run ./POLISH_BRANCH.md <branch_name>'], filled: [] })
  await ui.unmount()
})

test('Draft fills the prompt box without sending', async ($, on) => {
  const done = { submitted: [] as string[], filled: [] as string[] }
  const ui = await openPicker($, on, done)
  await ui.press({ key: 'draft:0' })
  expect(done).toEqual({ submitted: [], filled: ['Run ./POLISH_BRANCH.md <branch_name>'] })
  await ui.unmount()
})

test('the hint-line button opens the picker beside the engine hint', async ($, on) => {
  const opened: string[] = []
  on('ui.render', ($: any, e: any) => {
    const { Text } = $.ui.resolve(e)
    return <Text>? for shortcuts</Text>
  })
  on('command.register', () => ({ value: { command: 'prompts' } }))
  on('fs.exists', () => ({ value: true }))
  on('fs.read', () => ({ value: MD }))
  on('fs.list', () => ({ value: [] }))
  on('ui.open', (_: unknown, e: { id: string }) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/work', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({
    plugin: 'suggested-prompts',
    component: 'PromptHint',
    surface: 'terminal',
    props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
  } as any)
  expect((await ui.find({ type: 'Text', text: /shortcuts/ }))?.text).toBe('? for shortcuts')
  expect((await ui.find({ key: 'open' }))?.text).toBe('📋 2')
  await ui.press({ key: 'open' })
  expect(opened).toEqual(['suggested-prompts'])
  await ui.unmount()
})

test('appendPrompt adds a section, round-trips through parsePrompts', async () => {
  const out = appendPrompt(MD, 'Run ./TICK.md')
  expect(out.endsWith('## Good morning\n\n## Run ./TICK.md\nRun ./TICK.md\n')).toBe(true)
  expect(parsePrompts(out).map(one => one.text)).toEqual([
    'Run ./POLISH_BRANCH.md <branch_name>',
    'Good morning',
    'Run ./TICK.md',
  ])
})

test('appendPrompt fences multi-line prompts and keeps bullet files as bullets', async () => {
  const multi = 'Do this\n## not a heading'
  expect(parsePrompts(appendPrompt('', multi))).toEqual([{ label: 'Do this', text: multi }])
  expect(appendPrompt('- one\n', 'two')).toBe('- one\n- two\n')
})

test('Add last prompt appends the last typed prompt to the file', async ($, on) => {
  let file = MD
  on('command.register', () => ({ value: { command: 'prompts' } }))
  on('session.cwd', () => ({ value: '/work' }))
  on('fs.exists', () => ({ value: true }))
  on('fs.read', () => ({ value: file }))
  on('fs.list', () => ({ value: [] }))
  on('fs.write', (_: unknown, e: { text: string }) => {
    file = e.text
    return { value: undefined }
  })
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.toast', () => ({ value: undefined }))
  on('prompt.submit', (_: unknown, e: { text: string }) => ({ text: e.text }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/work', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'Run ./TICK.md', origin: { kind: 'composer' } } as any)
  await $.command.run({ command: 'prompts', args: '' } as any)
  const ui = await $.ui.mount(PANE)
  await ui.press({ key: 'add-last' })
  expect(parsePrompts(file).map(one => one.text)).toContain('Run ./TICK.md')
  expect(await ui.find({ key: 'add-last' })).toBeUndefined()
  await ui.unmount()
})

test('quickEmoji takes exactly one leading emoji', async () => {
  expect(quickEmoji('🔁 Sync vault')).toBe('🔁')
  expect(quickEmoji('🧑‍💻 Pair')).toBe('🧑‍💻')
  expect(quickEmoji('☀️ Morning')).toBe('☀️')
  expect(quickEmoji('🔁🔁 Twice')).toBeUndefined()
  expect(quickEmoji('Sync 🔁')).toBeUndefined()
  expect(quickEmoji('🔁')).toBeUndefined()
})

test('shared prompts merge after local ones and emoji ones get footer buttons that send', async ($, on) => {
  // Paths arrive resolved, so match the shared file by its directory.
  const fileFor = (path: string) =>
    path.endsWith('/_shared/SUGGESTED_PROMPTS.md')
      ? '## Tick\nRun ./TICK.md\n\n## 🔁 Sync vault\nRun ../_shared/VAULT_SYNC.md\n'
      : '## Tick\nRun ./TICK.md\n'
  const submitted: string[] = []
  on('ui.render', ($: any, e: any) => {
    const { Text } = $.ui.resolve(e)
    return <Text>? for shortcuts</Text>
  })
  on('command.register', () => ({ value: { command: 'prompts' } }))
  on('fs.exists', () => ({ value: true }))
  on('fs.read', (_: unknown, e: { path: string }) => ({ value: fileFor(e.path) }))
  on('fs.list', () => ({ value: [] }))
  on('prompt.submit', (_: unknown, e: { text: string }) => {
    submitted.push(e.text)
    return { text: e.text }
  })
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/work', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({
    plugin: 'suggested-prompts',
    component: 'PromptHint',
    surface: 'terminal',
    props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
  } as any)
  expect((await ui.find({ key: 'open' }))?.text).toBe('📋 2')
  expect((await ui.findAll({ type: 'Button' })).map(b => b.text)).toEqual(['🔁', '📋 2'])
  await ui.press({ key: 'quick:1' })
  expect(submitted).toEqual(['Run ../_shared/VAULT_SYNC.md'])
  await ui.unmount()
})

test('the toolbar ➕ comes first and its ⚡ launches a blank Claude', async ($, on) => {
  const runs: (readonly string[])[] = []
  const opened: string[] = []
  on('ui.render', ($: any, e: any) => {
    const { Text } = $.ui.resolve(e)
    return <Text>? for shortcuts</Text>
  })
  on('command.register', () => ({ value: { command: 'prompts' } }))
  on('fs.exists', (_: unknown, e: { path: string }) => ({ value: !e.path.endsWith('/docs/CLAUDE.md') }))
  on('fs.read', () => ({ value: MD }))
  on('fs.list', () => ({
    value: [
      { name: 'gx_reviews', kind: 'dir' },
      { name: '_shared', kind: 'dir' },
      { name: 'docs', kind: 'dir' },
      { name: 'gx_branches', kind: 'dir' },
      { name: 'README.md', kind: 'file' },
    ],
  }))
  on('process.run', (_: unknown, e: { argv: readonly string[] }) => {
    runs.push(e.argv)
    return { value: { exitCode: 0, stdout: "Launched claude 'gx_reviews'\n", stderr: '' } }
  })
  on('ui.open', (_: unknown, e: { id: string }) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('ui.close', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/agents/gx_branches', surface: 'terminal', isInteractive: true })
  const hint = await $.ui.mount({
    plugin: 'suggested-prompts',
    component: 'PromptHint',
    surface: 'terminal',
    props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
  } as any)
  expect((await hint.findAll({ type: 'Button' })).map(b => b.text)).toEqual(['➕', '✖', '📋 2'])
  await hint.press({ key: 'new' })
  expect(opened).toEqual(['new-agent'])
  const menu = await $.ui.mount({ ...PANE, requestId: 'new-agent', props: { ...PANE.props, title: 'New agent' } } as any)
  expect((await menu.findAll({ type: 'Button' })).map(b => b.text)).toEqual(['⚡', '⚙️', '⚡', '⚙️'])
  expect((await menu.find({ type: 'Text', text: /gx_reviews/ }))?.text).toBe(' gx_reviews')
  await menu.press({ key: 'new:gx_reviews' })
  expect(runs).toEqual([['sh', '../_shared/scripts/launch_agent.sh', 'gx_reviews', 'claude', 'gx_reviews', '']])
  await menu.unmount()
  await hint.unmount()
})

const PROFILES_YML = `# comment
profiles:
  - name: Opus (high)
    agent: claude
    effort: high
    model: opus
  # a note
  - name: Codex (default)
    agent: codex
  - name: Sol (high)   # trailing
    agent: codex
    model: "gpt-6.1-sol"
    effort: high
    args: [--search, '-x']
  - name: Broken
    agent: gemini
`

test('parseProfiles reads the profiles list and skips unknown agents', async () => {
  expect(parseProfiles(PROFILES_YML)).toEqual([
    { name: 'Opus (high)', agent: 'claude', model: 'opus', effort: 'high', args: [] },
    { name: 'Codex (default)', agent: 'codex', model: undefined, effort: undefined, args: [] },
    { name: 'Sol (high)', agent: 'codex', model: 'gpt-6.1-sol', effort: 'high', args: ['--search', '-x'] },
  ])
  expect(profileArgs(parseProfiles(PROFILES_YML)[2]!)).toEqual(['-m', 'gpt-6.1-sol', '-c', 'model_reasoning_effort="high"', '--search', '-x'])
})

test('⚙️ opens the profile menu and launches with its agent, model and effort', async ($, on) => {
  const runs: (readonly string[])[] = []
  const opened: string[] = []
  on('command.register', () => ({ value: { command: 'prompts' } }))
  on('fs.exists', () => ({ value: true }))
  on('fs.read', (_: unknown, e: { path: string }) => ({ value: e.path.endsWith('AGENT_PROFILES.yml') ? PROFILES_YML : MD }))
  on('fs.list', () => ({ value: [{ name: 'gx_reviews', kind: 'dir' }] }))
  on('process.run', (_: unknown, e: { argv: readonly string[] }) => {
    runs.push(e.argv)
    return { value: { exitCode: 0, stdout: 'Launched\n', stderr: '' } }
  })
  on('ui.open', (_: unknown, e: { id: string }) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  const closed: string[] = []
  on('ui.close', (_: unknown, e: { id: string }) => {
    closed.push(e.id)
    return { value: undefined }
  })
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/agents/gx_branches', surface: 'terminal', isInteractive: true })
  const menu = await $.ui.mount({ ...PANE, requestId: 'new-agent' } as any)
  await menu.press({ key: 'gear:gx_reviews' })
  expect(opened).toEqual(['new-agent-profile'])
  expect(closed).toEqual(['new-agent'])
  const pick = await $.ui.mount({ ...PANE, requestId: 'new-agent-profile' } as any)
  expect((await pick.findAll({ type: 'Button' })).map(b => b.text)).toEqual(['Opus (high)', 'Codex (default)', 'Sol (high)'])
  await pick.press({ key: 'profile:0' })
  expect(runs).toEqual([['sh', '../_shared/scripts/launch_agent.sh', 'gx_reviews', 'claude', 'gx_reviews', '', '--model', 'opus', '--effort', 'high']])
  await pick.unmount()
  await menu.unmount()
})

test('the toolbar ✖ closes this herdr pane', async ($, on) => {
  const runs: (readonly string[])[] = []
  on('ui.render', ($: any, e: any) => {
    const { Text } = $.ui.resolve(e)
    return <Text>? for shortcuts</Text>
  })
  on('command.register', () => ({ value: { command: 'prompts' } }))
  on('fs.exists', () => ({ value: true }))
  on('fs.read', () => ({ value: MD }))
  on('fs.list', () => ({ value: [{ name: 'gx_reviews', kind: 'dir' }] }))
  on('process.run', (_: unknown, e: { argv: readonly string[] }) => {
    runs.push(e.argv)
    return { value: { exitCode: 0, stdout: '', stderr: '' } }
  })
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/agents/gx_branches', surface: 'terminal', isInteractive: true })
  const hint = await $.ui.mount({
    plugin: 'suggested-prompts',
    component: 'PromptHint',
    surface: 'terminal',
    props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
  } as any)
  await hint.press({ key: 'close' })
  expect(runs).toEqual([['sh', '-c', 'herdr pane close "$HERDR_PANE_ID"']])
  await hint.unmount()
})
