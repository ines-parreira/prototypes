import { renderHook } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'

import { SenderTypeValues } from '../../components/PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import { usePlaygroundTracking } from '../usePlaygroundTracking'

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('common/segment/segment', () => ({
    logEvent: jest.fn(),
}))

describe('usePlaygroundTracking', () => {
    const defaultProps = {
        shopName: 'TestShop',
    }

    const expectedEventContext = {
        shopName: defaultProps.shopName,
    }

    it('should log AiAgentTestPageViewed event', () => {
        const { result } = renderHook(() => usePlaygroundTracking(defaultProps))

        result.current.onTestPageViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            expectedEventContext,
        )
    })

    it('should log AiAgentTestMessageSent event with correct parameters', () => {
        const { result } = renderHook(() => usePlaygroundTracking(defaultProps))
        const mockChannel = 'email'
        const mockPlaygroundSettings = SenderTypeValues.NEW_CUSTOMER

        result.current.onTestMessageSent({
            channel: mockChannel,
            playgroundSettings: mockPlaygroundSettings,
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestMessageSent,
            {
                ...expectedEventContext,
                channel: mockChannel,
                playgroundSettings: mockPlaygroundSettings,
            },
        )
    })

    it('should update event context when shopName changes', () => {
        const { result, rerender } = renderHook(
            (props) => usePlaygroundTracking(props),
            { initialProps: defaultProps },
        )

        result.current.onTestPageViewed()
        expect(mockLogEvent).toHaveBeenLastCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            expectedEventContext,
        )

        const newShopName = 'NewTestShop'
        rerender({ shopName: newShopName })

        result.current.onTestPageViewed()
        expect(mockLogEvent).toHaveBeenLastCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            { shopName: newShopName },
        )
    })
})
