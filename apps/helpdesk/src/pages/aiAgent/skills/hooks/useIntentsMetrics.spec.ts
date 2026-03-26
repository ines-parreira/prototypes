import { renderHook } from '@testing-library/react'

import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import { aggregateIntentMetrics } from 'domains/reporting/models/queryFactories/intents/intentInsightsMetrics'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { useIntentsMetrics } from './useIntentsMetrics'
import { useTotalAiAgentTickets } from './useTotalAiAgentTickets'

jest.mock('domains/reporting/hooks/useMetricPerDimension', () => ({
    useMetricPerDimensionV2: jest.fn(),
}))

jest.mock(
    'domains/reporting/models/queryFactories/intents/intentInsightsMetrics',
    () => ({
        aggregateIntentMetrics: jest.fn(),
    }),
)

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        getLast28DaysDateRange: jest.fn(),
    }),
)

jest.mock(
    'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount',
    () => ({
        aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory:
            jest.fn(),
    }),
)

jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations', () => ({
    useGetTicketChannelsStoreIntegrations: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(),
    }),
)

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

jest.mock('./useTotalAiAgentTickets', () => ({
    useTotalAiAgentTickets: jest.fn(),
}))

const mockUseMetricPerDimensionV2 = useMetricPerDimensionV2 as jest.Mock
const mockAggregateIntentMetrics = aggregateIntentMetrics as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock
const mockAiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory =
    aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory as jest.Mock
const mockUseGetTicketChannelsStoreIntegrations =
    useGetTicketChannelsStoreIntegrations as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseGetCustomTicketsFieldsDefinitionData =
    useGetCustomTicketsFieldsDefinitionData as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseTotalAiAgentTickets = useTotalAiAgentTickets as jest.Mock

const mockDateRange = { from: '2024-01-01', to: '2024-01-28' }

const defaultMetricResult = {
    isFetching: false,
    isError: false,
    data: { allData: [] },
}

describe('useIntentsMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetLast28DaysDateRange.mockReturnValue(mockDateRange)
        mockAiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory.mockReturnValue(
            {},
        )
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: { storeName: 'my-shop' },
        })
        mockUseAppSelector.mockReturnValue('America/New_York')
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 1,
            outcomeCustomFieldId: 2,
            isLoading: false,
        })
        mockUseGetTicketChannelsStoreIntegrations.mockReturnValue([42])
        mockUseMetricPerDimensionV2.mockReturnValue(defaultMetricResult)
        mockUseTotalAiAgentTickets.mockReturnValue({ totalCount: 100 })
        mockAggregateIntentMetrics.mockReturnValue(
            new Map([
                [
                    'order::cancel',
                    {
                        ticketCount: 10,
                        handoverCount: 2,
                        ticketPercent: 0.1,
                        handoverPercent: 0.2,
                    },
                ],
            ]),
        )
    })

    it('returns an empty map when totalMetric is fetching', () => {
        mockUseMetricPerDimensionV2
            .mockReturnValueOnce({
                isFetching: true,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce(defaultMetricResult)

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual(new Map())
    })

    it('returns an empty map when handoverMetric is fetching', () => {
        mockUseMetricPerDimensionV2
            .mockReturnValueOnce(defaultMetricResult)
            .mockReturnValueOnce({
                isFetching: true,
                isError: false,
                data: { allData: [] },
            })

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual(new Map())
    })

    it('returns an empty map when totalMetric has an error', () => {
        mockUseMetricPerDimensionV2
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })
            .mockReturnValueOnce(defaultMetricResult)

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toEqual(new Map())
    })

    it('returns an empty map when handoverMetric has an error', () => {
        mockUseMetricPerDimensionV2
            .mockReturnValueOnce(defaultMetricResult)
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toEqual(new Map())
    })

    it('returns aggregated metrics when data is available', () => {
        const aggregatedMap = new Map([
            [
                'order::cancel',
                {
                    ticketCount: 10,
                    handoverCount: 2,
                    ticketPercent: 0.1,
                    handoverPercent: 0.2,
                },
            ],
        ])
        mockAggregateIntentMetrics.mockReturnValue(aggregatedMap)

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data).toBe(aggregatedMap)
        expect(mockAggregateIntentMetrics).toHaveBeenCalledWith([], [], 100)
    })

    it('sets isLoading to true when totalMetric.isFetching is true', () => {
        mockUseMetricPerDimensionV2
            .mockReturnValueOnce({
                isFetching: true,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce(defaultMetricResult)

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isLoading).toBe(true)
    })

    it('sets isLoading to true when handoverMetric.isFetching is true', () => {
        mockUseMetricPerDimensionV2
            .mockReturnValueOnce(defaultMetricResult)
            .mockReturnValueOnce({
                isFetching: true,
                isError: false,
                data: { allData: [] },
            })

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isLoading).toBe(true)
    })

    it('sets isError to true when totalMetric.isError is true', () => {
        mockUseMetricPerDimensionV2
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })
            .mockReturnValueOnce(defaultMetricResult)

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isError).toBe(true)
    })

    it('sets isError to true when handoverMetric.isError is true', () => {
        mockUseMetricPerDimensionV2
            .mockReturnValueOnce(defaultMetricResult)
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })

        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.isError).toBe(true)
    })

    it('returns metricsDateRange from getLast28DaysDateRange', () => {
        const { result } = renderHook(() => useIntentsMetrics())

        expect(result.current.metricsDateRange).toBe(mockDateRange)
    })

    it('disables the query when intentCustomFieldId is falsy', () => {
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 0,
            outcomeCustomFieldId: 2,
            isLoading: false,
        })

        renderHook(() => useIntentsMetrics())

        expect(mockUseMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            undefined,
            undefined,
            false,
        )
    })

    it('disables the query when enabled=false is passed', () => {
        renderHook(() => useIntentsMetrics(false))

        expect(mockUseMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            undefined,
            undefined,
            false,
        )
    })

    it('uses UTC timezone when the timezone selector returns null', () => {
        mockUseAppSelector.mockReturnValue(null)

        renderHook(() => useIntentsMetrics())

        expect(
            mockAiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory,
        ).toHaveBeenCalledWith(expect.objectContaining({ timezone: 'UTC' }))
    })
})
