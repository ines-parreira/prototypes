import { useMemo } from 'react'

import { SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD } from '../constants/shoppingAssistant'

export const useTrialDescription = (
    trialAccess: any,
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
            return {
                description: 'Go beyond automation and grow revenue by 1.5%.',
                shouldShowDescriptionIcon: false,
            }
        }

        const isInTrial =
            trialAccess.hasCurrentStoreTrialStarted ||
            trialAccess.hasAnyTrialStarted

        const isOptedOut =
            trialAccess.hasCurrentStoreTrialOptedOut ||
            trialAccess.hasAnyTrialOptedOut

        const gmvAboveThreshold =
            gmvInfluencedRate >
            SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD
        const shouldShow = isInTrial && (isOptedOut || gmvAboveThreshold)

        return {
            description:
                shouldShow && !isLoading
                    ? `${gmvInfluenced} GMV influenced`
                    : '',
            shouldShowDescriptionIcon: shouldShow,
        }
    }, [
        trialAccess,
        gmvInfluenced,
        gmvInfluencedRate,
        isLoading,
        isTrialProgress,
    ])
}
