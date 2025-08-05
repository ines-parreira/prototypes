import moment from 'moment'

import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'

const EMPTY_TRIAL_ENDING = {
    remainingDays: 0,
    remainingDaysFloat: 0,
    trialEndDatetime: undefined,
    trialTerminationDatetime: undefined,
    optedOutDatetime: undefined,
}

export const useTrialEnding = (storeName: string) => {
    const { storeActivations } = useStoreActivations({ storeName })

    // Get the specific store activation
    const storeActivation = storeActivations[storeName]
    if (!storeActivation) {
        return EMPTY_TRIAL_ENDING
    }

    // Use stable date calculation
    const now = moment().startOf('hour')

    const trialStartDatetime =
        storeActivation.configuration.sales?.trial.startDatetime
    const trialEndDatetime =
        storeActivation.configuration.sales?.trial.endDatetime
    const optedOutDatetime =
        storeActivation.configuration.sales?.trial.account.optOutDatetime

    if (!trialStartDatetime || !trialEndDatetime) {
        return EMPTY_TRIAL_ENDING
    }

    const trialEndDate = moment(trialEndDatetime)
    const remainingDaysFloat = trialEndDate.diff(now, 'days', true)
    const remainingDays = Math.max(0, Math.round(remainingDaysFloat))

    const trialTerminationDatetime =
        storeActivation.configuration.sales?.trial.account
            .actualTerminationDatetime

    return {
        remainingDays,
        remainingDaysFloat,
        trialEndDatetime: trialEndDate.toISOString(),
        trialTerminationDatetime,
        optedOutDatetime,
    }
}
