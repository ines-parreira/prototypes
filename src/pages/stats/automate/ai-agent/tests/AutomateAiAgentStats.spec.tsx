import React, {PropsWithChildren} from 'react'
import {render, screen} from '@testing-library/react'
import moment from 'moment-timezone'
import userEvent from '@testing-library/user-event'
import {StatsFiltersWithLogicalOperator} from 'models/stat/types'
import {useAutomateMetricsTrendV2} from 'hooks/reporting/automate/useAutomationDatasetV2'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'
import {useTimeSeriesFormattedData} from 'pages/stats/AutomateOverviewContent'
import {AutomatedInteractionsMetric} from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {calculateGreyArea} from 'hooks/reporting/automate/utils'
import {TicketDistributionTable} from 'pages/stats/TicketDistributionTable'
import AutomateAiAgentStats from '../AutomateAiAgentStats'

jest.mock(
    'hooks/useAppSelector',
    () =>
        (fn: () => any): any =>
            fn()
)

jest.mock('state/stats/selectors')
const getStatsFiltersWithLogicalOperatorsMock =
    getStatsFiltersWithLogicalOperators as unknown as jest.Mock

jest.mock('state/ui/stats/ticketInsightsSlice')
const getSelectedCustomFieldMock =
    getSelectedCustomField as unknown as jest.Mock

jest.mock('hooks/reporting/automate/useAutomationDatasetV2')
const useAutomateMetricsTrendV2Mock = useAutomateMetricsTrendV2 as jest.Mock

jest.mock('hooks/reporting/automate/useNewAutomateFilters', () => ({
    useNewAutomateFilters: () => ({
        userTimezone: 'UTC',
        granularity: 'day',
    }),
}))

jest.mock('hooks/reporting/automate/utils')
const calculateGreyAreaMock = calculateGreyArea as jest.Mock

