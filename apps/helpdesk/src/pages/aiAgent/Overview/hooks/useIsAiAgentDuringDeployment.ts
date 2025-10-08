import { useLocalStorage } from '@repo/hooks'

export function useIsAiAgentDuringDeployment(defaultValue = false) {
    return useLocalStorage('is-ai-agent-during-deployment', defaultValue)
}
