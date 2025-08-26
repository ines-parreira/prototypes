import { useMemo } from 'react'

import {
    AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD,
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
} from '../constants/shoppingAssistant'
import { TrialType } from '../types/ShoppingAssistant'

export const useTrialDescription = (
    canNotifyAdmin: boolean,
    trialMetrics: {
        gmvInfluenced: string
        gmvInfluencedRate: number
        isLoading: boolean
    },
    isTrialProgress: boolean,
    trialType: TrialType,
    automationRate?: {
        value: number
        prevValue: number
        isLoading: boolean
    },
): {
    description: string
    shouldShowDescriptionIcon: boolean
} => {
    const { gmvInfluenced, gmvInfluencedRate, isLoading } = trialMetrics

    return useMemo(() => {
        // AI Agent trial type logic
        if (trialType === TrialType.AiAgent) {
            if (!isTrialProgress) {
                let description =
                    'Enhance every step of the shopping journey, from pre to post-sales.'
                return {
                    description,
                    shouldShowDescriptionIcon: false,
                }
            }

            // Trial in progress - check automation rate above threshold (0.5%)
            const automationRateAboveThreshold =
                automationRate &&
                automationRate.value > AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD

            const shouldShow = Boolean(
                isTrialProgress &&
                    automationRateAboveThreshold &&
                    !automationRate?.isLoading,
            )

            return {
                description:
                    shouldShow && automationRate
                        ? `${(automationRate.value * 100).toFixed(1)}% automation rate`
                        : '',
                shouldShowDescriptionIcon: shouldShow,
            }
        }

        // Shopping Assistant trial type
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
        const shouldShow = isTrialProgress && gmvAboveThreshold && !isLoading

        return {
            description: shouldShow ? `${gmvInfluenced} GMV influenced` : '',
            shouldShowDescriptionIcon: shouldShow,
        }
    }, [
        canNotifyAdmin,
        gmvInfluenced,
        gmvInfluencedRate,
        isLoading,
        isTrialProgress,
        trialType,
        automationRate,
    ])
}
