import moment from 'moment'

import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

const EMPTY_TRIAL_ENDING = {
    remainingDays: 0,
    remainingDaysFloat: 0,
    trialEndDatetime: null,
    trialTerminationDatetime: null,
    optedOutDatetime: null,
}

export const useTrialEnding = (storeName: string, trialType: TrialType) => {
    const { storeActivations } = useStoreActivations({ storeName })

    // Get the specific store activation
    const storeActivation = storeActivations[storeName]
    if (!storeActivation) {
        return EMPTY_TRIAL_ENDING
    }

    // Use stable date calculation
    const now = moment().startOf('hour')

    // Get trial configuration based on trial type
    const trialConfig =
        trialType === TrialType.AiAgent
            ? storeActivation.configuration.trial
            : storeActivation.configuration.sales?.trial

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

    return {
        remainingDays,
        remainingDaysFloat,
        trialEndDatetime: trialEndDate.toISOString(),
        trialTerminationDatetime,
        optedOutDatetime,
    }
}
