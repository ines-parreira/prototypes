import { ReportingGranularity } from 'domains/reporting/models/types'

import {
    fetchPerformanceMetricsPerFeature,
    fetchPerformanceMetricsPerFeatureAsConfigurableTable,
} from '../fetchPerformanceBreakdownData'

jest.mock('domains/reporting/hooks/automate/automationTrends', () => ({
    fetchTrendFromMultipleMetricsTrend: jest.fn(),
}))
jest.mock('domains/reporting/hooks/metricTrends', () => ({
    fetchTicketHandleTimeTrend: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useAutomationRateByFeature',
    () => ({ fetchAutomationRateByFeatureData: jest.fn() }),
)
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
const { fetchAutomationRateByFeatureData } = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useAutomationRateByFeature',
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
    fetchAutomationRateByFeatureData.mockResolvedValue({
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
        await fetchPerformanceMetricsPerFeature(MOCK_STATS_FILTERS, 'UTC')

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

    it('should still return CSV rows when all data is zero', async () => {
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
        fetchAutomationRateByFeatureData.mockResolvedValue({
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
        )

        const csv = files[fileName]
        expect(csv).toContain('AI Agent')
        expect(csv).toContain('Flows')
        expect(csv).toContain('Article Recommendation')
        expect(csv).toContain('Order Management')
    })

    it('should include fileName with period dates and .csv extension', async () => {
        const { fileName } = await fetchPerformanceMetricsPerFeature(
            MOCK_STATS_FILTERS,
            'UTC',
        )

        expect(fileName).toContain('performance-breakdown')
        expect(fileName).toContain('.csv')
    })
})

describe('fetchPerformanceMetricsPerFeatureAsConfigurableTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setupV2AutomationRate()
        setupInteractionMocks()
    })

    it('passes filters and timezone to the underlying fetch function', async () => {
        await fetchPerformanceMetricsPerFeatureAsConfigurableTable(
            null,
            null,
            MOCK_STATS_FILTERS,
            'UTC',
            ReportingGranularity.Day,
        )

        const { files, fileName } = await fetchPerformanceMetricsPerFeature(
            MOCK_STATS_FILTERS,
            'UTC',
        )
        expect(Object.keys(files)).toContain(fileName)
    })

    it('returns CSV rows when all data is zero', async () => {
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
        fetchAutomationRateByFeatureData.mockResolvedValue({
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

        const { files } =
            await fetchPerformanceMetricsPerFeatureAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                'UTC',
                ReportingGranularity.Day,
            )

        const csv = Object.values(files)[0]
        expect(csv).toContain('AI Agent')
        expect(csv).toContain('Flows')
    })

    it('forwards costSavedPerInteraction from extra', async () => {
        const customCost = 5.5
        const { files } =
            await fetchPerformanceMetricsPerFeatureAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                'UTC',
                ReportingGranularity.Day,
                { costSavedPerInteraction: customCost },
            )

        const csv = Object.values(files)[0]
        const rows = csv.split('\r\n')
        const aiAgentRow = rows.find((r) => r.startsWith('"AI Agent"'))
        expect(aiAgentRow).toContain('"$14,850"')
    })
})
