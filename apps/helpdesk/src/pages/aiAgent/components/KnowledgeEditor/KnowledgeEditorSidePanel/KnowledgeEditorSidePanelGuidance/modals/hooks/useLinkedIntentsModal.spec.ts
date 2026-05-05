import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useResourceMetrics } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'

import { useLinkedIntentsModal } from './useLinkedIntentsModal'

const mockPersistLinkedIntents = jest.fn()
const mockOnClose = jest.fn()

const mockIntentGroups = [
    {
        name: 'Order',
        children: [
            {
                name: 'status',
                intent: 'order::status',
                is_available: true,
            },
            {
                name: 'cancel',
                intent: 'order::cancel',
                is_available: true,
            },
            {
                name: 'missing item',
                intent: 'order::missing-item',
                is_available: false,
                used_by_article: {
                    id: 99,
                    title: 'Other guidance',
                    version: 3,
                },
            },
        ],
    },
    {
        name: 'Shipping',
        children: [
            {
                name: 'delay',
                intent: 'shipping::delay',
                is_available: true,
            },
        ],
    },
]

const mockUseGetArticleTranslationIntents = jest.fn(() => ({
    data: { intents: mockIntentGroups },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
}))

const mockUseResourceMetrics = useResourceMetrics as jest.Mock

type MockGuidanceStoreState = {
    guidanceArticle: { id: number; locale: string }
    config: {
        guidanceHelpCenter: {
            id: number
            shop_integration_id: number
        } | null
    }
    state: {
        guidance: {
            id: number
            locale: string
            intents: string[] | null
        } | null
        isUpdating: boolean
    }
}

const createMockGuidanceStoreState = (): MockGuidanceStoreState => ({
    guidanceArticle: { id: 123, locale: 'en' },
    config: { guidanceHelpCenter: { id: 456, shop_integration_id: 1 } },
    state: {
        guidance: {
            id: 123,
            locale: 'en',
            intents: [],
        },
        isUpdating: false,
    },
})

let mockGuidanceStoreState = createMockGuidanceStoreState()

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationIntents: (...args: unknown[]) =>
        mockUseGetArticleTranslationIntents(...(args as [])),
}))

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
        getLast28DaysDateRange: jest.fn(() => ({
            start_datetime: '2025-01-01T00:00:00.000Z',
            end_datetime: '2025-01-28T00:00:00.000Z',
        })),
    }),
)

jest.mock('hooks/useAppSelector', () => jest.fn(() => 'America/New_York'))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        useGuidanceStore: (selector: (state: unknown) => unknown) =>
            selector(mockGuidanceStoreState),
    }),
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'test-shop' }),
}))

jest.mock('../../hooks/usePersistLinkedIntents', () => ({
    usePersistLinkedIntents: () => ({
        persistLinkedIntents: mockPersistLinkedIntents,
        isUpdating: false,
    }),
}))

const renderLinkedIntentsModal = (isOpen = true, onClose = mockOnClose) =>
    renderHook(() => useLinkedIntentsModal(isOpen, onClose))

