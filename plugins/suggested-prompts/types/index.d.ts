export type SuggestedPrompt = { label: string; text: string }
export type AgentProfile = { name: string; agent: 'claude' | 'codex'; model?: string; effort?: string; args: string[] }

declare module 'claude-code' {
  interface PluginState {
    'suggested-prompts': {
      prompts: SuggestedPrompt[]
      lastPrompt: string | null
      agentDirs: string[]
      profileDir: string | null
      profiles: AgentProfile[]
    }
  }
}
