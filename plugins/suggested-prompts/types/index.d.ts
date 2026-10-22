export type SuggestedPrompt = { label: string; text: string }

declare module 'claude-code' {
  interface PluginState {
    'suggested-prompts': { prompts: SuggestedPrompt[]; lastPrompt: string | null }
  }
}
