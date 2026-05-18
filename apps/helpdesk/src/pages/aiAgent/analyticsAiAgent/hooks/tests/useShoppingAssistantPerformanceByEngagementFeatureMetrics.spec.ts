import { formatMetricValue } from '@repo/reporting'
import { renderHook } from '@repo/testing'

import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    fetchShoppingAssistantPerformanceByEngagementFeatureAsConfigurableTable,
    fetchShoppingAssistantPerformanceByEngagementFeatureMetrics,
    SHOPPING_ASSISTANT_ENGAGEMENT_FEATURE_ENTITIES,
    useShoppingAssistantPerformanceByEngagementFeatureMetrics,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics'
import { NO_ENGAGEMENT_FEATURE_LABEL } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    assembleEntityRows: jest.requireActual(
        'domains/reporting/hooks/useStatsMetricPerDimension',
    ).assembleEntityRows,
    useEntityMetrics: jest.fn(),
    fetchEntityMetrics: jest.fn(),
}))
jest.mock('domains/reporting/hooks/common/utils', () => ({
    getCsvFileNameWithDates: jest.fn(() => 'engagement-feature-export.csv'),
}))
jest.mock('@repo/reporting', () => ({
    formatMetricValue: jest.fn((value: number) => String(value ?? '')),
}))
jest.mock('utils/file', () => ({
    createCsv: jest.fn(() => 'csv-content'),
}))

const mockUseAiAgentStatsFilters = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentStatsFilters',
).useAiAgentStatsFilters as jest.Mock

const mockUseEntityMetrics = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useEntityMetrics as jest.Mock

const mockFetchEntityMetrics = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchEntityMetrics as jest.Mock
const mockGetCsvFileNameWithDates = jest.requireMock(
    'domains/reporting/hooks/common/utils',
).getCsvFileNameWithDates as jest.Mock
const mockCreateCsv = jest.requireMock('utils/file').createCsv as jest.Mock

describe('useShoppingAssistantPerformanceByEngagementFeatureMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        mockUseEntityMetrics.mockReturnValue({
            data: {
                automatedInteractions: { search_bar: 12, '': 4 },
                handoverInteractions: { search_bar: 2, '': 1 },
                conversionRate: { search_bar: 0.15, '': 0.05 },
                totalSales: { search_bar: 100, '': 50 },
                ordersInfluenced: { search_bar: 5, '': 2 },
                revenuePerInteraction: { search_bar: 8.3, '': 12.5 },
            },
            isLoading: false,
            isError: false,
            loadingStates: {
                automatedInteractions: false,
                handoverInteractions: false,
                conversionRate: false,
                totalSales: false,
                ordersInfluenced: false,
                revenuePerInteraction: false,
            },
        })
    })

    it('keeps the expected entity order', () => {
        expect(SHOPPING_ASSISTANT_ENGAGEMENT_FEATURE_ENTITIES).toEqual([
            'suggested_product_question',
            'search_bar',
            'ask_anything',
            'null',
        ])
    })

    it('normalizes the empty engagement type bucket to null', () => {
        const { result } = renderHook(() =>
            useShoppingAssistantPerformanceByEngagementFeatureMetrics(),
        )

        expect(result.current.data).toEqual([
            {
                entity: 'suggested_product_question',
                automatedInteractions: null,
                handoverInteractions: null,
                conversionRate: null,
                totalSales: null,
                ordersInfluenced: null,
                revenuePerInteraction: null,
            },
            {
                entity: 'search_bar',
                automatedInteractions: 12,
                handoverInteractions: 2,
                conversionRate: 0.15,
                totalSales: 100,
                ordersInfluenced: 5,
                revenuePerInteraction: 8.3,
            },
            {
                entity: 'ask_anything',
                automatedInteractions: null,
                handoverInteractions: null,
                conversionRate: null,
                totalSales: null,
                ordersInfluenced: null,
                revenuePerInteraction: null,
            },
            {
                entity: 'null',
                automatedInteractions: 4,
                handoverInteractions: 1,
                conversionRate: 0.05,
                totalSales: 50,
                ordersInfluenced: 2,
                revenuePerInteraction: 12.5,
            },
        ])
    })

    it('maps the entity loading states to the returned loadingStates', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                automatedInteractions: { search_bar: 12 },
                handoverInteractions: { search_bar: 2 },
                conversionRate: { search_bar: 0.15 },
                totalSales: { search_bar: 100 },
                ordersInfluenced: { search_bar: 5 },
                revenuePerInteraction: { search_bar: 8.3 },
            },
            isLoading: false,
            isError: false,
            loadingStates: {
                automatedInteractions: false,
                handoverInteractions: true,
                conversionRate: false,
                totalSales: false,
                ordersInfluenced: true,
                revenuePerInteraction: false,
            },
        })

        const { result } = renderHook(() =>
            useShoppingAssistantPerformanceByEngagementFeatureMetrics(),
        )

        expect(result.current.loadingStates).toEqual({
            automatedInteractions: false,
            handoverInteractions: true,
            conversionRate: false,
            totalSales: false,
            ordersInfluenced: true,
            revenuePerInteraction: false,
        })
    })

    it('returns isLoading and isError from useEntityMetrics', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                automatedInteractions: {},
                handoverInteractions: {},
                conversionRate: {},
                totalSales: {},
                ordersInfluenced: {},
                revenuePerInteraction: {},
            },
            isLoading: true,
            isError: true,
            loadingStates: {
                automatedInteractions: true,
                handoverInteractions: true,
                conversionRate: true,
                totalSales: true,
                ordersInfluenced: true,
                revenuePerInteraction: true,
            },
        })

        const { result } = renderHook(() =>
            useShoppingAssistantPerformanceByEngagementFeatureMetrics(),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(true)
    })

    it('returns placeholder rows for all engagement features while loading', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                automatedInteractions: {},
                handoverInteractions: {},
                conversionRate: {},
                totalSales: {},
                ordersInfluenced: {},
                revenuePerInteraction: {},
            },
            isLoading: true,
            isError: false,
            loadingStates: {
                automatedInteractions: true,
                handoverInteractions: true,
                conversionRate: true,
                totalSales: true,
                ordersInfluenced: true,
                revenuePerInteraction: true,
            },
        })

        const { result } = renderHook(() =>
            useShoppingAssistantPerformanceByEngagementFeatureMetrics(),
        )

        expect(result.current.data).toEqual([
            {
                entity: 'suggested_product_question',
                automatedInteractions: null,
                handoverInteractions: null,
                conversionRate: null,
                totalSales: null,
                ordersInfluenced: null,
                revenuePerInteraction: null,
            },
            {
                entity: 'search_bar',
                automatedInteractions: null,
                handoverInteractions: null,
                conversionRate: null,
                totalSales: null,
                ordersInfluenced: null,
                revenuePerInteraction: null,
            },
            {
                entity: 'ask_anything',
                automatedInteractions: null,
                handoverInteractions: null,
                conversionRate: null,
                totalSales: null,
                ordersInfluenced: null,
                revenuePerInteraction: null,
            },
            {
                entity: 'null',
                automatedInteractions: null,
                handoverInteractions: null,
                conversionRate: null,
                totalSales: null,
                ordersInfluenced: null,
                revenuePerInteraction: null,
            },
        ])
    })
})

