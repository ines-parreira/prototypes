import React from 'react'

import { act, fireEvent, render } from '@testing-library/react'
import moment from 'moment'

import { logEvent, SegmentEvent } from 'common/segment'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { agents } from 'fixtures/agents'
import { AutomateStatsMeasureLabelMap } from 'hooks/reporting/automate/automateStatsMeasureLabelMap'
import { useAutomateMetricsTimeSeries } from 'hooks/reporting/automate/useAutomationDataset'
import { calculateGreyArea } from 'hooks/reporting/automate/utils'
import { useAgentsMetrics } from 'hooks/reporting/support-performance/agents/useAgentsMetrics'
import { useAgentsSummaryMetrics } from 'hooks/reporting/support-performance/agents/useAgentsSummaryMetrics'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { useCustomFieldsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import { getPeriodDateTimes } from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { AutomationBillingEventMeasure } from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import { isAiAgentCustomField } from 'pages/aiAgent/util'
import { getTimeSeriesFormattedData } from 'pages/stats/automate/overview/utils'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { formatDates } from 'pages/stats/utils'
import { saveReport } from 'services/reporting/automateAiAgentReportingService'
import { AgentsTableColumn } from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'

import { AiAgentStatsDownloadButton } from '../AiAgentStatsDownloadButton'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('hooks/reporting/support-performance/agents/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)

jest.mock('hooks/reporting/support-performance/agents/useAgentsSummaryMetrics')
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)

jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('hooks/reporting/automate/useAutomationDataset')
const useAutomateMetricsTimeSeriesMock = assumeMock(
    useAutomateMetricsTimeSeries,
)

jest.mock('hooks/reporting/automate/utils')
const calculateGreyAreaMock = assumeMock(calculateGreyArea)

jest.mock('pages/stats/automate/overview/utils')
const useTimeSeriesFormattedDataMock = assumeMock(getTimeSeriesFormattedData)

jest.mock('hooks/reporting/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries,
)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('pages/aiAgent/util')
const isAiAgentCustomFieldMock = assumeMock(isAiAgentCustomField)

jest.mock('hooks/reporting/useTimeSeries')
const getPeriodDateTimesMock = assumeMock(getPeriodDateTimes)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock('services/reporting/automateAiAgentReportingService')
const saveReportMock = assumeMock(saveReport)

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

describe('AiAgentStatsDownloadButton', () => {
    const renderComponent = ({
        agentsMetricsIsLoading = false,
        agentsSummaryMetricsIsLoading = false,
        timeseriesIsFetching = false,
        customFieldsIsLoading = false,
        customFieldLabels = [
            'AI Intent',
            'AI Agent Outcome',
            'My custom field',
        ],
        hasAiAgentCustomField = true,
    }: {
        agentsMetricsIsLoading?: boolean
        agentsSummaryMetricsIsLoading?: boolean
        timeseriesIsFetching?: boolean
        customFieldsIsLoading?: boolean
        customFieldLabels?: string[]
        hasAiAgentCustomField?: boolean
    } = {}) => {
        // Mock stats filters
        useAppSelectorMock.mockReturnValueOnce(statsFiltersMock)

        // Mock agents
        useAppSelectorMock.mockReturnValueOnce(agents)

        // Mock performance data
        useAgentsMetricsMock.mockReturnValue({
            isLoading: agentsMetricsIsLoading,
            reportData: { 'agents-metrics': [] },
        } as unknown as ReturnType<typeof useAgentsMetrics>)

        useAgentsSummaryMetricsMock.mockReturnValue({
            isLoading: agentsSummaryMetricsIsLoading,
            summaryData: { 'agents-summary-metrics': [] },
        } as unknown as ReturnType<typeof useAgentsSummaryMetrics>)

        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: [AgentsTableColumn.AgentName],
        } as unknown as ReturnType<typeof useAgentsTableConfigSetting>)

        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-09-14T00:00:00+00:00',
                    end_datetime: '2024-09-20T23:59:59+00:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: false,
        })

        useAutomateMetricsTimeSeriesMock.mockReturnValue({
            isFetching: timeseriesIsFetching,
        } as unknown as ReturnType<typeof useAutomateMetricsTimeSeries>)

        calculateGreyAreaMock.mockReturnValue({
            from: moment(new Date('2024-09-17')),
            to: moment(new Date('2024-09-20')),
        })

        useTimeSeriesFormattedDataMock.mockReturnValue({
            exportableData: {
                automatedInteractionByEventTypesTimeSeries: timeSeriesMock,
            },
        } as unknown as ReturnType<typeof getTimeSeriesFormattedData>)

        // Mock ticket insights data
        useAppSelectorMock
            .mockReturnValueOnce({
                id: '1',
                label: 'AI Intent',
            })
            .mockReturnValueOnce({
                direction: 'asc',
                column: 'total',
            })

        isAiAgentCustomFieldMock.mockReturnValue(hasAiAgentCustomField)

        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            isLoading: customFieldsIsLoading,
            data: 'use-custom-fields-ticket-count-time-series',
        } as unknown as ReturnType<typeof useCustomFieldsTicketCountTimeSeries>)

        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: customFieldLabels.map((x) => ({ label: x })) },
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        getPeriodDateTimesMock.mockReturnValue(periodDateTimes)

        return render(<AiAgentStatsDownloadButton />)
    }

    it('should call the external functions with the correct properties on click', () => {
        const { getByText } = renderComponent()

        act(() => {
            fireEvent.click(getByText('Download data'))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            {
                name: 'all-metrics',
            },
        )

        expect(saveReportMock).toHaveBeenCalledWith(
            agents,
            statsFiltersMock.period,
            {
                data: { 'agents-metrics': [] },
                summary: { 'agents-summary-metrics': [] },
                columnsOrder: [AgentsTableColumn.AgentName],
            },
            {
                automateStatsMeasureLabelMap: AutomateStatsMeasureLabelMap,
                automatedInteractionByEventTypesTimeSeries: [timeSeriesMock[0]],
            },
            {
                data: 'use-custom-fields-ticket-count-time-series',
                dateTimes: periodDateTimes.map((x) =>
                    formatDates(ReportingGranularity.Day, x),
                ),
                order: 'asc',
            },
        )
    })

    it('should call the external functions without custom field data when hasAiAgentCustomField is false', () => {
        const { getByText } = renderComponent({ hasAiAgentCustomField: false })

        act(() => {
            fireEvent.click(getByText('Download data'))
        })

        expect(saveReportMock).toHaveBeenCalledWith(
            agents,
            statsFiltersMock.period,
            {
                data: { 'agents-metrics': [] },
                summary: { 'agents-summary-metrics': [] },
                columnsOrder: [AgentsTableColumn.AgentName],
            },
            {
                automateStatsMeasureLabelMap: AutomateStatsMeasureLabelMap,
                automatedInteractionByEventTypesTimeSeries: [timeSeriesMock[0]],
            },
            undefined,
        )
    })

    it.each([
        {
            agentsMetricsIsLoading: true,
            agentsSummaryMetricsIsLoading: false,
            timeseriesIsFetching: false,
            customFieldsIsLoading: false,
        },
        {
            agentsMetricsIsLoading: false,
            agentsSummaryMetricsIsLoading: true,
            timeseriesIsFetching: false,
            customFieldsIsLoading: false,
        },
        {
            agentsMetricsIsLoading: false,
            agentsSummaryMetricsIsLoading: false,
            timeseriesIsFetching: true,
            customFieldsIsLoading: false,
        },
        {
            agentsMetricsIsLoading: false,
            agentsSummaryMetricsIsLoading: false,
            timeseriesIsFetching: false,
            customFieldsIsLoading: true,
        },
    ])(
        'should not call the external functions when still loading',
        (loadingStates) => {
            const { getByText } = renderComponent(loadingStates)

            act(() => {
                fireEvent.click(getByText('Download data'))
            })

            expect(logEventMock).not.toHaveBeenCalled()
            expect(saveReportMock).not.toHaveBeenCalled()
        },
    )
})
