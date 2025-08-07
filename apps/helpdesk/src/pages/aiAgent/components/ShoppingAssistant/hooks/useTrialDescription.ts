import { useMemo } from 'react'

import { ShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'

import {
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
} from '../constants/shoppingAssistant'

export const useTrialDescription = (
    trialAccess: ShoppingAssistantTrialAccess,
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
            if (trialAccess.canNotifyAdmin) {
                description = `Try AI Agent's shopping assistant capabilities for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days.`
            }

            return {
                description,
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
