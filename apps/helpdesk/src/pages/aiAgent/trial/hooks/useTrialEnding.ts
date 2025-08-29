import moment from 'moment'

import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    AI_AGENT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
} from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

const EMPTY_TRIAL_ENDING = {
    remainingDays: 0,
    remainingDaysFloat: 0,
    isTrialExtended: false,
    trialEndDatetime: null,
    trialTerminationDatetime: null,
    optedOutDatetime: null,
}

export const useTrialEnding = (storeName: string, trialType: TrialType) => {
    const isAiAgent = trialType === TrialType.AiAgent
    const { storeActivations } = useStoreActivations({ storeName })

    // Get the specific store activation
    const storeActivation = storeActivations[storeName]
    if (!storeActivation) {
        return EMPTY_TRIAL_ENDING
    }

    // Use stable date calculation
    const now = moment().startOf('hour')

    // Get trial configuration based on trial type
    const trialConfig = isAiAgent
        ? storeActivation.configuration.trial
        : storeActivation.configuration.sales?.trial
    const trialDuration = isAiAgent
        ? AI_AGENT_TRIAL_DURATION_DAYS
        : SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS

    if (!trialConfig) {
        return EMPTY_TRIAL_ENDING
    }

    const trialStartDatetime = trialConfig.startDatetime
    const trialEndDatetime = trialConfig.endDatetime
    const optedOutDatetime = trialConfig.account?.optOutDatetime

    if (!trialStartDatetime || !trialEndDatetime) {
        return EMPTY_TRIAL_ENDING
    }

    const trialEndDate = moment(trialEndDatetime)
    const remainingDaysFloat = trialEndDate.diff(now, 'days', true)
    const remainingDays = Math.max(0, Math.round(remainingDaysFloat))

    const trialTerminationDatetime =
        trialConfig.account?.actualTerminationDatetime

    const isTrialExtended = now.diff(trialStartDatetime, 'days') > trialDuration

    return {
        remainingDays,
        remainingDaysFloat,
        isTrialExtended,
        trialEndDatetime: trialEndDate.toISOString(),
        trialTerminationDatetime,
        optedOutDatetime,
    }
}
