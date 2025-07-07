import { useCallback, useMemo } from 'react'

import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'

const TRIAL_ENDED_DISMISSED_KEY = 'ai-agent-trial-ended-dismissed'
const TRIAL_ENDING_TOMORROW_DISMISSED_KEY =
    'ai-agent-trial-ending-tomorrow-dismissed'

export const useTrialEnding = () => {
    const { storeActivations } = useStoreActivations()

    const isTrialEnded = useMemo(() => {
        const hasTrialEndedDismissed =
            localStorage.getItem(TRIAL_ENDED_DISMISSED_KEY) === 'true'
        if (hasTrialEndedDismissed) {
            return false
        }

        const now = new Date()
        return Object.values(storeActivations).some((storeActivation) => {
            const endDatetime =
                storeActivation.configuration?.sales?.trial.endDatetime
            if (!endDatetime) return false

            const endDate = new Date(endDatetime)
            return endDate <= now
        })
    }, [storeActivations])

    const isTrialEndingTomorrow = useMemo(() => {
        const hasTrialEndingTomorrowDismissed =
            localStorage.getItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY) === 'true'
        if (hasTrialEndingTomorrowDismissed) {
            return false
        }

        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)

        return Object.values(storeActivations).some((storeActivation) => {
            const endDatetime =
                storeActivation.configuration?.sales?.trial.endDatetime
            if (!endDatetime) return false

            const endDate = new Date(endDatetime)
            return endDate > now && endDate <= tomorrow
        })
    }, [storeActivations])

    const dismissTrialEnded = useCallback(() => {
        localStorage.setItem(TRIAL_ENDED_DISMISSED_KEY, 'true')
    }, [])

    const dismissTrialEndingTomorrow = useCallback(() => {
        localStorage.setItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY, 'true')
    }, [])

    return {
        isTrialEnded,
        isTrialEndingTomorrow,
        dismissTrialEnded,
        dismissTrialEndingTomorrow,
    }
}
