import type { AggregationWindow } from 'domains/reporting/models/stat/types'

import {
    fetchPerformanceMetricsPerFeature,
    fetchPerformanceMetricsPerFeatureReport,
} from '../fetchPerformanceBreakdownData'

jest.mock('domains/reporting/hooks/automate/automationTrends', () => ({
    fetchTrendFromMultipleMetricsTrend: jest.fn(),
    fetchAllAutomatedInteractions: jest.fn(),
    fetchAllAutomatedInteractionsByAutoResponders: jest.fn(),
    fetchBillableTicketsExcludingAIAgent: jest.fn(),
}))
jest.mock('domains/reporting/hooks/metricTrends', () => ({
    fetchTicketHandleTimeTrend: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration', () => ({
    getNewStatsFeatureFlagMigration: jest.fn(),
}))
jest.mock('domains/reporting/hooks/automate/automateStatsFormulae', () => ({
    automationRateUnfilteredDenominator: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFeature',
    () => ({ fetchHandoverInteractionsPerFeature: jest.fn() }),
)

const { fetchTrendFromMultipleMetricsTrend } = jest.requireMock(
    'domains/reporting/hooks/automate/automationTrends',
)
const { fetchTicketHandleTimeTrend } = jest.requireMock(
    'domains/reporting/hooks/metricTrends',
)
const { fetchStatsMetricPerDimension } = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
)
const { getNewStatsFeatureFlagMigration } = jest.requireMock(
    'domains/reporting/utils/getNewStatsFeatureFlagMigration',
)
const { fetchHandoverInteractionsPerFeature } = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFeature',
)

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
    agent_ids: [1, 2],
}

const makeTrend = (value: number | null) => ({
    data: { value },
    isFetching: false,
    isError: false,
})

const setupV2AutomationRate = () => {
    getNewStatsFeatureFlagMigration.mockResolvedValue('live')
    fetchStatsMetricPerDimension.mockResolvedValue({
        data: {
            allValues: [
                { dimension: 'ai-agent', value: 18 },
                { dimension: 'flow', value: 7 },
                { dimension: 'article-recommendation', value: 4 },
                { dimension: 'order-management', value: 3 },
            ],
        },
        isFetching: false,
        isError: false,
    })
}

const setupInteractionMocks = () => {
    fetchTrendFromMultipleMetricsTrend
        .mockResolvedValueOnce(makeTrend(2700)) // AI Agent
        .mockResolvedValueOnce(makeTrend(450)) // Flows
        .mockResolvedValueOnce(makeTrend(350)) // Article Recommendation
        .mockResolvedValueOnce(makeTrend(189)) // Order Management
    fetchHandoverInteractionsPerFeature.mockResolvedValue({
        data: {
            allValues: [
                { dimension: 'ai-agent', value: 120, decile: null },
                { dimension: 'flow', value: 45, decile: null },
                {
                    dimension: 'article-recommendation',
                    value: 10,
                    decile: null,
                },
                { dimension: 'order-management', value: 5, decile: null },
            ],
        },
    })
    fetchTicketHandleTimeTrend.mockResolvedValue(makeTrend(220))
}

