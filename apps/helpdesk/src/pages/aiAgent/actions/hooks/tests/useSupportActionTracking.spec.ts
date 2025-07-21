import { renderHook } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'

import { useSupportActionTracking } from '../useSupportActionTracking'

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('common/segment/segment', () => ({
    logEvent: jest.fn(),
}))

describe('useSupportActionTracking', () => {
    const defaultProps = {
        shopName: 'TestShop',
    }

    const expectedEventContext = {
        shopName: defaultProps.shopName,
    }

    it('should log AiAgentActionPageViewed event', () => {
        const { result } = renderHook(() =>
            useSupportActionTracking(defaultProps),
        )
        result.current.onActionPageViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentActionPageViewed,
            expectedEventContext,
        )
    })

    it('should log AiAgentActionCreated event', () => {
        const { result } = renderHook(() =>
            useSupportActionTracking(defaultProps),
        )

        const createdHow = 'from_template'
        result.current.onActionCreated({ createdHow })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentActionCreated,
            {
                ...expectedEventContext,
                createdHow,
            },
        )
    })

    it('should log AiAgentActionEdited event', () => {
        const { result } = renderHook(() =>
            useSupportActionTracking(defaultProps),
        )
        result.current.onActionEdited()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentActionEdited,
            expectedEventContext,
        )
    })

    it('should update eventContext when shopName changes', () => {
        const { result, rerender } = renderHook(
            (props) => useSupportActionTracking(props),
            { initialProps: defaultProps },
        )

        result.current.onActionPageViewed()
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentActionPageViewed,
            expectedEventContext,
        )

        const newShopName = 'NewTestShop'
        rerender({ shopName: newShopName })

        result.current.onActionPageViewed()
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentActionPageViewed,
            {
                shopName: newShopName,
            },
        )
    })
})
