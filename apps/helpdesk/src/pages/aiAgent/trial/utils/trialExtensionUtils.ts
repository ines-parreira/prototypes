import moment from 'moment'

import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

export const SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY =
    'ai-agent-trial-extension-requested-timestamp'
export const AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY =
    'trial-extension-requested-timestamp'

export const COOLDOWN_WAIT_HOURS = 24

const getLastRequestTimestamp = (trialType: TrialType): number | null => {
    const key =
        trialType === TrialType.AiAgent
            ? AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY
            : SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY
    const stored = localStorage.getItem(key)
    if (!stored) {
        return null
    }

    const parsed = parseInt(stored, 10)
    return isNaN(parsed) ? null : parsed
}

export const canRequestTrialExtension = (trialType: TrialType): boolean => {
    const lastRequestTimestamp = getLastRequestTimestamp(trialType)
    return (
        lastRequestTimestamp === null ||
        moment().diff(moment(lastRequestTimestamp), 'hours') >=
            COOLDOWN_WAIT_HOURS
    )
}

export const markTrialExtensionRequested = (trialType: TrialType): void => {
    const timestamp = moment().valueOf()
    const key =
        trialType === TrialType.AiAgent
            ? AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY
            : SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY
    localStorage.setItem(key, timestamp.toString())
}
