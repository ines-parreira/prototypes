import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import { OrderDirection } from '@gorgias/helpdesk-queries'

import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { AutomateStatsMeasureLabelMap } from 'domains/reporting/hooks/automate/automateStatsMeasureLabelMap'
import {
    AI_AGENT_AUTOMATED_TICKETS_FILENAME,
    AI_AGENT_PERFORMANCE_FILENAME,
    AI_AGENT_REPORT_FILE_NAME,
    AI_AGENT_TICKET_INSIGHTS_FILENAME,
    useAgentPerformanceMetrics,
    useAIAgentReportMetrics,
    useAutomatedTicketsMetrics,
    useTicketInsightsMetrics,
} from 'domains/reporting/hooks/automate/useAIAgentReportMetrics'
import { useAutomateMetricsTimeSeries } from 'domains/reporting/hooks/automate/useAutomationDataset'
import { calculateGreyArea } from 'domains/reporting/hooks/automate/utils'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { getPeriodDateTimes } from 'domains/reporting/hooks/helpers'
import { useAgentsAverageMetrics } from 'domains/reporting/hooks/support-performance/agents/useAgentsAverageMetrics'
import { useAgentsMetrics } from 'domains/reporting/hooks/support-performance/agents/useAgentsMetrics'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useCustomFieldsTicketCountTimeSeries } from 'domains/reporting/hooks/timeSeries'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { AutomationBillingEventMeasure } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getTimeSeriesFormattedData } from 'domains/reporting/pages/automate/overview/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getData as getPerformanceData } from 'domains/reporting/services/agentsPerformanceReportingService'
import { formatData as getTicketInsightsData } from 'domains/reporting/services/ticketFieldsReportingService'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { agents } from 'fixtures/agents'
import useAppSelector from 'hooks/useAppSelector'
import { createCsv } from 'utils/file'

const timeSeriesMock = [
    [
        {
            dateTime: '2024-09-20',
            value: 4,
            label: AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent,
        },
        {
            dateTime: '2024-09-23',
            value: 4,
            label: AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent,
        },
    ],

    [
        {
            dateTime: '2024-09-21',
            value: 4,
            label: AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder,
        },
    ],
    [
        {
            dateTime: '2024-09-22',
            value: 4,
            label: AutomationBillingEventMeasure.ResolutionTimeWithAutomateFeatures,
        },
    ],

    [
        {
            dateTime: '2024-09-24',
            value: 4,
            label: AutomationBillingEventMeasure.FirstResponseTimeWithAutomateFeatures,
        },
    ],
]

const periodDateTimes = [
    '2024-09-14T00:00:00.000',
    '2024-09-15T00:00:00.000',
    '2024-09-16T00:00:00.000',
    '2024-09-17T00:00:00.000',
    '2024-09-18T00:00:00.000',
    '2024-09-19T00:00:00.000',
    '2024-09-20T00:00:00.000',
]

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
// useAgentPerformanceMetrics
jest.mock('domains/reporting/hooks/support-performance/agents/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)

jest.mock(
    'domains/reporting/hooks/support-performance/agents/useAgentsAverageMetrics',
)
const useAgentsSummaryMetricsMock = assumeMock(useAgentsAverageMetrics)

jest.mock('domains/reporting/hooks/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)

// useAutomatedTicketsMetrics
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/automate/useAutomationDataset')
const useAutomateMetricsTimeSeriesMock = assumeMock(
    useAutomateMetricsTimeSeries,
)

jest.mock('domains/reporting/hooks/automate/utils')
const calculateGreyAreaMock = assumeMock(calculateGreyArea)

jest.mock('domains/reporting/pages/automate/overview/utils')
const useTimeSeriesFormattedDataMock = assumeMock(getTimeSeriesFormattedData)

// useTicketInsightsMetrics
jest.mock('domains/reporting/hooks/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries,
)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('domains/reporting/hooks/helpers')
const getPeriodDateTimesMock = assumeMock(getPeriodDateTimes)

jest.mock('domains/reporting/services/agentsPerformanceReportingService')
const getPerformanceDataMock = assumeMock(getPerformanceData)

jest.mock('domains/reporting/services/ticketFieldsReportingService', () => ({
    formatData: jest.fn(() => [['ticket-insights-data']]),
}))
const getTicketInsightsDataMock = assumeMock(getTicketInsightsData)

describe('useAgentPerformanceMetrics', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce(agents)

        useAgentsMetricsMock.mockReturnValue({
            isLoading: false,
            reportData: { 'agents-metrics': [] },
        } as unknown as ReturnType<typeof useAgentsMetrics>)

        useAgentsSummaryMetricsMock.mockReturnValue({
            isLoading: false,
            averageData: { 'agents-summary-metrics': [] },
        } as unknown as ReturnType<typeof useAgentsAverageMetrics>)

        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: [AgentsTableColumn.AgentName],
        } as unknown as ReturnType<typeof useAgentsTableConfigSetting>)
    })

    it('should return the correct agent performance metrics', () => {
        const data = useAgentPerformanceMetrics()

        expect(data).toEqual({
            agents,
            performance: {
                data: { 'agents-metrics': [] },
                average: { 'agents-summary-metrics': [] },
                total: { 'agents-summary-metrics': [] },
                columnsOrder: [AgentsTableColumn.AgentName],
            },
            performanceDataIsLoading: false,
        })
    })
})

