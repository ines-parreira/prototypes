import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import { OrderDirection } from '@gorgias/api-queries'

import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { agents } from 'fixtures/agents'
import { AutomateStatsMeasureLabelMap } from 'hooks/reporting/automate/automateStatsMeasureLabelMap'
import {
    AI_AGENT_AUTOMATED_TICKETS_FILENAME,
    AI_AGENT_PERFORMANCE_FILENAME,
    AI_AGENT_REPORT_FILE_NAME,
    AI_AGENT_TICKET_INSIGHTS_FILENAME,
    useAgentPerformanceMetrics,
    useAIAgentReportMetrics,
    useAutomatedTicketsMetrics,
    useTicketInsightsMetrics,
} from 'hooks/reporting/automate/useAIAgentReportMetrics'
import { useAutomateMetricsTimeSeries } from 'hooks/reporting/automate/useAutomationDataset'
import { calculateGreyArea } from 'hooks/reporting/automate/utils'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { useAgentsMetrics } from 'hooks/reporting/support-performance/agents/useAgentsMetrics'
import { useAgentsSummaryMetrics } from 'hooks/reporting/support-performance/agents/useAgentsSummaryMetrics'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useCustomFieldsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import { getPeriodDateTimes } from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { AutomationBillingEventMeasure } from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import { getTimeSeriesFormattedData } from 'pages/stats/automate/overview/utils'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { getData as getPerformanceData } from 'services/reporting/agentsPerformanceReportingService'
import { formatData as getTicketInsightsData } from 'services/reporting/ticketFieldsReportingService'
import { AgentsTableColumn } from 'state/ui/stats/types'
import { createCsv } from 'utils/file'
import { assumeMock } from 'utils/testing'

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
jest.mock('hooks/reporting/support-performance/agents/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)

jest.mock('hooks/reporting/support-performance/agents/useAgentsSummaryMetrics')
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)

jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)

// useAutomatedTicketsMetrics
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('hooks/reporting/automate/useAutomationDataset')
const useAutomateMetricsTimeSeriesMock = assumeMock(
    useAutomateMetricsTimeSeries,
)

jest.mock('hooks/reporting/automate/utils')
const calculateGreyAreaMock = assumeMock(calculateGreyArea)

jest.mock('pages/stats/automate/overview/utils')
const useTimeSeriesFormattedDataMock = assumeMock(getTimeSeriesFormattedData)

// useTicketInsightsMetrics
jest.mock('hooks/reporting/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries,
)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('hooks/reporting/useTimeSeries')
const getPeriodDateTimesMock = assumeMock(getPeriodDateTimes)

jest.mock('services/reporting/agentsPerformanceReportingService')
const getPerformanceDataMock = assumeMock(getPerformanceData)

jest.mock('services/reporting/ticketFieldsReportingService', () => ({
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
            summaryData: { 'agents-summary-metrics': [] },
        } as unknown as ReturnType<typeof useAgentsSummaryMetrics>)

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
                summary: { 'agents-summary-metrics': [] },
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
    beforeEach(() => {
        useAppSelectorMock
            .mockReturnValueOnce({
                id: '1',
                label: 'AI Intent',
            })
            .mockReturnValueOnce({
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

        const data = renderHook(() => useTicketInsightsMetrics())

        expect(data.result.current).toEqual({
            ticketInsightsData: undefined,
            ticketInsightsDataIsLoading: false,
        })
    })

    it('should return automated tickets data', () => {
        useCustomFieldDefinitionsMock.mockReturnValueOnce({
            data: { data: aiAgentCustomFields },
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const data = renderHook(() => useTicketInsightsMetrics())

        expect(data.result.current).toEqual({
            ticketInsights: ticketInsights,
            ticketInsightsDataIsLoading: false,
        })
    })
})

const period = {
    start_datetime: '2024-09-14T00:00:00+00:00',
    end_datetime: '2024-09-20T23:59:59+00:00',
}

describe('useAIAgentReportMetrics', () => {
    beforeEach(() => {
        // useAgentPerformanceMetrics
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
        } as unknown as ReturnType<typeof useAgentsSummaryMetrics>)

        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: [AgentsTableColumn.AgentName],
        } as unknown as ReturnType<typeof useAgentsTableConfigSetting>)

        // useAutomatedTicketsMetrics
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

        // useTicketInsightsMetrics
        useAppSelectorMock
            .mockReturnValueOnce({
                id: '1',
                label: 'AI Intent',
            })
            .mockReturnValueOnce({
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

        const data = renderHook(() => useAIAgentReportMetrics())

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

        const data = renderHook(() => useAIAgentReportMetrics())

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
