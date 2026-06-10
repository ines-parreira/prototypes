import { useLocalStorage } from '@gorgias/toolkit-react'

export function useIsAiAgentDuringDeployment(defaultValue = false) {
    return useLocalStorage('is-ai-agent-during-deployment', defaultValue)
}