const statsFiltersMock: StatsFiltersWithLogicalOperator = {
    period: {
        start_datetime: '2024-09-14T00:00:00+00:00',
        end_datetime: '2024-09-20T23:59:59+00:00',
    },
    agents: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [5],
    },
}

describe('useAutomatedTicketsMetrics', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(statsFiltersMock)

        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-09-14T00:00:00+00:00',
                    end_datetime: '2024-09-20T23:59:59+00:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        useAutomateMetricsTimeSeriesMock.mockReturnValue({
            isFetching: false,
        } as unknown as ReturnType<typeof useAutomateMetricsTimeSeries>)

        calculateGreyAreaMock.mockReturnValueOnce({
            from: moment(new Date('2024-09-17')),
            to: moment(new Date('2024-09-20')),
        })

        useTimeSeriesFormattedDataMock.mockReturnValue({
            exportableData: {
                automatedInteractionByEventTypesTimeSeries: timeSeriesMock,
            },
        } as unknown as ReturnType<typeof getTimeSeriesFormattedData>)
    })

    it('should return the correct automated tickets metrics', () => {
        const data = renderHook(() => useAutomatedTicketsMetrics())

        expect(data.result.current).toEqual({
            automatedTickets: {
                automateStatsMeasureLabelMap: AutomateStatsMeasureLabelMap,
                automatedInteractionByEventTypesTimeSeries: [timeSeriesMock[0]],
            },
            automatedTicketsDataIsLoading: false,
        })
    })
})

const aiAgentCustomFields = [
    { label: 'AI Intent', managed_type: AI_MANAGED_TYPES.AI_INTENT },
]

const order = OrderDirection.Asc
const customFieldTimesSeries = 'use-custom-fields-ticket-count-time-series'

const ticketInsights = {
    data: customFieldTimesSeries,
    dateTimes: [
        'Sat, Sep 14',
        'Sun, Sep 15',
        'Mon, Sep 16',
        'Tue, Sep 17',
        'Wed, Sep 18',
        'Thu, Sep 19',
        'Fri, Sep 20',
    ],
    order,
}

describe('useTicketInsightsMetrics', () => {
    const selectedCustomFieldId = 123

    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce({
            direction: order,
            column: 'total',
        })

        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-09-14T00:00:00+00:00',
                    end_datetime: '2024-09-20T23:59:59+00:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            isLoading: false,
            data: customFieldTimesSeries,
        } as unknown as ReturnType<typeof useCustomFieldsTicketCountTimeSeries>)

        getPeriodDateTimesMock.mockReturnValue(periodDateTimes)
    })

    it('should return undefined if custom fields are not AI agent custom fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValueOnce({
            data: { data: [] },
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const data = renderHook(() =>
            useTicketInsightsMetrics(selectedCustomFieldId),
        )

        expect(data.result.current).toEqual({
            ticketInsightsData: undefined,
            ticketInsightsDataIsLoading: false,
        })
    })

    it('should return automated tickets data', () => {
        useCustomFieldDefinitionsMock.mockReturnValueOnce({
            data: { data: aiAgentCustomFields },
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const data = renderHook(() =>
            useTicketInsightsMetrics(selectedCustomFieldId),
        )

        expect(data.result.current).toEqual({
            ticketInsights: ticketInsights,
            ticketInsightsDataIsLoading: false,
        })
    })
})

