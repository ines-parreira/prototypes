import { formatMetricValue } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { fetchCostSavedPerStore } from 'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerStore'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { useStoreIntegrations } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import { createCsv } from 'utils/file'
import {
    fetchStoreIntegrationAsConfigurableTable,
    fetchStoreIntegrationMetrics,
    useStoreIntegrationMetrics,
} from '../useStoreIntegrationMetrics'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension')
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils')
jest.mock('domains/reporting/hooks/common/utils')
jest.mock('@repo/reporting')
jest.mock('utils/file')
jest.mock('pages/aiAgent/analyticsOverview/hooks/useCostSavedPerStore')
jest.mock('common/store/store', () => ({
    DefaultExportStore: { getState: jest.fn(() => ({})) },
}))
jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    getIntegrationsByTypes: jest.fn(() => jest.fn(() => [])),
}))

const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)
const mockUseEntityMetrics = assumeMock(useEntityMetrics)
const mockAssembleEntityRows = assumeMock(assembleEntityRows)
const mockFetchEntityMetrics = assumeMock(fetchEntityMetrics)
const mockUseStoreIntegrations = assumeMock(useStoreIntegrations)
const mockGetCsvFileNameWithDates = assumeMock(getCsvFileNameWithDates)
const mockFormatMetricValue = assumeMock(formatMetricValue)
const mockCreateCsv = assumeMock(createCsv)
const mockFetchCostSavedPerStore = assumeMock(fetchCostSavedPerStore)
const mockGetIntegrationsByTypes = assumeMock(getIntegrationsByTypes)

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'

const defaultStoreIntegrations = [
    { store_integration_id: 1, name: 'My Shopify Store' },
    { store_integration_id: 2, name: 'My BigCommerce Store' },
]

const defaultEntityData = {
    overallAutomationRate: { '1': 0.75, '2': 0.9 },
    automatedInteractions: { '1': 1200, '2': 800 },
    handoverInteractions: { '1': 80, '2': 45 },
    costSaved: { '1': 3720, '2': 2480 },
    timeSaved: { '1': 3600, '2': 2400 },
    decreaseInResolutionTime: { '1': 7200, '2': 3600 },
    decreaseInFirstResponseTime: { '1': 1800, '2': 600 },
}

const defaultRows = [
    {
        entity: '1',
        automationRate: 0.75,
        automatedInteractions: 1200,
        handoverInteractions: 80,
        costSaved: 3720,
        timeSaved: 3600,
        decreaseInResolutionTime: 7200,
        decreaseInFirstResponseTime: 1800,
    },
    {
        entity: '2',
        automationRate: 0.9,
        automatedInteractions: 800,
        handoverInteractions: 45,
        costSaved: 2480,
        timeSaved: 2400,
        decreaseInResolutionTime: 3600,
        decreaseInFirstResponseTime: 600,
    },
]

describe('useStoreIntegrationMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
        } as any)
        mockUseStoreIntegrations.mockReturnValue(
            defaultStoreIntegrations as any,
        )
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: false,
            loadingStates: {
                overallAutomationRate: false,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
                decreaseInResolutionTime: false,
                decreaseInFirstResponseTime: false,
            },
        })
        mockAssembleEntityRows.mockReturnValue(defaultRows)
    })

    it('returns assembled rows when all data is loaded', () => {
        const { result } = renderHook(() => useStoreIntegrationMetrics())

        expect(result.current.data).toEqual(defaultRows)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('returns displayNames derived from store integration id and name', () => {
        const { result } = renderHook(() => useStoreIntegrationMetrics())

        expect(result.current.displayNames).toEqual({
            '1': 'My Shopify Store',
            '2': 'My BigCommerce Store',
        })
    })

    it('returns isLoading true when entity metrics are loading', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: true,
            isError: false,
            loadingStates: {
                overallAutomationRate: true,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
                decreaseInResolutionTime: false,
                decreaseInFirstResponseTime: false,
            },
        })

        const { result } = renderHook(() => useStoreIntegrationMetrics())

        expect(result.current.isLoading).toBe(true)
    })

    it('returns isError true when entity metrics have an error', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: true,
            loadingStates: {
                overallAutomationRate: false,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
                decreaseInResolutionTime: false,
                decreaseInFirstResponseTime: false,
            },
        })

        const { result } = renderHook(() => useStoreIntegrationMetrics())

        expect(result.current.isError).toBe(true)
    })

    it('maps entity loading states to output loading states for all 7 metrics', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: false,
            loadingStates: {
                overallAutomationRate: true,
                automatedInteractions: false,
                handoverInteractions: true,
                costSaved: false,
                timeSaved: true,
                decreaseInResolutionTime: false,
                decreaseInFirstResponseTime: true,
            },
        })

        const { result } = renderHook(() => useStoreIntegrationMetrics())

        expect(result.current.loadingStates.automationRate).toBe(true)
        expect(result.current.loadingStates.automatedInteractions).toBe(false)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
        expect(result.current.loadingStates.costSaved).toBe(false)
        expect(result.current.loadingStates.timeSaved).toBe(true)
        expect(result.current.loadingStates.decreaseInResolutionTime).toBe(
            false,
        )
        expect(result.current.loadingStates.decreaseInFirstResponseTime).toBe(
            true,
        )
    })

    it('returns empty displayNames when store integrations array is empty', () => {
        mockUseStoreIntegrations.mockReturnValue([])

        const { result } = renderHook(() => useStoreIntegrationMetrics())

        expect(result.current.displayNames).toEqual({})
    })

    it('passes store integration string IDs as entities to assembleEntityRows', () => {
        renderHook(() => useStoreIntegrationMetrics())

        const entitiesPassedToAssemble = mockAssembleEntityRows.mock.calls[0][0]
        expect(entitiesPassedToAssemble).toEqual(['1', '2'])
    })

    describe('buildStoreIntegrationRow', () => {
        it('maps entity data fields to a row including the 2 decrease metrics', () => {
            renderHook(() => useStoreIntegrationMetrics())

            const buildRow = mockAssembleEntityRows.mock.calls[0][1]
            expect(buildRow('1')).toEqual({
                entity: '1',
                automationRate: 0.75,
                automatedInteractions: 1200,
                handoverInteractions: 80,
                costSaved: 3720,
                timeSaved: 3600,
                decreaseInResolutionTime: 7200,
                decreaseInFirstResponseTime: 1800,
            })
        })

        it('returns null for missing metric values', () => {
            renderHook(() => useStoreIntegrationMetrics())

            const buildRow = mockAssembleEntityRows.mock.calls[0][1]
            expect(buildRow('nonexistent')).toEqual({
                entity: 'nonexistent',
                automationRate: null,
                automatedInteractions: null,
                handoverInteractions: null,
                costSaved: null,
                timeSaved: null,
                decreaseInResolutionTime: null,
                decreaseInFirstResponseTime: null,
            })
        })
    })
})