jest.mock('hooks/customField/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = useCustomFieldDefinitions as jest.Mock

jest.mock('pages/stats/AutomateOverviewContent')
const useTimeSeriesFormattedDataMock =
    useTimeSeriesFormattedData as unknown as jest.Mock

jest.mock(
    'pages/stats/StatsPage',
    () =>
        ({children}: PropsWithChildren<any>) =>
            (
                <>
                    <div>stats-page</div>
                    <>{children}</>
                </>
            )
)

jest.mock('pages/stats/common/filters/FiltersPanel', () => ({
    FiltersPanel: () => <div>filters-panel</div>,
}))

jest.mock(
    'pages/stats/support-performance/agents/AgentsShoutouts',
    () => () => <div>agents-shoutouts</div>
)

jest.mock(
    'pages/stats/support-performance/agents/AgentsPerformanceCardExtra',
    () => ({
        AgentsPerformanceCardExtra: () => (
            <div>agents-performance-card-extra</div>
        ),
    })
)

jest.mock('pages/stats/support-performance/agents/AgentsTable', () => ({
    AgentsTable: () => <div>agents-table</div>,
}))

jest.mock('pages/stats/CustomFieldSelect', () => ({
    CustomFieldSelect: () => <div>custom-field-select</div>,
}))

jest.mock('pages/stats/TicketDistributionTable', () => ({
    TicketDistributionTable: jest.fn(() => (
        <div>ticket-distribution-table</div>
    )),
}))
const TicketDistributionTableMock = TicketDistributionTable as jest.Mock

jest.mock('pages/stats/TicketInsightsFieldTrend', () => ({
    TicketInsightsFieldTrend: () => <div>ticket-insights-field-trend</div>,
}))

jest.mock('pages/stats/CustomFieldsTicketCountBreakdownReport', () => ({
    CustomFieldsTicketCountBreakdownReport: () => (
        <div>custom-fields-ticket-count-breakdown-report</div>
    ),
}))

jest.mock(
    'pages/automate/automate-metrics/AutomatedInteractionsMetric',
    () => ({
        AutomatedInteractionsMetric: jest.fn(() => (
            <div>automated-interactions-metric</div>
        )),
    })
)
const AutomatedInteractionsMetricMock = AutomatedInteractionsMetric as jest.Mock

jest.mock('pages/stats/common/components/charts/LineChart/LineChart', () =>
    jest.fn(() => <div>line-chart</div>)
)
const LineChartMock = LineChart as jest.Mock

jest.mock('pages/stats/AnalyticsFooter', () => ({
    AnalyticsFooter: () => <div>analytics-footer</div>,
}))

describe('AutomateAiAgentStats', () => {
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
        customFieldLabels = [
            'AI Agent Contact Reason',
            'AI Agent Outcome',
            'My custom field',
        ],
        customFieldLabelsIsLoading = false,
    }: {
        statsFilters?: StatsFiltersWithLogicalOperator
        automatedInteractionTrend?: MetricTrend
        customFieldLabels?: string[]
        customFieldLabelsIsLoading?: boolean
    } = {}) => {
        calculateGreyAreaMock.mockReturnValue({
            from: moment(new Date('2024-09-17')),
            to: moment(new Date('2024-09-20')),
        })

        getStatsFiltersWithLogicalOperatorsMock.mockReturnValue(statsFilters)

        getSelectedCustomFieldMock.mockReturnValue({
            id: '1',
            label: 'AI Agent Contact Reason',
        })

        useAutomateMetricsTrendV2Mock.mockReturnValue({
            automatedInteractionTrend,
        })

        useCustomFieldDefinitionsMock.mockReturnValue(
            customFieldLabelsIsLoading
                ? {isLoading: true}
                : {
                      data: {data: customFieldLabels.map((x) => ({label: x}))},
                  }
        )

        useTimeSeriesFormattedDataMock.mockReturnValue({
            automatedInteractionByEventTypesTimeSeriesData: [
                {label: 'AI Agent', values: {x: 5, y: 10}},
            ],
            exportableData: {},
        })

        return render(<AutomateAiAgentStats />)
    }

    it('should correctly render AI Agent related stats', () => {
        renderComponent()

        expect(screen.queryByText('stats-page')).toBeInTheDocument()
        expect(screen.queryByText('filters-panel')).toBeInTheDocument()

        expect(screen.queryByText('agents-shoutouts')).toBeInTheDocument()
        expect(
            screen.queryByText('agents-performance-card-extra')
        ).toBeInTheDocument()
        expect(screen.queryByText('agents-table')).toBeInTheDocument()

        expect(screen.queryByText('custom-field-select')).toBeInTheDocument()
        expect(
            screen.queryByText('ticket-distribution-table')
        ).toBeInTheDocument()
        expect(TicketDistributionTableMock).toBeCalledWith(
            {
                selectedCustomField: {
                    id: '1',
                    label: 'AI Agent Contact Reason',
                },
            },
            {}
        )
        expect(
            screen.queryByText('ticket-insights-field-trend')
        ).toBeInTheDocument()
        expect(
            screen.queryByText('custom-fields-ticket-count-breakdown-report')
        ).toBeInTheDocument()

        expect(
            screen.queryByText('automated-interactions-metric')
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
            {}
        )

        expect(screen.queryByText('line-chart')).toBeInTheDocument()
        expect(LineChartMock).toHaveBeenCalledWith(
            {
                isCurvedLine: false,
                yAxisBeginAtZero: true,
                data: [{label: 'AI Agent', values: {x: 5, y: 10}}],
                _displayLegacyTooltip: true,
                greyArea: {
                    start: 'Sep 17th, 2024',
                    end: 'Sep 20th, 2024',
                },
            },
            {}
        )
    })

    it('should not show the ticket insights if there are no AI Agent custom fields', () => {
        renderComponent({
            customFieldLabels: ['My custom field', 'Another custom field'],
        })

        expect(
            screen.queryByText('custom-field-select')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('ticket-distribution-table')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('ticket-insights-field-trend')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('custom-fields-ticket-count-breakdown-report')
        ).not.toBeInTheDocument()
    })

    it('should not show the ticket insights when custom fields are still loading', () => {
        renderComponent({
            customFieldLabelsIsLoading: true,
        })

        expect(
            screen.queryByText('ticket-insights-field-trend')
        ).not.toBeInTheDocument()
    })

    it('should show an alert if there is not activity in a certain period', () => {
        renderComponent({
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
                'There is no activity during the selected time period. AI Agent may have been disabled or not set up during this time.'
            )
        ).toBeInTheDocument()

        userEvent.click(screen.getByLabelText('Close Icon'))

        expect(
            screen.queryByText(
                'There is no activity during the selected time period. AI Agent may have been disabled or not set up during this time.'
            )
        ).not.toBeInTheDocument()
    })
})