describe('useAIAgentReportMetrics', () => {
    const selectedCustomFieldId = 123
    const period = {
        start_datetime: '2024-09-14T00:00:00+00:00',
        end_datetime: '2024-09-20T23:59:59+00:00',
    }

    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce(statsFiltersMock)

        useAppSelectorMock.mockReturnValueOnce(agents)

        getPerformanceDataMock.mockReturnValue([['agents-performance-data']])
        useAgentsMetricsMock.mockReturnValue({
            isLoading: false,
            reportData: { 'agents-metrics': [] },
        } as unknown as ReturnType<typeof useAgentsMetrics>)

        useAgentsSummaryMetricsMock.mockReturnValue({
            isLoading: false,
            summaryData: { 'agents-summary-metrics': [] },
        } as unknown as ReturnType<typeof useAgentsAverageMetrics>)

        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: [AgentsTableColumn.AgentName],
        } as unknown as ReturnType<typeof useAgentsTableConfigSetting>)

        useAppSelectorMock.mockReturnValueOnce(statsFiltersMock)

        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-09-14T00:00:00+00:00',
                    end_datetime: '2024-09-20T23:59:59+00:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        useAutomateMetricsTimeSeriesMock.mockReturnValue({
            isFetching: false,
        } as unknown as ReturnType<typeof useAutomateMetricsTimeSeries>)

        calculateGreyAreaMock.mockReturnValueOnce({
            from: moment(new Date('2024-09-17')),
            to: moment(new Date('2024-09-20')),
        })

        useTimeSeriesFormattedDataMock.mockReturnValue({
            exportableData: {
                automatedInteractionByEventTypesTimeSeries: timeSeriesMock,
            },
        } as unknown as ReturnType<typeof getTimeSeriesFormattedData>)

        useAppSelectorMock.mockReturnValueOnce({
            direction: order,
            column: 'total',
        })

        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-09-14T00:00:00+00:00',
                    end_datetime: '2024-09-20T23:59:59+00:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            isLoading: false,
            data: customFieldTimesSeries,
        } as unknown as ReturnType<typeof useCustomFieldsTicketCountTimeSeries>)

        getPeriodDateTimesMock.mockReturnValue(periodDateTimes)
    })

    it('should return the correct ai agent metrics', () => {
        useCustomFieldDefinitionsMock.mockReturnValueOnce({
            data: { data: aiAgentCustomFields },
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const data = renderHook(() =>
            useAIAgentReportMetrics(selectedCustomFieldId),
        )

        expect(getTicketInsightsDataMock).toHaveBeenCalledWith(
            ticketInsights.data,
            ticketInsights.dateTimes,
            ticketInsights.order,
        )

        expect(data.result.current).toEqual({
            fileName: getCsvFileNameWithDates(
                period,
                AI_AGENT_REPORT_FILE_NAME,
            ),
            files: {
                [getCsvFileNameWithDates(
                    period,
                    AI_AGENT_PERFORMANCE_FILENAME,
                )]: createCsv([['agents-performance-data']]),
                [getCsvFileNameWithDates(
                    period,
                    AI_AGENT_AUTOMATED_TICKETS_FILENAME,
                )]: createCsv([
                    [' ', 'AI Agent'],
                    ['2024-09-20', 4],
                    ['2024-09-23', 4],
                ]),
                [getCsvFileNameWithDates(
                    period,
                    AI_AGENT_TICKET_INSIGHTS_FILENAME,
                )]: createCsv([['ticket-insights-data']]),
            },
            isLoading: false,
        })
    })

    it('should return the correct ai agent metrics without ticket insights', () => {
        useCustomFieldDefinitionsMock.mockReturnValueOnce({
            data: { data: [] },
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const data = renderHook(() =>
            useAIAgentReportMetrics(selectedCustomFieldId),
        )

        expect(data.result.current).toEqual({
            fileName: getCsvFileNameWithDates(
                period,
                AI_AGENT_REPORT_FILE_NAME,
            ),
            files: {
                [getCsvFileNameWithDates(
                    period,
                    AI_AGENT_PERFORMANCE_FILENAME,
                )]: createCsv([['agents-performance-data']]),
                [getCsvFileNameWithDates(
                    period,
                    AI_AGENT_AUTOMATED_TICKETS_FILENAME,
                )]: createCsv([
                    [' ', 'AI Agent'],
                    ['2024-09-20', 4],
                    ['2024-09-23', 4],
                ]),
            },
            isLoading: false,
        })
    })
})
