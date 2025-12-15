import { TrialType } from '../types/ShoppingAssistant'

const TITLES = {
    // User isn't yet onboarded
    AI_AGENT_AND_SHOPPING_ASSISTANT: 'AI Agent & Shopping Assistant',

    // Pre-trial CTAs
    SEE_AI_AGENT_IN_ACTION: 'See AI Agent in action',
    UNLOCK_AI_AGENT_SKILLS: 'Unlock new AI Agent skills',

    // Trial is active
    AI_AGENT_TRIAL: 'AI Agent trial',
    SHOPPING_ASSISTANT_TRIAL: 'Shopping Assistant trial',
} as const

export const getPromoCardTitle = (
    isExpandingTrialExperienceMilestone2Enabled: boolean,
    trialType: TrialType,
    isTrialProgress: boolean,
    isOnboarded?: boolean,
): string => {
    if (trialType === TrialType.AiAgent) {
        if (isTrialProgress) return TITLES.AI_AGENT_TRIAL
        return TITLES.SEE_AI_AGENT_IN_ACTION
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
