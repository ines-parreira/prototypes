import { useCallback, useMemo, useState } from 'react'

import moment from 'moment'

import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'

const TRIAL_ENDED_DISMISSED_KEY = 'ai-agent-trial-ended-dismissed'
const TRIAL_ENDING_TOMORROW_DISMISSED_KEY =
    'ai-agent-trial-ending-tomorrow-dismissed'

export const useTrialEnding = () => {
    const { remainingDays, trialEndTime } = useTrialMetrics()

    const trialMilestone = useSalesTrialRevampMilestone()
    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    // Track dismissal state to trigger re-renders
    const [isTrialEndedDismissed, setIsTrialEndedDismissed] = useState(
        () => localStorage.getItem(TRIAL_ENDED_DISMISSED_KEY) === 'true',
    )
    const [isTrialEndingTomorrowDismissed, setIsTrialEndingTomorrowDismissed] =
        useState(
            () =>
                localStorage.getItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY) ===
                'true',
        )

    const isTrialEnded = useMemo(() => {
        if (isTrialEndedDismissed || !isRevampTrialMilestone1Enabled) {
            return false
        }

        // If we have trialEndTime, use it for more precise calculation
        if (trialEndTime) {
            const now = moment()
            const trialEndTimeMoment = moment(trialEndTime)
            return trialEndTimeMoment.isBefore(now)
        }

        // Fallback to remainingDays logic
        return remainingDays <= 0
    }, [
        isTrialEndedDismissed,
        isRevampTrialMilestone1Enabled,
        trialEndTime,
        remainingDays,
    ])

    const isTrialEndingTomorrow = useMemo(() => {
        if (isTrialEndingTomorrowDismissed || !isRevampTrialMilestone1Enabled) {
            return false
        }

        return remainingDays === 1
    }, [
        remainingDays,
        isTrialEndingTomorrowDismissed,
        isRevampTrialMilestone1Enabled,
    ])

    const dismissTrialEnded = useCallback(() => {
        localStorage.setItem(TRIAL_ENDED_DISMISSED_KEY, 'true')
        setIsTrialEndedDismissed(true)
    }, [])

    const dismissTrialEndingTomorrow = useCallback(() => {
        localStorage.setItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY, 'true')
        setIsTrialEndingTomorrowDismissed(true)
    }, [])

    return {
        isTrialEnded,
        isTrialEndingTomorrow,
        dismissTrialEnded,
        dismissTrialEndingTomorrow,
    }
}