describe('fetchShoppingAssistantPerformanceByEngagementFeatureMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                automatedInteractions: { search_bar: 12, '': 4 },
                handoverInteractions: { search_bar: 2, '': 1 },
                conversionRate: { search_bar: 0.15, '': 0.05 },
                totalSales: { search_bar: 100, '': 50 },
                ordersInfluenced: { search_bar: 5, '': 2 },
                revenuePerInteraction: { search_bar: 8.3, '': 12.5 },
            },
        })
    })

    it('returns a csv file payload', async () => {
        const result =
            await fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                },
                'UTC',
            )

        expect(result.fileName).toMatch(/^engagement-feature-export\.csv$/)
        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('passes full statsFilters to fetchEntityMetrics', async () => {
        const filtersWithExtra = {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
            channel: {
                operator: 'one_of',
                values: ['chat'],
            } as any,
        } as any

        await fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
            filtersWithExtra,
            'UTC',
        )

        expect(mockFetchEntityMetrics).toHaveBeenCalledWith(
            expect.any(Object),
            filtersWithExtra,
            'UTC',
        )
    })

    it('returns a csv file with all rows when there is no data', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                automatedInteractions: {},
                handoverInteractions: {},
                conversionRate: {},
                totalSales: {},
                ordersInfluenced: {},
                revenuePerInteraction: {},
            },
        })

        const result =
            await fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                },
                'UTC',
            )

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('formats each metric cell before building the CSV', async () => {
        await fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
            {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            'UTC',
        )

        expect(formatMetricValue).toHaveBeenCalled()
    })

    it('builds the CSV with engagement feature headers and display names', async () => {
        await fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
            {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            'UTC',
        )

        const csvRows = mockCreateCsv.mock.calls[0][0]
        expect(csvRows[0]).toEqual([
            'Engagement feature',
            'Automated interactions',
            'Handover interactions',
            'Conversion rate',
            'Revenue influenced',
            'Orders influenced',
            'Revenue influenced per interaction',
        ])
        expect(csvRows[1][0]).toBe('AI FAQs')
        expect(csvRows[2][0]).toBe('Search assist')
        expect(csvRows[3][0]).toBe('Ask anything input')
        expect(csvRows[4][0]).toBe(NO_ENGAGEMENT_FEATURE_LABEL)
    })

    it('gets the filename from getCsvFileNameWithDates', async () => {
        await fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
            {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            'UTC',
        )

        expect(mockGetCsvFileNameWithDates).toHaveBeenCalledWith(
            {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
            'shopping_assistant_performance_by_engagement_feature_table',
        )
    })
})

describe('fetchShoppingAssistantPerformanceByEngagementFeatureAsConfigurableTable', () => {
    it('returns only files from the metrics export helper', async () => {
        const result =
            await fetchShoppingAssistantPerformanceByEngagementFeatureAsConfigurableTable(
                null,
                null,
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                },
                'UTC',
                ReportingGranularity.Day,
            )

        expect(result).toEqual({
            files: { 'engagement-feature-export.csv': 'csv-content' },
        })
    })
})
