import { renderHook } from '@repo/testing'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useSkillsMetrics } from 'pages/aiAgent/skills/hooks/useSkillsMetrics'
import { useSkillsMetricsByDay } from 'pages/aiAgent/skills/hooks/useSkillsMetricsByDay'
import { useTotalAiAgentTickets } from 'pages/aiAgent/skills/hooks/useTotalAiAgentTickets'

import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useSkillEditorStore } from '../context'
import { useSkillPerformanceFromContext } from './useSkillPerformanceFromContext'

jest.mock('../context', () => ({ useSkillEditorStore: jest.fn() }))
jest.mock('pages/aiAgent/skills/hooks/useSkillsMetrics', () => ({
    useSkillsMetrics: jest.fn(),
}))
jest.mock('pages/aiAgent/skills/hooks/useSkillsMetricsByDay', () => ({
    useSkillsMetricsByDay: jest.fn(),
}))
jest.mock('pages/aiAgent/skills/hooks/useTotalAiAgentTickets', () => ({
    useTotalAiAgentTickets: jest.fn(),
}))
jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        getLast28DaysDateRange: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(),
    }),
)
jest.mock('../../shared/hooks/useKnowledgeRecentTickets', () => ({
    useKnowledgeRecentTickets: jest.fn(),
}))

const mockUseSkillEditorStore = useSkillEditorStore as jest.Mock
const mockUseSkillsMetrics = useSkillsMetrics as jest.Mock
const mockUseSkillsMetricsByDay = useSkillsMetricsByDay as jest.Mock
const mockUseTotalAiAgentTickets = useTotalAiAgentTickets as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock
const mockUseGetCustomTicketsFieldsDefinitionData =
    useGetCustomTicketsFieldsDefinitionData as jest.Mock
const mockUseKnowledgeRecentTickets = useKnowledgeRecentTickets as jest.Mock

const mockDateRange = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-28T23:59:59Z',
}

const mockMetricsData = [
    {
        resourceSourceId: 42,
        tickets: 10,
        handoverTickets: 3,
        csat: 4.5,
        resourceSourceSetId: 100,
    },
    {
        resourceSourceId: 99,
        tickets: 20,
        handoverTickets: 5,
        csat: 3.8,
        resourceSourceSetId: 200,
    },
]

const mockRecentTicketsData = {
    ticketCount: 5,
    latest3Tickets: [],
    isLoading: false,
}

