import React, { PropsWithChildren } from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment-timezone'

import { UserRole } from 'config/types/user'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { GreyArea } from 'domains/reporting/hooks/automate/types'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomateMetricsTrend } from 'domains/reporting/hooks/automate/useAutomationDataset'
import { calculateGreyArea } from 'domains/reporting/hooks/automate/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import AiAgentStatsFilters from 'domains/reporting/pages/automate/ai-agent/AiAgentStatsFilters'
import AutomateAiAgentStatsReport from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentStatsReport'
import { getTimeSeriesFormattedData } from 'domains/reporting/pages/automate/overview/utils'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { TicketDistributionChart } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketDistributionTable'
import { TwoDimensionalDataItem } from 'domains/reporting/pages/types'
import { getSelectedCustomField } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { agents } from 'fixtures/agents'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import { getCurrentUser } from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'

jest.mock(
    'hooks/useAppSelector',
    () =>
        (fn: () => any): any =>
            fn(),
)

jest.mock('domains/reporting/state/stats/selectors')
jest.mock('state/currentUser/selectors')
const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('domains/reporting/state/ui/stats/ticketInsightsSlice')
const getSelectedCustomFieldMock =
    getSelectedCustomField as unknown as jest.Mock

jest.mock('domains/reporting/hooks/automate/useAutomationDataset')
const useAutomateMetricsTrendMock = useAutomateMetricsTrend as jest.Mock

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const useAutomateFiltersMock = assumeMock(useAutomateFilters)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/automate/utils')
const calculateGreyAreaMock = assumeMock(calculateGreyArea)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('domains/reporting/pages/automate/overview/utils')
const getTimeSeriesFormattedDataMock = assumeMock(getTimeSeriesFormattedData)

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock(
    'domains/reporting/pages/common/layout/StatsPage',
    () =>
        ({ children }: PropsWithChildren<any>) => (
            <>
                <div>stats-page</div>
                <>{children}</>
            </>
        ),
)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
    () => () => <div>filters-panel</div>,
)

jest.mock(
    'domains/reporting/pages/common/components/Table/EditTableColumns',
    () => ({
        EditTableColumns: () => <div>edit-table-columns</div>,
    }),
)

jest.mock('domains/reporting/pages/automate/ai-agent/AiAgentTable', () => ({
    AiAgentTable: () => <div>ai-agent-table</div>,
}))

jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect',
    () => ({
        CustomFieldSelect: () => <div>custom-field-select</div>,
    }),
)

jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/TicketDistributionTable',
    () => ({
        TicketDistributionChart: jest.fn(() => (
            <div>ticket-distribution-table</div>
        )),
    }),
)
const TicketDistributionTableMock = TicketDistributionChart as jest.Mock

jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldTrend',
    () => ({
        TicketInsightsFieldTrend: () => <div>ticket-insights-field-trend</div>,
    }),
)

jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTableChart',
    () => ({
        CustomFieldsTicketCountBreakdownTableChart: () => (
            <div>custom-fields-ticket-count-breakdown-report</div>
        ),
    }),
)

jest.mock(
    'pages/automate/automate-metrics/AutomatedInteractionsMetric',
    () => ({
        AutomatedInteractionsMetric: jest.fn(() => (
            <div>automated-interactions-metric</div>
        )),
    }),
)
const AutomatedInteractionsMetricMock = assumeMock(AutomatedInteractionsMetric)

jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
)
const LineChartMock = assumeMock(LineChart)

jest.mock('domains/reporting/pages/common/AnalyticsFooter', () => ({
    AnalyticsFooter: () => <div>analytics-footer</div>,
}))

jest.mock('domains/reporting/pages/automate/ai-agent/AiAgentStatsFilters')
const AiAgentStatsFiltersMock = assumeMock(AiAgentStatsFilters)

