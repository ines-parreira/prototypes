import { renderHook } from '@testing-library/react'

import { useLinkedIntentsSidebar } from './useLinkedIntentsSidebar'

type MockGuidanceStoreState = {
    state: {
        guidance:
            | {
                  id: number
                  locale: string
                  isCurrent: boolean
                  publishedVersionId: number | null
                  draftVersionId: number | null
                  intents?: string[] | null
              }
            | undefined
        historicalVersion: {
            publishedDatetime: string | null
        } | null
        isUpdating: boolean
        isAutoSaving: boolean
    }
}

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        useGuidanceStore: (selector: (state: unknown) => unknown) =>
            selector(mockGuidanceStoreState),
    }),
)

const createMockGuidanceStoreState = (): MockGuidanceStoreState => ({
    state: {
        guidance: {
            id: 123,
            locale: 'en',
            isCurrent: true,
            publishedVersionId: 789,
            draftVersionId: 789,
            intents: ['order::status'],
        },
        historicalVersion: null,
        isUpdating: false,
        isAutoSaving: false,
    },
})

let mockGuidanceStoreState = createMockGuidanceStoreState()

describe('useLinkedIntentsSidebar', () => {
    beforeEach(() => {
        mockGuidanceStoreState = createMockGuidanceStoreState()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('returns labels based on linked intent ids', () => {
        const { result } = renderHook(() => useLinkedIntentsSidebar())

        expect(result.current.getLinkedIntentLabelById('order::status')).toBe(
            'order/status',
        )
        expect(result.current.getLinkedIntentLabelById('unknown-intent')).toBe(
            'unknown-intent',
        )
    })

    it('enables linking when guidance is unpublished', () => {
        if (mockGuidanceStoreState.state.guidance) {
            mockGuidanceStoreState.state.guidance.publishedVersionId = null
        }

        const { result } = renderHook(() => useLinkedIntentsSidebar())

        expect(result.current.linkIntentsDisabledTooltip).toBeUndefined()
        expect(result.current.isLinkIntentsButtonDisabled).toBe(false)
        expect(result.current.canUnlinkIntentsFromSidebar).toBe(true)
    })

    it('shows published-with-draft tooltip when viewing published version that has a draft', () => {
        if (mockGuidanceStoreState.state.guidance) {
            mockGuidanceStoreState.state.guidance.isCurrent = true
            mockGuidanceStoreState.state.guidance.publishedVersionId = 789
            mockGuidanceStoreState.state.guidance.draftVersionId = 790
        }

        const { result } = renderHook(() => useLinkedIntentsSidebar())

        expect(result.current.linkIntentsDisabledTooltip).toBe(
            'A draft of this guidance exists. Switch to the draft to link intents.',
        )
        expect(result.current.isLinkIntentsButtonDisabled).toBe(true)
    })

    it('keeps unlink action disabled for historical versions', () => {
        mockGuidanceStoreState.state.historicalVersion = {
            publishedDatetime: '2026-01-01T00:00:00.000Z',
        }

        const { result } = renderHook(() => useLinkedIntentsSidebar())

        expect(result.current.isViewingHistoricalVersion).toBe(true)
        expect(result.current.canUnlinkIntentsFromSidebar).toBe(false)
    })

    it('uses fallback values when guidance is missing', () => {
        mockGuidanceStoreState.state.guidance = undefined

        const { result } = renderHook(() => useLinkedIntentsSidebar())

        expect(result.current.guidanceIntentIds).toEqual([])
        expect(result.current.isLinkIntentsButtonDisabled).toBe(false)
    })
})
