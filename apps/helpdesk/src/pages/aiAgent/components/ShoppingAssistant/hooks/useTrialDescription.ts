import { useMemo } from 'react'

import {
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
} from '../constants/shoppingAssistant'

export const useTrialDescription = (
    canNotifyAdmin: boolean,
    trialMetrics: {
        gmvInfluenced: string
        gmvInfluencedRate: number
        isLoading: boolean
    },
    isTrialProgress: boolean,
): {
    description: string
    shouldShowDescriptionIcon: boolean
} => {
    const { gmvInfluenced, gmvInfluencedRate, isLoading } = trialMetrics

    return useMemo(() => {
        if (!isTrialProgress) {
            let description = 'Go beyond automation and grow revenue by 1.5%.'
            if (canNotifyAdmin) {
                description = `Try AI Agent's shopping assistant capabilities for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days.`
            }

            return {
                description,
                shouldShowDescriptionIcon: false,
            }
        }

        const gmvAboveThreshold =
            gmvInfluencedRate >
            SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD
        const shouldShow = isTrialProgress && gmvAboveThreshold

        return {
            description:
                shouldShow && !isLoading
                    ? `${gmvInfluenced} GMV influenced`
                    : '',
            shouldShowDescriptionIcon: shouldShow,
        }
    }, [
        canNotifyAdmin,
        gmvInfluenced,
        gmvInfluencedRate,
        isLoading,
        isTrialProgress,
    ])
}