describe('AutomateAiAgentStatsReport', () => {
    const renderComponent = ({
        statsFilters = {
            period: {
                start_datetime: '2024-09-14T00:00:00+00:00',
                end_datetime: '2024-09-20T23:59:59+00:00',
            },
        },
        automatedInteractionTrend = {
            isFetching: false,
            isError: false,
            data: {
                value: 360,
                prevValue: 140,
            },
        },
        customFields = [
            { label: 'AI Intent', managed_type: 'ai_intent' },
            { label: 'AI Agent Outcome', managed_type: 'ai_outcome' },
            { label: 'My custom field', managed_type: null },
        ],
        customFieldsIsLoading = false,
        aiAgentUserId = 5,
        automatedInteractionByEventTypesTimeSeriesData = [
            { label: 'AI Agent', values: [{ x: '5', y: 10 }] },
        ],
        greyArea = {
            from: moment(new Date('2024-09-17')),
            to: moment(new Date('2024-09-20')),
        },
    }: {
        statsFilters?: StatsFilters
        automatedInteractionTrend?: MetricTrend
        customFields?: Array<{
            label: string
            managed_type: string | null
        }>
        customFieldsIsLoading?: boolean
        aiAgentUserId?: number
        automatedInteractionByEventTypesTimeSeriesData?: TwoDimensionalDataItem[]
        greyArea?: GreyArea | null
    } = {}) => {
        getCurrentUserMock.mockReturnValue(
            fromJS({
                ...agents[0],
                role: { name: UserRole.Admin },
            }),
        )
        useAIAgentUserIdMock.mockReturnValue(
            aiAgentUserId === null ? undefined : aiAgentUserId,
        )

        AiAgentStatsFiltersMock.mockImplementation(({ children }: any) => (
            <>{children}</>
        ))
        LineChartMock.mockImplementation(() => <div>line-chart</div>)

        calculateGreyAreaMock.mockReturnValue(greyArea)

        useAutomateFiltersMock.mockReturnValue({
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
            statsFilters,
        })
        useStatsFiltersMock.mockReturnValue({
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
            cleanStatsFilters: statsFilters,
        })
        getSelectedCustomFieldMock.mockReturnValue({
            id: '1',
            label: 'AI Agent Contact Reason',
        })

        useAutomateMetricsTrendMock.mockReturnValue({
            automatedInteractionTrend,
        })

        const customFieldResponse = customFieldsIsLoading
            ? { isLoading: true }
            : {
                  data: { data: customFields },
              }
        useCustomFieldDefinitionsMock.mockReturnValue(
            customFieldResponse as ReturnType<typeof useCustomFieldDefinitions>,
        )

        getTimeSeriesFormattedDataMock.mockReturnValue({
            automatedInteractionTimeSeriesData: [],
            automationRateTimeSeriesData: [],
            automatedInteractionByEventTypesTimeSeriesData,
            exportableData: {
                automationRateTimeSeries: [],
                automatedInteractionTimeSeries: [],
                automatedInteractionByEventTypesTimeSeries: [],
            },
        })

        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })

        return render(<AutomateAiAgentStatsReport />)
    }

    it('should correctly render AI Agent related stats', () => {
        renderComponent({ aiAgentUserId: 123 })

        expect(screen.queryByText('stats-page')).toBeInTheDocument()
        expect(screen.queryByText('filters-panel')).toBeInTheDocument()

        expect(screen.queryByText('edit-table-columns')).toBeInTheDocument()
        expect(screen.queryByText('ai-agent-table')).toBeInTheDocument()

        expect(screen.queryByText('custom-field-select')).toBeInTheDocument()
        expect(
            screen.queryByText('ticket-distribution-table'),
        ).toBeInTheDocument()
        expect(TicketDistributionTableMock).toHaveBeenCalled()
        expect(
            screen.queryByText('ticket-insights-field-trend'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('custom-fields-ticket-count-breakdown-report'),
        ).toBeInTheDocument()

        expect(
            screen.queryByText('automated-interactions-metric'),
        ).toBeInTheDocument()
        expect(AutomatedInteractionsMetricMock).toHaveBeenCalledWith(
            {
                trend: {
                    isFetching: false,
                    isError: false,
                    data: {
                        value: 360,
                        prevValue: 140,
                    },
                },
            },
            {},
        )

        expect(screen.queryByText('line-chart')).toBeInTheDocument()
        expect(LineChartMock).toHaveBeenCalledWith(
            {
                isCurvedLine: false,
                yAxisBeginAtZero: true,
                data: [{ label: 'AI Agent', values: [{ x: '5', y: 10 }] }],
                _displayLegacyTooltip: true,
                greyArea: {
                    start: 'Sep 17th, 2024',
                    end: 'Sep 20th, 2024',
                },
            },
            {},
        )
    })

    it('should not show the ticket insights if there are no AI Agent custom fields', () => {
        renderComponent({
            customFields: [
                { label: 'My custom field', managed_type: null },
                { label: 'Another custom field', managed_type: null },
            ],
        })

        expect(
            screen.queryByText('custom-field-select'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('ticket-distribution-table'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('ticket-insights-field-trend'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('custom-fields-ticket-count-breakdown-report'),
        ).not.toBeInTheDocument()
    })

    it('should not show the ticket insights when custom fields are still loading', () => {
        renderComponent({
            customFieldsIsLoading: true,
        })

        expect(
            screen.queryByText('ticket-insights-field-trend'),
        ).not.toBeInTheDocument()
    })

    it('should show an alert if there is not activity in a certain period', () => {
        renderComponent({
            aiAgentUserId: 123,
            automatedInteractionTrend: {
                isFetching: false,
                isError: false,
                data: {
                    value: 0,
                    prevValue: 140,
                },
            },
        })

        expect(
            screen.queryByText(
                'There is no activity during the selected time period. AI Agent may have been disabled or not set up during this time.',
            ),
        ).toBeInTheDocument()

        userEvent.click(screen.getByLabelText('Close Icon'))

        expect(
            screen.queryByText(
                'There is no activity during the selected time period. AI Agent may have been disabled or not set up during this time.',
            ),
        ).not.toBeInTheDocument()
    })

    it('should show an alert if no data returned', () => {
        renderComponent({
            aiAgentUserId: 123,
            automatedInteractionTrend: {
                isFetching: false,
                isError: false,
                data: undefined,
            },
        })

        expect(
            screen.queryByText(
                'There is no activity during the selected time period. AI Agent may have been disabled or not set up during this time.',
            ),
        ).toBeInTheDocument()

        userEvent.click(screen.getByLabelText('Close Icon'))

        expect(
            screen.queryByText(
                'There is no activity during the selected time period. AI Agent may have been disabled or not set up during this time.',
            ),
        ).not.toBeInTheDocument()
    })

    it('should not show the automated interactions over time chart if there is no data', () => {
        renderComponent({
            automatedInteractionTrend: {
                isFetching: false,
                isError: false,
                data: { value: 0, prevValue: 0 },
            },
            automatedInteractionByEventTypesTimeSeriesData: [],
        })

        const lineChart = screen.queryByText('line-chart')

        expect(lineChart).not.toBeInTheDocument()
    })

    it('should render the chart without grey area when calculateGreyArea returns undefined', () => {
        renderComponent({
            aiAgentUserId: 123,
            greyArea: null,
            automatedInteractionByEventTypesTimeSeriesData: [
                { label: 'AI Agent', values: [{ x: '5', y: 10 }] },
            ],
        })

        expect(screen.queryByText('line-chart')).toBeInTheDocument()
        expect(LineChartMock).toHaveBeenCalledWith(
            {
                isCurvedLine: false,
                yAxisBeginAtZero: true,
                data: [{ label: 'AI Agent', values: [{ x: '5', y: 10 }] }],
                _displayLegacyTooltip: true,
                greyArea: undefined,
            },
            {},
        )
    })
})
