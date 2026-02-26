import { renderHook } from '@testing-library/react'

import { useLinkedIntentsSidebar } from './useLinkedIntentsSidebar'

type MockGuidanceStoreState = {
    config: {
        guidanceHelpCenter: {
            id: number
        }
    }
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

const mockIntentGroups = [
    {
        name: 'Order',
        children: [
            {
                name: 'Order/status',
                intent: 'order-status',
                is_available: true,
            },
            {
                name: 'Order/cancel',
                intent: 'order-cancel',
                is_available: true,
            },
        ],
    },
]

const mockUseGetArticleTranslationIntents = jest.fn(
    () =>
        ({
            data: { intents: mockIntentGroups },
        }) as {
            data: { intents: typeof mockIntentGroups } | undefined
        },
)

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationIntents: (...args: unknown[]) =>
        mockUseGetArticleTranslationIntents(...(args as [])),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        useGuidanceStore: (selector: (state: unknown) => unknown) =>
            selector(mockGuidanceStoreState),
    }),
)

const createMockGuidanceStoreState = (): MockGuidanceStoreState => ({
    config: { guidanceHelpCenter: { id: 456 } },
    state: {
        guidance: {
            id: 123,
            locale: 'en',
            isCurrent: true,
            publishedVersionId: 789,
            draftVersionId: 789,
            intents: ['order-status'],
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

        mockUseGetArticleTranslationIntents.mockReturnValue({
            data: { intents: mockIntentGroups },
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('returns labels based on available linked intents', () => {
        const { result } = renderHook(() => useLinkedIntentsSidebar())

        expect(result.current.getLinkedIntentLabelById('order-status')).toBe(
            'Order/status',
        )
        expect(result.current.getLinkedIntentLabelById('unknown-intent')).toBe(
            '',
        )
    })

    it('prepends the group name when the intent name is not namespaced', () => {
        mockUseGetArticleTranslationIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'Order',
                        children: [
                            {
                                name: 'cancel',
                                intent: 'order-cancel',
                                is_available: true,
                            },
                        ],
                    },
                ],
            },
        })

        const { result } = renderHook(() => useLinkedIntentsSidebar())

        expect(result.current.getLinkedIntentLabelById('order-cancel')).toBe(
            'Order/cancel',
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

    it('passes disabled query options when intent path params are not ready', () => {
        mockGuidanceStoreState.config.guidanceHelpCenter.id = 0

        renderHook(() => useLinkedIntentsSidebar())

        expect(mockUseGetArticleTranslationIntents).toHaveBeenCalledWith(
            {
                article_id: 123,
                help_center_id: 0,
                locale: 'en',
            },
            {
                enabled: false,
            },
        )
    })

    it('uses fallback values when guidance is missing', () => {
        mockGuidanceStoreState.state.guidance = undefined

        const { result } = renderHook(() => useLinkedIntentsSidebar())

        expect(result.current.guidanceIntentIds).toEqual([])
        expect(result.current.isLinkIntentsButtonDisabled).toBe(false)
        expect(mockUseGetArticleTranslationIntents).toHaveBeenCalledWith(
            {
                article_id: 0,
                help_center_id: 456,
                locale: '',
            },
            {
                enabled: false,
            },
        )
    })
})
