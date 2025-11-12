import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'

import { useKnowledgeTracking } from '../useKnowledgeTracking'

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

describe('useKnowledgeTracking', () => {
    const defaultProps = {
        shopName: 'test-shop',
    }

    const expectedEventContext = {
        shopName: defaultProps.shopName,
    }

    it('should log AiAgentKnowledgeSourcesViewed', () => {
        const { result } = renderHook(() => useKnowledgeTracking(defaultProps))

        result.current.onKnowledgeSourcesViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentKnowledgeSourcesViewed,
            expectedEventContext,
        )
    })

    it('should log AiAgentKnowledgeSourcesFiltered', () => {
        const { result } = renderHook(() => useKnowledgeTracking(defaultProps))
        const filterType = 'document'

        result.current.onKnowledgeSourcesFiltered({ type: filterType })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentKnowledgeSourcesFiltered,
            { ...expectedEventContext, type: filterType },
        )
    })

    it('should log AiAgentKnowledgeContentCreated', () => {
        const { result } = renderHook(() => useKnowledgeTracking(defaultProps))
        const payload = {
            type: 'store-website-sync',
            createdFrom: 'source-page',
            createdHow: 'sync',
        }

        result.current.onKnowledgeContentCreated(payload)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentKnowledgeContentCreated,
            { ...expectedEventContext, ...payload },
        )
    })

    it('should log AiAgentKnowledgeContentEdited', () => {
        const { result } = renderHook(() => useKnowledgeTracking(defaultProps))
        const payload = { type: 'guidance', editedFrom: 'guidance-editor' }

        result.current.onKnowledgeContentEdited(payload)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentKnowledgeContentEdited,
            { ...expectedEventContext, ...payload },
        )
    })

    it('should update event context when shopName changes', () => {
        const { result, rerender } = renderHook(
            (props) => useKnowledgeTracking(props),
            { initialProps: defaultProps },
        )

        result.current.onKnowledgeSourcesViewed()
        expect(mockLogEvent).toHaveBeenLastCalledWith(
            SegmentEvent.AiAgentKnowledgeSourcesViewed,
            expectedEventContext,
        )

        const newShopName = 'NewTestShop'
        rerender({ shopName: newShopName })

        result.current.onKnowledgeSourcesViewed()
        expect(mockLogEvent).toHaveBeenLastCalledWith(
            SegmentEvent.AiAgentKnowledgeSourcesViewed,
            { shopName: newShopName },
        )
    })
})
