import { TrialType } from '../types/ShoppingAssistant'

const TITLES = {
    AI_AGENT_TRIAL: 'AI Agent trial',
    AI_AGENT: 'AI Agent',
    TRY_AI_AGENT: 'Try AI Agent for free',
    AI_AGENT_AND_SHOPPING_ASSISTANT: 'AI Agent & Shopping Assistant',
    SHOPPING_ASSISTANT_TRIAL: 'Shopping Assistant trial',
    UNLOCK_AI_AGENT_SKILLS: 'Unlock new AI Agent skills',
} as const

export const getPromoCardTitle = (
    isExpandingTrialExperienceMilestone2Enabled: boolean,
    trialType: TrialType,
    isTrialProgress: boolean,
    canSeeTrialCTA: boolean,
    isOnboarded?: boolean,
): string => {
    if (trialType === TrialType.AiAgent) {
        if (isTrialProgress) return TITLES.AI_AGENT_TRIAL
        if (canSeeTrialCTA) return TITLES.AI_AGENT
        return TITLES.TRY_AI_AGENT
    }

    if (!isExpandingTrialExperienceMilestone2Enabled) {
        return TITLES.UNLOCK_AI_AGENT_SKILLS
    }

    if (isTrialProgress) {
        return TITLES.SHOPPING_ASSISTANT_TRIAL
    }

    if (isOnboarded === false) {
        return TITLES.AI_AGENT_AND_SHOPPING_ASSISTANT
    }

    return TITLES.UNLOCK_AI_AGENT_SKILLS
}