describe('useSkillPerformanceFromContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetLast28DaysDateRange.mockReturnValue(mockDateRange)

        mockUseSkillEditorStore.mockImplementation((selector) =>
            selector({
                state: {
                    skill: { id: 42 },
                    historicalVersion: null,
                },
                config: {
                    helpCenter: {
                        id: 10,
                        shop_integration_id: 999,
                    },
                },
            }),
        )

        mockUseSkillsMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
        })

        mockUseSkillsMetricsByDay.mockReturnValue({
            data: [],
            isLoading: false,
        })

        mockUseTotalAiAgentTickets.mockReturnValue({
            totalCount: 200,
            isLoading: false,
        })

        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            outcomeCustomFieldId: 111,
            intentCustomFieldId: 222,
        })

        mockUseKnowledgeRecentTickets.mockReturnValue(mockRecentTicketsData)
    })

    describe('skillMetrics', () => {
        it('returns null metrics when skillArticleId is undefined', () => {
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    state: { skill: undefined, historicalVersion: null },
                    config: {
                        helpCenter: { id: 10, shop_integration_id: 999 },
                    },
                }),
            )

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.metrics).toBeNull()
        })

        it('returns null metrics when metricsData is undefined (loading)', () => {
            mockUseSkillsMetrics.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.metrics).toBeNull()
        })

        it('returns null metrics when no entry matches skillArticleId', () => {
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    state: { skill: { id: 999 }, historicalVersion: null },
                    config: {
                        helpCenter: { id: 10, shop_integration_id: 999 },
                    },
                }),
            )

            mockUseSkillsMetrics.mockReturnValue({
                data: [
                    {
                        resourceSourceId: 1,
                        tickets: 5,
                        handoverTickets: 1,
                        csat: 4.0,
                        resourceSourceSetId: 50,
                    },
                ],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.metrics).toBeNull()
        })

        it('returns correct metrics when entry matches skillArticleId', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.metrics).toEqual({
                tickets: 10,
                handoverTickets: 3,
                csat: 4.5,
                resourceSourceSetId: 100,
            })
        })

        it('returns resourceSourceId as 0 when no skill', () => {
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    state: { skill: undefined, historicalVersion: null },
                    config: {
                        helpCenter: { id: 10, shop_integration_id: 999 },
                    },
                }),
            )

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.resourceSourceId).toBe(0)
        })

        it('returns resourceSourceId from skill.id when skill exists', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.resourceSourceId).toBe(42)
        })

        it('returns shopIntegrationId from config', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.shopIntegrationId).toBe(999)
        })

        it('returns isLoading from useSkillsMetrics', () => {
            mockUseSkillsMetrics.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.isLoading).toBe(true)
        })

        it('returns totalAiAgentTickets from useTotalAiAgentTickets', () => {
            mockUseTotalAiAgentTickets.mockReturnValue({
                totalCount: 500,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.totalAiAgentTickets).toBe(500)
        })

        it('returns dateRange from getLast28DaysDateRange', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.dateRange).toEqual(mockDateRange)
        })

        it('returns outcomeCustomFieldId and intentCustomFieldId', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.outcomeCustomFieldId).toBe(111)
            expect(result.current.skillMetrics.intentCustomFieldId).toBe(222)
        })

        it('returns undefined custom field IDs when not available', () => {
            mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
                outcomeCustomFieldId: undefined,
                intentCustomFieldId: undefined,
            })

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(
                result.current.skillMetrics.outcomeCustomFieldId,
            ).toBeUndefined()
            expect(
                result.current.skillMetrics.intentCustomFieldId,
            ).toBeUndefined()
        })
    })

    describe('recentTickets', () => {
        it('returns recentTickets from useKnowledgeRecentTickets', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.recentTickets).toEqual(mockRecentTicketsData)
        })

        it('passes skillArticleId as resourceSourceId to useKnowledgeRecentTickets', () => {
            renderHook(() => useSkillPerformanceFromContext())

            expect(mockUseKnowledgeRecentTickets).toHaveBeenCalledWith(
                expect.objectContaining({ resourceSourceId: 42 }),
            )
        })

        it('passes helpCenterId as resourceSourceSetId to useKnowledgeRecentTickets', () => {
            renderHook(() => useSkillPerformanceFromContext())

            expect(mockUseKnowledgeRecentTickets).toHaveBeenCalledWith(
                expect.objectContaining({ resourceSourceSetId: 10 }),
            )
        })

        it('disables useKnowledgeRecentTickets when skillArticleId is undefined', () => {
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    state: { skill: undefined, historicalVersion: null },
                    config: {
                        helpCenter: { id: 10, shop_integration_id: 999 },
                    },
                }),
            )

            renderHook(() => useSkillPerformanceFromContext())

            expect(mockUseKnowledgeRecentTickets).toHaveBeenCalledWith(
                expect.objectContaining({ enabled: false }),
            )
        })

        it('returns undefined when useKnowledgeRecentTickets returns undefined', () => {
            mockUseKnowledgeRecentTickets.mockReturnValue(undefined)

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.recentTickets).toBeUndefined()
        })
    })

    describe('dateRangeOverride', () => {
        const overrideRange = {
            start_datetime: '2026-05-01T00:00:00Z',
            end_datetime: '2026-05-27T23:59:59Z',
        }

        it('uses dateRangeOverride for the metrics query when supplied', () => {
            renderHook(() =>
                useSkillPerformanceFromContext({
                    dateRangeOverride: overrideRange,
                }),
            )

            expect(mockUseSkillsMetrics).toHaveBeenCalledWith(
                999,
                true,
                overrideRange,
            )
        })

        it('uses dateRangeOverride for the per-day metrics query when supplied', () => {
            renderHook(() =>
                useSkillPerformanceFromContext({
                    dateRangeOverride: overrideRange,
                }),
            )

            expect(mockUseSkillsMetricsByDay).toHaveBeenCalledWith(
                999,
                42,
                10,
                true,
                overrideRange,
            )
        })

        it('exposes the override on skillMetrics.dateRange so KPI cards see it', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceFromContext({
                    dateRangeOverride: overrideRange,
                }),
            )

            expect(result.current.skillMetrics.dateRange).toBe(overrideRange)
        })

        it('takes precedence over historicalVersionDateRange', () => {
            const historicalRange = {
                start_datetime: '2026-01-01T00:00:00Z',
                end_datetime: '2026-01-28T23:59:59Z',
            }
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    state: {
                        skill: { id: 42 },
                        historicalVersion: { impactDateRange: historicalRange },
                    },
                    config: {
                        helpCenter: { id: 10, shop_integration_id: 999 },
                    },
                }),
            )

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext({
                    dateRangeOverride: overrideRange,
                }),
            )

            expect(result.current.skillMetrics.dateRange).toBe(overrideRange)
        })

        it('falls back to historicalVersionDateRange when no override is supplied', () => {
            const historicalRange = {
                start_datetime: '2026-01-01T00:00:00Z',
                end_datetime: '2026-01-28T23:59:59Z',
            }
            mockUseSkillEditorStore.mockImplementation((selector) =>
                selector({
                    state: {
                        skill: { id: 42 },
                        historicalVersion: { impactDateRange: historicalRange },
                    },
                    config: {
                        helpCenter: { id: 10, shop_integration_id: 999 },
                    },
                }),
            )

            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.dateRange).toBe(historicalRange)
        })

        it('falls back to getLast28DaysDateRange when neither override nor historical version is set', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceFromContext(),
            )

            expect(result.current.skillMetrics.dateRange).toBe(mockDateRange)
        })
    })
})