describe('fetchPerformanceMetricsPerFeature', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setupV2AutomationRate()
        setupInteractionMocks()
    })

    it('should strip statsFilters to period only when calling fetch functions', async () => {
        await fetchPerformanceMetricsPerFeature(
            MOCK_STATS_FILTERS,
            'UTC',
            undefined,
        )

        expect(fetchTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            { period: MOCK_STATS_FILTERS.period },
            'UTC',
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.anything(),
        )
        expect(fetchHandoverInteractionsPerFeature).toHaveBeenCalledWith(
            { period: MOCK_STATS_FILTERS.period },
            'UTC',
        )
        expect(fetchTicketHandleTimeTrend).toHaveBeenCalledWith(
            { period: MOCK_STATS_FILTERS.period },
            'UTC',
        )
    })

    it('should return CSV with correct headers', async () => {
        const { files, fileName } = await fetchPerformanceMetricsPerFeature(
            MOCK_STATS_FILTERS,
            'UTC',
            undefined,
        )

        const rows = files[fileName].split('\r\n')
        expect(rows[0]).toContain('Feature')
        expect(rows[0]).toContain('Overall automation rate')
        expect(rows[0]).toContain('Automated interactions')
        expect(rows[0]).toContain('Handover interactions')
        expect(rows[0]).toContain('Cost saved')
        expect(rows[0]).toContain('Time saved by agents')
    })

    it('should return CSV rows for all four features', async () => {
        const { files, fileName } = await fetchPerformanceMetricsPerFeature(
            MOCK_STATS_FILTERS,
            'UTC',
            undefined,
        )

        const csv = files[fileName]
        expect(csv).toContain('AI Agent')
        expect(csv).toContain('Flows')
        expect(csv).toContain('Article Recommendation')
        expect(csv).toContain('Order Management')
    })

    it('should include handover values for all features', async () => {
        const { files, fileName } = await fetchPerformanceMetricsPerFeature(
            MOCK_STATS_FILTERS,
            'UTC',
            undefined,
        )

        const rows = files[fileName].split('\r\n')
        const aiAgentRow = rows.find((r) => r.startsWith('"AI Agent"'))
        const flowsRow = rows.find((r) => r.startsWith('"Flows"'))
        const articleRow = rows.find((r) =>
            r.includes('Article Recommendation'),
        )
        const orderRow = rows.find((r) => r.includes('Order Management'))

        expect(aiAgentRow).toContain('"120"')
        expect(flowsRow).toContain('"45"')
        expect(articleRow).toContain('"10"')
        expect(orderRow).toContain('"5"')
    })

    it('should return empty CSV when all data is zero', async () => {
        fetchHandoverInteractionsPerFeature.mockResolvedValue({
            data: {
                allValues: [
                    { dimension: 'ai-agent', value: 0, decile: null },
                    { dimension: 'flow', value: 0, decile: null },
                    {
                        dimension: 'article-recommendation',
                        value: 0,
                        decile: null,
                    },
                    { dimension: 'order-management', value: 0, decile: null },
                ],
            },
        })
        fetchTrendFromMultipleMetricsTrend.mockReset()
        fetchTrendFromMultipleMetricsTrend.mockResolvedValue(makeTrend(0))
        fetchTicketHandleTimeTrend.mockResolvedValue(makeTrend(0))
        fetchStatsMetricPerDimension.mockResolvedValue({
            data: {
                allValues: [
                    { dimension: 'ai-agent', value: 0 },
                    { dimension: 'flow', value: 0 },
                    { dimension: 'article-recommendation', value: 0 },
                    { dimension: 'order-management', value: 0 },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const { files, fileName } = await fetchPerformanceMetricsPerFeature(
            MOCK_STATS_FILTERS,
            'UTC',
            undefined,
        )

        expect(files[fileName]).toBe('')
    })

    it('should include fileName with period dates and .csv extension', async () => {
        const { fileName } = await fetchPerformanceMetricsPerFeature(
            MOCK_STATS_FILTERS,
            'UTC',
            undefined,
        )

        expect(fileName).toContain('performance-breakdown')
        expect(fileName).toContain('.csv')
    })
})

describe('fetchPerformanceMetricsPerFeatureReport', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setupV2AutomationRate()
        setupInteractionMocks()
    })

    it('should return isLoading false with CSV result', async () => {
        const result = await fetchPerformanceMetricsPerFeatureReport(
            MOCK_STATS_FILTERS,
            'UTC',
            'day' as AggregationWindow,
            {
                aiAgentUserId: undefined,
                costSavedPerInteraction: 3.1,
            } as Parameters<typeof fetchPerformanceMetricsPerFeatureReport>[3],
        )

        expect(result.isLoading).toBe(false)
        expect(result.fileName).toContain('performance-breakdown')
        expect(Object.keys(result.files)).toHaveLength(1)
    })

    it('should use costSavedPerInteraction from context when computing cost saved', async () => {
        const customCostSaved = 5.5
        // beforeEach sets AI Agent interactions to 2700
        const { files, fileName } =
            await fetchPerformanceMetricsPerFeatureReport(
                MOCK_STATS_FILTERS,
                'UTC',
                'day' as AggregationWindow,
                {
                    aiAgentUserId: undefined,
                    costSavedPerInteraction: customCostSaved,
                } as Parameters<
                    typeof fetchPerformanceMetricsPerFeatureReport
                >[3],
            )

        const rows = files[fileName].split('\r\n')
        const aiAgentRow = rows.find((r) => r.startsWith('"AI Agent"'))
        // 2700 * 5.5 = 14,850 (beforeEach sets AI Agent to 2700)
        // default AGENT_COST_PER_TICKET = 3.1 → 2700 * 3.1 = 8,370, so values differ
        expect(aiAgentRow).toContain('"$14,850"')
    })
})
