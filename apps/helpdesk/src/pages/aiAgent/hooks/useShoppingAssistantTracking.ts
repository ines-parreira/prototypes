import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import type { DiscountStrategy } from '../Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import type { PersuasionLevel } from '../Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'

interface useShoppingAssistantTrackingProps {
    shopName: string
}

interface ShoppingAssistantTrackingCallbacks {
    onShoppingAssistantAnalyticsViewed: () => void
    onShoppingAssistantCustomerEngagementViewed: () => void
    onShoppingAssistantStrategyViewed: () => void
    onShoppingAssistantCustomerEngagementUpdated: ({
        customerEngagementSetting,
    }: {
        customerEngagementSetting: {
            triggerOnSearch: string
            suggestedProductQuestion: string
            askAnythingInput: string
        }
    }) => void
    onShoppingAssistantStrategyUpdated: ({
        strategy,
    }: {
        strategy: {
            sellingStyle: PersuasionLevel
            discountStrategy: DiscountStrategy
        }
    }) => void
}

export const useShoppingAssistantTracking = ({
    shopName,
}: useShoppingAssistantTrackingProps): ShoppingAssistantTrackingCallbacks => {
    const eventContext = useMemo(() => ({ shopName }), [shopName])

    const onShoppingAssistantAnalyticsViewed = useCallback(() => {
        logEvent(SegmentEvent.AiAgentShoppingAssistantAnalyticsViewed, {
            ...eventContext,
        })
    }, [eventContext])

    const onShoppingAssistantCustomerEngagementViewed = useCallback(() => {
        logEvent(
            SegmentEvent.AiAgentShoppingAssistantCustomerEngagementViewed,
            {
                ...eventContext,
            },
        )
    }, [eventContext])

    const onShoppingAssistantStrategyViewed = useCallback(() => {
        logEvent(SegmentEvent.AiAgentShoppingAssistantStrategyViewed, {
            ...eventContext,
        })
    }, [eventContext])

    const onShoppingAssistantCustomerEngagementUpdated = useCallback(
        ({
            customerEngagementSetting,
        }: {
            customerEngagementSetting: {
                triggerOnSearch: string
                suggestedProductQuestion: string
                askAnythingInput: string
            }
        }) => {
            logEvent(
                SegmentEvent.AiAgentShoppingAssistantCustomerEngagementUpdated,
                {
                    ...eventContext,
                    customerEngagementSetting,
                },
            )
        },
        [eventContext],
    )

    const onShoppingAssistantStrategyUpdated = useCallback(
        ({
            strategy,
        }: {
            strategy: {
                sellingStyle: PersuasionLevel
                discountStrategy: DiscountStrategy
            }
        }) => {
            logEvent(SegmentEvent.AiAgentShoppingAssistantStrategyUpdated, {
                ...eventContext,
                strategy,
            })
        },
        [eventContext],
    )

    return {
        onShoppingAssistantAnalyticsViewed,
        onShoppingAssistantCustomerEngagementViewed,
        onShoppingAssistantStrategyViewed,
        onShoppingAssistantCustomerEngagementUpdated,
        onShoppingAssistantStrategyUpdated,
    }
}
