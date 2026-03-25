import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'

import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'

import { useShoppingAssistantTracking } from '../useShoppingAssistantTracking'

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

describe('useShoppingAssistantTracking', () => {
    const defaultProps = {
        shopName: 'TestShop',
    }

    const expectedEventContext = {
        shopName: defaultProps.shopName,
    }

    it('should log AiAgentShoppingAssistantAnalyticsViewed event', () => {
        const { result } = renderHook(() =>
            useShoppingAssistantTracking(defaultProps),
        )

        result.current.onShoppingAssistantAnalyticsViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentShoppingAssistantAnalyticsViewed,
            expectedEventContext,
        )
    })

    it('should log AiAgentShoppingAssistantStrategyViewed event', () => {
        const { result } = renderHook(() =>
            useShoppingAssistantTracking(defaultProps),
        )

        result.current.onShoppingAssistantStrategyViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentShoppingAssistantStrategyViewed,
            expectedEventContext,
        )
    })

    it('should log AiAgentShoppingAssistantCustomerEngagementViewed event', () => {
        const { result } = renderHook(() =>
            useShoppingAssistantTracking(defaultProps),
        )

        result.current.onShoppingAssistantCustomerEngagementViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentShoppingAssistantCustomerEngagementViewed,
            expectedEventContext,
        )
    })

    it('should log AiAgentShoppingAssistantCustomerEngagementUpdated event', () => {
        const { result } = renderHook(() =>
            useShoppingAssistantTracking(defaultProps),
        )

        const mockSetting = {
            triggerOnSearch: 'on',
            suggestedProductQuestion: 'off',
            askAnythingInput: 'on',
        }

        result.current.onShoppingAssistantCustomerEngagementUpdated({
            customerEngagementSetting: mockSetting,
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentShoppingAssistantCustomerEngagementUpdated,
            {
                ...expectedEventContext,
                customerEngagementSetting: mockSetting,
            },
        )
    })

    it('should log AiAgentShoppingAssistantStrategyUpdated event', () => {
        const { result } = renderHook(() =>
            useShoppingAssistantTracking(defaultProps),
        )

        const mockStrategy = {
            sellingStyle: PersuasionLevel.Educational,
            discountStrategy: DiscountStrategy.Minimal,
        }

        result.current.onShoppingAssistantStrategyUpdated({
            strategy: mockStrategy,
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentShoppingAssistantStrategyUpdated,
            {
                ...expectedEventContext,
                strategy: mockStrategy,
            },
        )
    })

    it('should update event context when shopName changes', () => {
        const { result, rerender } = renderHook(
            (props) => useShoppingAssistantTracking(props),
            { initialProps: defaultProps },
        )

        result.current.onShoppingAssistantAnalyticsViewed()
        expect(mockLogEvent).toHaveBeenLastCalledWith(
            SegmentEvent.AiAgentShoppingAssistantAnalyticsViewed,
            expectedEventContext,
        )

        const newShopName = 'NewTestShop'
        rerender({ shopName: newShopName })

        result.current.onShoppingAssistantAnalyticsViewed()
        expect(mockLogEvent).toHaveBeenLastCalledWith(
            SegmentEvent.AiAgentShoppingAssistantAnalyticsViewed,
            { shopName: newShopName },
        )
    })
})
