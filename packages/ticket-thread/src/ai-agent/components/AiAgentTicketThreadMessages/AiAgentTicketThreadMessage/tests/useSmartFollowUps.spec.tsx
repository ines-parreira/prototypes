import { useFlag } from '@repo/feature-flags'

import { renderHook } from '../../../../../tests/render.utils'
import { useSmartFollowUps } from '../useSmartFollowUps'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        SmartFollowUps: 'smart-follow-ups',
    },
    useFlag: vi.fn(),
}))

const smartFollowUps = [
    {
        text: 'More than 20 miles',
        type: 'dynamic_follow_up' as const,
    },
    {
        text: 'Less than 5 miles',
        type: 'dynamic_follow_up' as const,
    },
]

const mockUseFlag = vi.mocked(useFlag)

describe('useSmartFollowUps', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    it('returns the default value when the feature is disabled', () => {
        const { result } = renderHook(() =>
            useSmartFollowUps({
                ticketMessageMetadata: {
                    smart_follow_ups: smartFollowUps,
                    selected_smart_follow_up_index: 0,
                },
            }),
        )

        expect(result.current).toEqual({
            showAllSmartFollowUps: false,
            shouldRenderMessageContent: true,
            shouldRenderSmartFollowUps: false,
            smartFollowUps: [],
        })
    })

    it('reads the quick replies URL toggle from search params', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(
            () =>
                useSmartFollowUps({
                    ticketMessageMetadata: {
                        smart_follow_ups: smartFollowUps,
                        selected_smart_follow_up_index: 0,
                    },
                }),
            {
                initialEntries: ['/?show_ticket_quick_replies=true'],
            },
        )

        expect(result.current.showAllSmartFollowUps).toBe(true)
    })

    it('returns the default value when the metadata shape is invalid', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() =>
            useSmartFollowUps({
                ticketMessageMetadata: {
                    smart_follow_ups: 'invalid',
                },
            }),
        )

        expect(result.current).toEqual({
            showAllSmartFollowUps: false,
            shouldRenderMessageContent: true,
            shouldRenderSmartFollowUps: false,
            smartFollowUps: [],
        })
    })

    it('keeps the message content visible when no smart follow-up was selected', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(
            () =>
                useSmartFollowUps({
                    ticketMessageMetadata: {
                        smart_follow_ups: smartFollowUps,
                    },
                }),
            {
                initialEntries: ['/?show_ticket_quick_replies=true'],
            },
        )

        expect(result.current).toEqual({
            showAllSmartFollowUps: true,
            shouldRenderMessageContent: true,
            shouldRenderSmartFollowUps: true,
            smartFollowUps,
        })
    })

    it('keeps the message content visible when the selected index is out of bounds', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() =>
            useSmartFollowUps({
                ticketMessageMetadata: {
                    smart_follow_ups: smartFollowUps,
                    selected_smart_follow_up_index: smartFollowUps.length,
                },
            }),
        )

        expect(result.current).toEqual({
            selectedSmartFollowUpIndex: smartFollowUps.length,
            showAllSmartFollowUps: false,
            shouldRenderMessageContent: true,
            shouldRenderSmartFollowUps: true,
            smartFollowUps,
        })
    })
})