describe('fetchStoreIntegrationMetrics', () => {
    const mockMetricsData = {
        overallAutomationRate: { '1': 0.75 },
        automatedInteractions: { '1': 1200 },
        handoverInteractions: { '1': 80 },
        costSaved: { '1': 3720 },
        timeSaved: { '1': 3600 },
        decreaseInResolutionTime: { '1': 7200 },
        decreaseInFirstResponseTime: { '1': 1800 },
    }

    const mockRow = {
        entity: '1',
        automationRate: 0.75,
        automatedInteractions: 1200,
        handoverInteractions: 80,
        costSaved: 3720,
        timeSaved: 3600,
        decreaseInResolutionTime: 7200,
        decreaseInFirstResponseTime: 1800,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchEntityMetrics.mockResolvedValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        } as any)
        mockAssembleEntityRows.mockReturnValue([mockRow])
        mockGetCsvFileNameWithDates.mockReturnValue(
            '2024-01-01_2024-01-31-store_table',
        )
        mockFormatMetricValue.mockImplementation(
            (v: number | null | undefined) => String(v ?? ''),
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns empty file content when data is empty', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result = await fetchStoreIntegrationMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns CSV content when data is available', async () => {
        const result = await fetchStoreIntegrationMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('uses displayNames to resolve entity names in CSV rows', async () => {
        const displayNames = { '1': 'My Shopify Store' }

        await fetchStoreIntegrationMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            undefined,
            displayNames,
        )

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('My Shopify Store')
    })

    it('falls back to entity id when display name is missing', async () => {
        await fetchStoreIntegrationMetrics(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('1')
    })

    it('passes costSavedPerInteraction to createStoreIntegrationFetchConfig', async () => {
        const customCost = 42

        await fetchStoreIntegrationMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        await passedConfig.costSaved.fetch(MOCK_STATS_FILTERS, MOCK_TIMEZONE)
        expect(mockFetchCostSavedPerStore).toHaveBeenCalledWith(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result = await fetchStoreIntegrationMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe('2024-01-01_2024-01-31-store_table')
    })

    describe('fetchStoreIntegrationAsConfigurableTable', () => {
        it('passes filters and timezone to the underlying fetch function', async () => {
            await fetchStoreIntegrationAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

            const [, passedFilters, passedTimezone] =
                mockFetchEntityMetrics.mock.calls[0]
            expect(passedFilters).toEqual(MOCK_STATS_FILTERS)
            expect(passedTimezone).toBe(MOCK_TIMEZONE)
        })

        it('forwards costSavedPerInteraction from extra', async () => {
            const customCost = 9.99
            await fetchStoreIntegrationAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
                { costSavedPerInteraction: customCost },
            )

            expect(mockFetchEntityMetrics).toHaveBeenCalledWith(
                expect.objectContaining({ costSaved: expect.any(Object) }),
                expect.any(Object),
                expect.any(String),
            )
        })

        it('uses AGENT_COST_PER_TICKET when extra is not provided', async () => {
            await fetchStoreIntegrationAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

            const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
            await passedConfig.costSaved.fetch(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )
            expect(mockFetchCostSavedPerStore).toHaveBeenCalledWith(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                AGENT_COST_PER_TICKET,
            )
        })

        it('builds display names from store integrations and passes them to the CSV', async () => {
            mockGetIntegrationsByTypes.mockReturnValue(
                jest.fn(() => [{ id: 1, name: 'My Shopify Store' }]) as any,
            )

            await fetchStoreIntegrationAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

            const csvCallArgs = mockCreateCsv.mock.calls[0][0]
            const firstDataRow = csvCallArgs[1]
            expect(firstDataRow[0]).toBe('My Shopify Store')
        })

        it('returns files from the underlying fetch', async () => {
            const result = await fetchStoreIntegrationAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

            expect(result.files).toEqual({
                '2024-01-01_2024-01-31-store_table': 'csv-content',
            })
        })
    })
})