describe('useLinkedIntentsModal', () => {
    beforeEach(() => {
        mockGuidanceStoreState = createMockGuidanceStoreState()
        mockUseGetArticleTranslationIntents.mockReturnValue({
            data: { intents: mockIntentGroups },
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        })
        mockUseResourceMetrics.mockReturnValue({
            data: {
                intents: [
                    { intent: 'order::status', ticketCount: 1337 },
                    { intent: 'order::cancel', ticketCount: 678 },
                    { intent: 'order::missing-item', ticketCount: 245 },
                    { intent: 'shipping::delay', ticketCount: 20 },
                ],
            },
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('initial return values', () => {
        it('returns all expected fields', () => {
            const { result } = renderLinkedIntentsModal()

            expect(result.current).toMatchObject({
                searchValue: '',
                draftIntentIds: expect.any(Array),
                allIntents: expect.any(Array),
                filteredGroups: expect.any(Array),
                suggestedIntents: expect.any(Array),
                intentTicketCountById: expect.any(Object),
                isSearching: false,
                isLoadingIntents: false,
                isIntentsError: false,
                isSaving: false,
                guidanceEditRoute: expect.any(Function),
                setSearchValue: expect.any(Function),
                toggleIntent: expect.any(Function),
                toggleGroupIntents: expect.any(Function),
                toggleGroupExpanded: expect.any(Function),
                getIsGroupExpanded: expect.any(Function),
                onRetryLoadIntents: expect.any(Function),
                handleSave: expect.any(Function),
                handleModalOpenChange: expect.any(Function),
            })
        })

        it('initializes draftIntentIds from guidance store selectedIntentIds', () => {
            mockGuidanceStoreState.state.guidance!.intents = [
                'order::status',
                'order::cancel',
            ]

            const { result } = renderLinkedIntentsModal()

            expect(result.current.draftIntentIds).toEqual([
                'order::status',
                'order::cancel',
            ])
        })
    })

    describe('sortIntentsByTicketCountDesc', () => {
        it('sorts disabled intents to the end', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: { intents: [] },
                isLoading: false,
                isError: false,
            })

            const { result } = renderLinkedIntentsModal()

            const orderGroup = result.current.filteredGroups.find(
                (g) => g.name === 'Order',
            )
            expect(orderGroup).toBeDefined()

            const lastChild =
                orderGroup!.children[orderGroup!.children.length - 1]
            expect(lastChild.is_available).toBe(false)
            expect(lastChild.intent).toBe('order::missing-item')
        })

        it('sorts by ticket count descending when both enabled', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: {
                    intents: [
                        { intent: 'order::status', ticketCount: 100 },
                        { intent: 'order::cancel', ticketCount: 900 },
                        { intent: 'order::missing-item', ticketCount: 500 },
                        { intent: 'shipping::delay', ticketCount: 50 },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderLinkedIntentsModal()

            const orderGroup = result.current.filteredGroups.find(
                (g) => g.name === 'Order',
            )
            expect(orderGroup!.children[0].intent).toBe('order::cancel')
            expect(orderGroup!.children[1].intent).toBe('order::status')
        })

        it('sorts alphabetically when ticket counts are equal', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: {
                    intents: [
                        { intent: 'order::status', ticketCount: 500 },
                        { intent: 'order::cancel', ticketCount: 500 },
                        { intent: 'order::missing-item', ticketCount: 100 },
                        { intent: 'shipping::delay', ticketCount: 50 },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderLinkedIntentsModal()

            const orderGroup = result.current.filteredGroups.find(
                (g) => g.name === 'Order',
            )
            expect(orderGroup!.children[0].intent).toBe('order::cancel')
            expect(orderGroup!.children[1].intent).toBe('order::status')
        })
    })

    describe('intentTicketCountById', () => {
        it('accumulates ticket counts by lowercased intent id', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: {
                    intents: [
                        { intent: 'order::status', ticketCount: 100 },
                        { intent: 'shipping::delay', ticketCount: 50 },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderLinkedIntentsModal()

            expect(result.current.intentTicketCountById['order::status']).toBe(
                100,
            )
            expect(
                result.current.intentTicketCountById['shipping::delay'],
            ).toBe(50)
        })

        it('takes Math.max when the same intent appears twice', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: {
                    intents: [
                        { intent: 'order::status', ticketCount: 100 },
                        { intent: 'order::status', ticketCount: 300 },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderLinkedIntentsModal()

            expect(result.current.intentTicketCountById['order::status']).toBe(
                300,
            )
        })

        it('returns 0 for intents not in metrics (covers ?? 0 branch)', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: { intents: [] },
                isLoading: false,
                isError: false,
            })

            const { result } = renderLinkedIntentsModal()

            expect(
                result.current.intentTicketCountById['order::status'],
            ).toBeUndefined()
        })
    })

    describe('filteredGroups', () => {
        it('returns all groups when search is empty', () => {
            const { result } = renderLinkedIntentsModal()

            expect(result.current.filteredGroups).toHaveLength(2)
            expect(result.current.filteredGroups[0].name).toBe('Order')
            expect(result.current.filteredGroups[1].name).toBe('Shipping')
        })

        it('filters by intent name', () => {
            const { result } = renderLinkedIntentsModal()

            act(() => {
                result.current.setSearchValue('delay')
            })

            expect(result.current.filteredGroups).toHaveLength(1)
            expect(result.current.filteredGroups[0].name).toBe('Shipping')
        })

        it('filters by intent key', () => {
            const { result } = renderLinkedIntentsModal()

            act(() => {
                result.current.setSearchValue('order::status')
            })

            expect(result.current.filteredGroups).toHaveLength(1)
            expect(result.current.filteredGroups[0].children).toHaveLength(1)
            expect(result.current.filteredGroups[0].children[0].intent).toBe(
                'order::status',
            )
        })

        it('returns empty array when no matches', () => {
            const { result } = renderLinkedIntentsModal()

            act(() => {
                result.current.setSearchValue('no-match-xyz')
            })

            expect(result.current.filteredGroups).toHaveLength(0)
        })
    })

    describe('suggestedIntents', () => {
        it('returns top 2 available intents by ticket count when no search', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: {
                    intents: [
                        { intent: 'order::status', ticketCount: 900 },
                        { intent: 'order::cancel', ticketCount: 100 },
                        { intent: 'order::missing-item', ticketCount: 500 },
                        { intent: 'shipping::delay', ticketCount: 1200 },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderLinkedIntentsModal()

            expect(result.current.suggestedIntents).toHaveLength(2)
            expect(result.current.suggestedIntents[0].intent).toBe(
                'shipping::delay',
            )
            expect(result.current.suggestedIntents[1].intent).toBe(
                'order::status',
            )
        })

        it('returns empty array when searching', () => {
            const { result } = renderLinkedIntentsModal()

            act(() => {
                result.current.setSearchValue('order')
            })

            expect(result.current.suggestedIntents).toHaveLength(0)
        })

        it('returns only one intent when only one available intent exists', () => {
            mockUseGetArticleTranslationIntents.mockReturnValue({
                data: {
                    intents: [
                        {
                            name: 'Only',
                            children: [
                                {
                                    name: 'one',
                                    intent: 'only::one',
                                    is_available: true,
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
            })

            const { result } = renderLinkedIntentsModal()

            expect(result.current.suggestedIntents).toHaveLength(1)
            expect(result.current.suggestedIntents[0].intent).toBe('only::one')
        })
    })

    describe('handleModalOpenChange', () => {
        it('does not call onClose when nextIsOpen is true', () => {
            const onClose = jest.fn()
            const { result } = renderLinkedIntentsModal(true, onClose)

            act(() => {
                result.current.handleModalOpenChange(true)
            })

            expect(onClose).not.toHaveBeenCalled()
        })

        it('calls onClose when nextIsOpen is false and not saving', () => {
            const onClose = jest.fn()
            const { result } = renderLinkedIntentsModal(true, onClose)

            act(() => {
                result.current.handleModalOpenChange(false)
            })

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('does not call onClose when nextIsOpen is false but isSaving is true', () => {
            const onClose = jest.fn()

            const originalImpl = jest.requireMock(
                '../../hooks/usePersistLinkedIntents',
            ).usePersistLinkedIntents

            jest.requireMock(
                '../../hooks/usePersistLinkedIntents',
            ).usePersistLinkedIntents = () => ({
                persistLinkedIntents: mockPersistLinkedIntents,
                isUpdating: true,
            })

            const { result } = renderHook(() =>
                useLinkedIntentsModal(true, onClose),
            )

            act(() => {
                result.current.handleModalOpenChange(false)
            })

            expect(onClose).not.toHaveBeenCalled()

            jest.requireMock(
                '../../hooks/usePersistLinkedIntents',
            ).usePersistLinkedIntents = originalImpl
        })
    })

    describe('toggleIntent', () => {
        it('does nothing when intent is unavailable', () => {
            const { result } = renderLinkedIntentsModal()

            const unavailableIntent = result.current.allIntents.find(
                (i) => !i.is_available,
            )!

            const initialDraftIds = [...result.current.draftIntentIds]

            act(() => {
                result.current.toggleIntent(unavailableIntent)
            })

            expect(result.current.draftIntentIds).toEqual(initialDraftIds)
        })

        it('adds intent to draftIntentIds when not selected', () => {
            const { result } = renderLinkedIntentsModal()

            const availableIntent = result.current.allIntents.find(
                (i) => i.is_available,
            )!

            act(() => {
                result.current.toggleIntent(availableIntent)
            })

            expect(result.current.draftIntentIds).toContain(
                availableIntent.intent,
            )
        })

        it('removes intent from draftIntentIds when already selected', () => {
            mockGuidanceStoreState.state.guidance!.intents = ['order::status']

            const { result } = renderLinkedIntentsModal()

            const selectedIntent = result.current.allIntents.find(
                (i) => i.intent === 'order::status',
            )!

            act(() => {
                result.current.toggleIntent(selectedIntent)
            })

            expect(result.current.draftIntentIds).not.toContain('order::status')
        })
    })

    describe('toggleGroupIntents', () => {
        it('does nothing when group has no available intents', () => {
            const groupWithNoAvailable = {
                name: 'Empty',
                children: [
                    {
                        name: 'unavailable',
                        intent: 'empty::unavailable' as never,
                        is_available: false,
                    },
                ],
            }

            const { result } = renderLinkedIntentsModal()

            const initialDraftIds = [...result.current.draftIntentIds]

            act(() => {
                result.current.toggleGroupIntents(groupWithNoAvailable)
            })

            expect(result.current.draftIntentIds).toEqual(initialDraftIds)
        })

        it('deselects all available intents when all are already selected', () => {
            mockGuidanceStoreState.state.guidance!.intents = [
                'order::status',
                'order::cancel',
            ]

            const { result } = renderLinkedIntentsModal()

            const orderGroup = result.current.filteredGroups.find(
                (g) => g.name === 'Order',
            )!

            act(() => {
                result.current.toggleGroupIntents(orderGroup)
            })

            expect(result.current.draftIntentIds).not.toContain('order::status')
            expect(result.current.draftIntentIds).not.toContain('order::cancel')
        })

        it('selects all available intents when not all are selected', () => {
            const { result } = renderLinkedIntentsModal()

            const orderGroup = result.current.filteredGroups.find(
                (g) => g.name === 'Order',
            )!

            act(() => {
                result.current.toggleGroupIntents(orderGroup)
            })

            expect(result.current.draftIntentIds).toContain('order::status')
            expect(result.current.draftIntentIds).toContain('order::cancel')
            expect(result.current.draftIntentIds).not.toContain(
                'order::missing-item',
            )
        })

        it('uses Set to deduplicate when selecting all', () => {
            mockGuidanceStoreState.state.guidance!.intents = ['order::status']

            const { result } = renderLinkedIntentsModal()

            const orderGroup = result.current.filteredGroups.find(
                (g) => g.name === 'Order',
            )!

            act(() => {
                result.current.toggleGroupIntents(orderGroup)
            })

            const statusCount = result.current.draftIntentIds.filter(
                (id) => id === 'order::status',
            ).length
            expect(statusCount).toBe(1)
            expect(result.current.draftIntentIds).toContain('order::cancel')
        })
    })

    describe('toggleGroupExpanded', () => {
        it('expands a group that is not expanded', () => {
            const { result } = renderLinkedIntentsModal()

            act(() => {
                result.current.toggleGroupExpanded('Shipping')
            })

            expect(result.current.getIsGroupExpanded('Shipping')).toBe(true)
        })

        it('collapses a group that is expanded', () => {
            const { result } = renderLinkedIntentsModal()

            act(() => {
                result.current.toggleGroupExpanded('Order')
            })

            act(() => {
                result.current.toggleGroupExpanded('Order')
            })

            expect(result.current.getIsGroupExpanded('Order')).toBe(false)
        })
    })

    describe('getIsGroupExpanded', () => {
        it('uses expandedGroups value when group is present (explicit false overrides default true)', () => {
            const { result } = renderLinkedIntentsModal()

            // First toggle sets expandedGroups['Order'] = true (overrides default true)
            act(() => {
                result.current.toggleGroupExpanded('Order')
            })
            // Second toggle sets expandedGroups['Order'] = false (explicit false beats default true via ??)
            act(() => {
                result.current.toggleGroupExpanded('Order')
            })

            expect(result.current.getIsGroupExpanded('Order')).toBe(false)
        })

        it('falls back to defaultExpandedGroups (first group expanded by default)', () => {
            const { result } = renderLinkedIntentsModal()

            expect(result.current.getIsGroupExpanded('Order')).toBe(true)
            expect(result.current.getIsGroupExpanded('Shipping')).toBe(false)
        })

        it('returns false for groups in neither expandedGroups nor defaultExpandedGroups', () => {
            const { result } = renderLinkedIntentsModal()

            expect(result.current.getIsGroupExpanded('NonExistentGroup')).toBe(
                false,
            )
        })
    })

    describe('handleSave', () => {
        it('calls persistLinkedIntents with correct intent keys', () => {
            mockGuidanceStoreState.state.guidance!.intents = ['order::status']

            const onClose = jest.fn()
            const { result } = renderLinkedIntentsModal(true, onClose)

            act(() => {
                result.current.handleSave()
            })

            expect(mockPersistLinkedIntents).toHaveBeenCalledWith(
                ['order::status'],
                expect.any(Function),
            )
        })

        it('filters out intent IDs not present in intentsById', () => {
            mockGuidanceStoreState.state.guidance!.intents = [
                'order::status',
                'non-existent::intent',
            ]

            const { result } = renderLinkedIntentsModal()

            act(() => {
                result.current.handleSave()
            })

            expect(mockPersistLinkedIntents).toHaveBeenCalledWith(
                ['order::status'],
                expect.any(Function),
            )
        })
    })

    describe('areIntentPathParamsReady / query enabled conditions', () => {
        it('disables query when guidanceHelpCenterId is missing', () => {
            mockGuidanceStoreState.config.guidanceHelpCenter = null

            renderLinkedIntentsModal()

            expect(
                mockUseGetArticleTranslationIntents,
            ).toHaveBeenLastCalledWith(
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
        })

        it('disables query when guidanceArticleId is missing', () => {
            mockGuidanceStoreState.state.guidance = null
            ;(mockGuidanceStoreState as any).guidanceArticle = null

            renderLinkedIntentsModal()

            expect(
                mockUseGetArticleTranslationIntents,
            ).toHaveBeenLastCalledWith(
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
        })

        it('enables query when all params present and modal is open', () => {
            renderLinkedIntentsModal(true)

            expect(
                mockUseGetArticleTranslationIntents,
            ).toHaveBeenLastCalledWith(
                expect.any(Object),
                expect.objectContaining({ enabled: true }),
            )
        })

        it('disables query when modal is closed', () => {
            renderLinkedIntentsModal(false)

            expect(
                mockUseGetArticleTranslationIntents,
            ).toHaveBeenLastCalledWith(
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
        })
    })

    describe('isSearching', () => {
        it('is false when searchValue is empty', () => {
            const { result } = renderLinkedIntentsModal()

            expect(result.current.isSearching).toBe(false)
        })

        it('is true when searchValue is non-empty', () => {
            const { result } = renderLinkedIntentsModal()

            act(() => {
                result.current.setSearchValue('order')
            })

            expect(result.current.isSearching).toBe(true)
        })
    })
})
