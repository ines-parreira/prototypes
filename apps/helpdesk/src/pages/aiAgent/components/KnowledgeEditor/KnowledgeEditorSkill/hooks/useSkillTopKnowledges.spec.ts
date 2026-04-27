import { renderHook } from '@repo/testing'

import {
    getLast28DaysDateRange,
    useSkillSupportingKnowledgesMetric,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useGetKnowledgeHubArticles } from 'models/helpCenter/queries'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { transformKnowledgeHubArticlesToKnowledgeItems } from 'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles'

import { useSkillEditorStore } from '../context'
import { useSkillTopKnowledges } from './useSkillTopKnowledges'

jest.mock('../context', () => ({ useSkillEditorStore: jest.fn() }))

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        getLast28DaysDateRange: jest.fn(),
        useSkillSupportingKnowledgesMetric: jest.fn(),
    }),
)

jest.mock('models/helpCenter/queries', () => ({
    useGetKnowledgeHubArticles: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles',
    () => ({ transformKnowledgeHubArticlesToKnowledgeItems: jest.fn() }),
)

jest.mock('pages/aiAgent/hooks/useStoreConfiguration', () => ({
    useStoreConfiguration: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn((selector) => {
        if (selector.toString().includes('currentAccount')) return 1
        return 'UTC'
    }),
}))

const mockUseSkillEditorStore = useSkillEditorStore as jest.Mock
const mockUseSkillTopKnowledgesMetric =
    useSkillSupportingKnowledgesMetric as jest.Mock
const mockUseGetKnowledgeHubArticles = useGetKnowledgeHubArticles as jest.Mock
const mockTransformKnowledgeHubArticlesToKnowledgeItems =
    transformKnowledgeHubArticlesToKnowledgeItems as jest.Mock
const mockUseStoreConfiguration = useStoreConfiguration as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock

const mockDateRange = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-28T23:59:59Z',
}

const makeArticle = (id: string, title: string) => ({
    id,
    type: 'faq' as const,
    title,
    lastUpdatedAt: '2024-01-01T00:00:00Z',
})

const makeStoreState = (overrides: Record<string, unknown> = {}) => ({
    state: {
        skill: { id: 42 },
        isUpdating: false,
        isAutoSaving: false,
        useSupportingContent: true,
        historicalVersion: null,
    },
    config: {
        shopName: 'test-shop',
        helpCenter: { id: 100, shop_integration_id: 999 },
    },
    ...overrides,
})

const defaultArticles = [
    makeArticle('10', 'FAQ about orders'),
    makeArticle('20', 'Return policy'),
    makeArticle('30', 'Shipping info'),
    makeArticle('40', 'Contact us'),
]

const makeCoUsedResource = (
    resourceSourceId: string,
    resourceSourceSetId: string,
    ticketCount: number,
    ticketId = '',
) => ({ resourceSourceId, resourceSourceSetId, ticketCount, ticketId })

const defaultCoUsedResources = [
    makeCoUsedResource('10', '11', 8, 'T1'),
    makeCoUsedResource('20', '11', 5, 'T2'),
    makeCoUsedResource('30', '22', 3, 'T3'),
]

const makeMetricResult = (
    coUsedResources = defaultCoUsedResources,
    isLoading = false,
) => ({ coUsedResources, isLoading, dateRange: mockDateRange })

describe('useSkillTopKnowledges', () => {
    beforeEach(() => {
        mockGetLast28DaysDateRange.mockReturnValue(mockDateRange)

        mockUseSkillEditorStore.mockImplementation((selector) =>
            selector(makeStoreState()),
        )

        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 11,
                snippetHelpCenterId: 22,
                helpCenterId: 33,
            },
        })

        mockUseGetKnowledgeHubArticles.mockReturnValue({
            data: { articles: defaultArticles },
            isInitialLoading: false,
        })

        mockTransformKnowledgeHubArticlesToKnowledgeItems.mockImplementation(
            (articles) =>
                articles.map((a: ReturnType<typeof makeArticle>) => ({
                    ...a,
                    type: 'faq',
                })),
        )

        mockUseSkillTopKnowledgesMetric.mockReturnValue(
            makeMetricResult(defaultCoUsedResources),
        )
    })

    afterEach(() => jest.clearAllMocks())

    describe('top supporting knowledges', () => {
        it('returns top 3 knowledges sorted by ticket count descending', () => {
            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.topSupportingKnowledges).toHaveLength(3)
            expect(result.current.topSupportingKnowledges[0].id).toBe('10')
            expect(result.current.topSupportingKnowledges[0].tickets).toBe(8)
            expect(result.current.topSupportingKnowledges[1].id).toBe('20')
            expect(result.current.topSupportingKnowledges[1].tickets).toBe(5)
            expect(result.current.topSupportingKnowledges[2].id).toBe('30')
            expect(result.current.topSupportingKnowledges[2].tickets).toBe(3)
        })

        it('limits results to 3 even if more co-used resources match', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult([
                    makeCoUsedResource('10', '11', 10),
                    makeCoUsedResource('20', '11', 8),
                    makeCoUsedResource('30', '11', 6),
                    makeCoUsedResource('40', '11', 4),
                ]),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.topSupportingKnowledges).toHaveLength(3)
        })

        it('excludes articles with zero ticket count', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult([
                    makeCoUsedResource('10', '11', 5),
                    makeCoUsedResource('20', '11', 0),
                ]),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.topSupportingKnowledges).toHaveLength(1)
            expect(result.current.topSupportingKnowledges[0].id).toBe('10')
        })

        it('excludes resources not in the supporting knowledge articles list', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult([
                    makeCoUsedResource('999', '11', 100),
                    makeCoUsedResource('10', '11', 5),
                ]),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.topSupportingKnowledges).toHaveLength(1)
            expect(result.current.topSupportingKnowledges[0].id).toBe('10')
        })

        it('sums ticket counts when the same resourceSourceId appears multiple times', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult([
                    makeCoUsedResource('10', '11', 5),
                    makeCoUsedResource('10', '22', 3),
                ]),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.topSupportingKnowledges).toHaveLength(1)
            expect(result.current.topSupportingKnowledges[0].id).toBe('10')
            expect(result.current.topSupportingKnowledges[0].tickets).toBe(8)
        })

        it('returns empty array when coUsedResources is empty', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult([]),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.topSupportingKnowledges).toHaveLength(0)
        })

        it('returns empty array when articles list is empty', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: { articles: [] },
                isInitialLoading: false,
            })
            mockTransformKnowledgeHubArticlesToKnowledgeItems.mockReturnValue(
                [],
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.topSupportingKnowledges).toHaveLength(0)
        })
    })

    describe('coUsedTicketIds', () => {
        it('populates coUsedTicketIds for each knowledge from co-used resources', () => {
            const { result } = renderHook(() => useSkillTopKnowledges())

            const article10 = result.current.topSupportingKnowledges.find(
                (k) => k.id === '10',
            )
            expect(article10?.coUsedTicketIds).toEqual(['T1'])
        })

        it('deduplicates ticket IDs for the same article', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult([
                    makeCoUsedResource('10', '11', 3, 'T1'),
                    makeCoUsedResource('10', '11', 2, 'T1'),
                    makeCoUsedResource('10', '11', 1, 'T2'),
                ]),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            const article10 = result.current.topSupportingKnowledges.find(
                (k) => k.id === '10',
            )
            expect(article10?.coUsedTicketIds).toHaveLength(2)
            expect(article10?.coUsedTicketIds).toContain('T1')
            expect(article10?.coUsedTicketIds).toContain('T2')
        })

        it('returns empty coUsedTicketIds for articles with no ticket ID', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult([makeCoUsedResource('10', '11', 5, '')]),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            const article10 = result.current.topSupportingKnowledges.find(
                (k) => k.id === '10',
            )
            expect(article10?.coUsedTicketIds).toEqual([])
        })
    })

    describe('isLoading', () => {
        it('returns true when articles are loading', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: undefined,
                isInitialLoading: true,
            })

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.isLoading).toBe(true)
        })

        it('returns true when metric is loading', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult(defaultCoUsedResources, true),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.isLoading).toBe(true)
        })

        it('returns false when not loading', () => {
            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('fetch gating', () => {
        it('passes enabled=false to metric when skillId is undefined', () => {
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    ...makeStoreState(),
                    state: { ...makeStoreState().state, skill: undefined },
                }),
            )

            renderHook(() => useSkillTopKnowledges())

            expect(mockUseSkillTopKnowledgesMetric).toHaveBeenCalledWith(
                expect.objectContaining({ enabled: false }),
            )
        })

        it('passes enabled=false to metric when useSupportingContent is false', () => {
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    ...makeStoreState(),
                    state: {
                        ...makeStoreState().state,
                        useSupportingContent: false,
                    },
                }),
            )

            renderHook(() => useSkillTopKnowledges())

            expect(mockUseSkillTopKnowledgesMetric).toHaveBeenCalledWith(
                expect.objectContaining({ enabled: false }),
            )
        })

        it('passes enabled=false to metric while isUpdating', () => {
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    ...makeStoreState(),
                    state: { ...makeStoreState().state, isUpdating: true },
                }),
            )

            renderHook(() => useSkillTopKnowledges())

            expect(mockUseSkillTopKnowledgesMetric).toHaveBeenCalledWith(
                expect.objectContaining({ enabled: false }),
            )
        })

        it('passes enabled=false to metric while store configuration is loading', () => {
            mockUseStoreConfiguration.mockReturnValue({
                isLoading: true,
                storeConfiguration: undefined,
            })

            renderHook(() => useSkillTopKnowledges())

            expect(mockUseSkillTopKnowledgesMetric).toHaveBeenCalledWith(
                expect.objectContaining({ enabled: false }),
            )
        })

        it('disables articles fetch when metric has no co-used resources', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult([]),
            )

            renderHook(() => useSkillTopKnowledges())

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
        })

        it('disables articles fetch while metric is loading', () => {
            mockUseSkillTopKnowledgesMetric.mockReturnValue(
                makeMetricResult(undefined, true),
            )

            renderHook(() => useSkillTopKnowledges())

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
        })
    })

    describe('metric params', () => {
        it('passes skillId, helpCenterId, shopIntegrationId, and dateRange to metric', () => {
            renderHook(() => useSkillTopKnowledges())

            expect(mockUseSkillTopKnowledgesMetric).toHaveBeenCalledWith(
                expect.objectContaining({
                    skillId: 42,
                    helpCenterId: 100,
                    shopIntegrationId: 999,
                    dateRange: mockDateRange,
                }),
            )
        })
    })

    describe('historical version date range', () => {
        const historicalDateRange = {
            start_datetime: '2024-02-13T00:00:00Z',
            end_datetime: '2024-03-10T23:59:59Z',
        }

        it('uses last 28 days when not viewing a historical version', () => {
            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.historicalVersionDateRange).toBeUndefined()
            expect(mockUseSkillTopKnowledgesMetric).toHaveBeenCalledWith(
                expect.objectContaining({ dateRange: mockDateRange }),
            )
        })

        it('uses historical version date range when viewing a historical version', () => {
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    ...makeStoreState(),
                    state: {
                        ...makeStoreState().state,
                        historicalVersion: {
                            impactDateRange: historicalDateRange,
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useSkillTopKnowledges())

            expect(result.current.historicalVersionDateRange).toEqual(
                historicalDateRange,
            )
            expect(mockUseSkillTopKnowledgesMetric).toHaveBeenCalledWith(
                expect.objectContaining({ dateRange: historicalDateRange }),
            )
        })
    })
})
