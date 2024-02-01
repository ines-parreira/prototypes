import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {NO_DATA_TOOLTIP_ICON} from 'pages/stats/support-performance/components/NoDataTooltip'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {OverviewMetricConfig} from 'pages/stats/SupportPerformanceOverviewConfig'
import {TrendCard} from 'pages/stats/support-performance/components/TrendCard'
import TrendBadge from 'pages/stats/TrendBadge'
import {TicketChannel} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {OverviewMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {useOneTouchTicketsPercentageMetric} from 'hooks/reporting/useOneTouchTicketsPercentageMetric'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))

jest.mock('pages/stats/TrendBadge')
const trendBadgeMock = assumeMock(TrendBadge)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('hooks/reporting/metricTrends')
jest.mock('hooks/reporting/useOneTouchTicketsPercentageMetric')

const useCustomerSatisfactionTrendMock = assumeMock(
    useCustomerSatisfactionTrend
)
const useMedianFirstResponseTimeTrendMock = assumeMock(
    useMedianFirstResponseTimeTrend
)
const useMedianResolutionTimeTrendMock = assumeMock(
    useMedianResolutionTimeTrend
)
const useMessagesPerTicketTrendMock = assumeMock(useMessagesPerTicketTrend)
const useOpenTicketsTrendMock = assumeMock(useOpenTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(useClosedTicketsTrend)
const useTicketsCreatedTrendMock = assumeMock(useTicketsCreatedTrend)
const useTicketsRepliedTrendMock = assumeMock(useTicketsRepliedTrend)
const useMessagesSentTrendMock = assumeMock(useMessagesSentTrend)
const useOneTouchTicketTrendMock = assumeMock(
    useOneTouchTicketsPercentageMetric
)

describe('<TrendCard />', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
        integrations: [integrationsState.integrations[0].id],
        agents: [agents[0].id],
        tags: [1],
    }

    const defaultState = {
        stats: fromJS({
            filters: defaultStatsFilters,
        }),
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState
    const value = 456
    const prevValue = 123

    const defaultMetricTrend: MetricTrend = {
        isFetching: false,
        isError: true,
        data: {
            value,
            prevValue,
        },
    }

    const customerSatisfactionMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'more-is-better',
            value,
            prevValue,
        },
    }
    const medianFirstResponseTimeMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value,
            prevValue,
        },
    }
    const medianResolutionTimeMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value,
            prevValue,
        },
    }
    const messagesPerTicketMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value,
            prevValue,
        },
    }
    const openTicketsMetricTrend = {
        ...defaultMetricTrend,
    }
    const closedTicketsMetricTrend = {
        ...defaultMetricTrend,
    }
    const createdTicketsMetricTrend = {
        ...defaultMetricTrend,
    }
    const repliedTicketsMetricTrend = {
        ...defaultMetricTrend,
    }
    const messagesSentMetricTrend = {
        ...defaultMetricTrend,
    }
    const oneTouchTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'more-is-better',
            value,
            prevValue,
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        useCustomerSatisfactionTrendMock.mockReturnValue(
            customerSatisfactionMetricTrend
        )
        useMedianFirstResponseTimeTrendMock.mockReturnValue(
            medianFirstResponseTimeMetricTrend
        )
        useMedianResolutionTimeTrendMock.mockReturnValue(
            medianResolutionTimeMetricTrend
        )
        useMessagesPerTicketTrendMock.mockReturnValue(
            messagesPerTicketMetricTrend
        )
        useOpenTicketsTrendMock.mockReturnValue(openTicketsMetricTrend)
        useClosedTicketsTrendMock.mockReturnValue(closedTicketsMetricTrend)
        useTicketsCreatedTrendMock.mockReturnValue(createdTicketsMetricTrend)
        useTicketsRepliedTrendMock.mockReturnValue(repliedTicketsMetricTrend)
        useMessagesSentTrendMock.mockReturnValue(messagesSentMetricTrend)
        useOneTouchTicketTrendMock.mockReturnValue(oneTouchTicketsMetricTrend)

        trendBadgeMock.mockImplementation(() => null)
    })

    it.each(Object.values(OverviewMetric))(
        'should render customer experience section with a badge tooltip #$# %#',
        (overviewMetric) => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <TrendCard
                        {...OverviewMetricConfig[overviewMetric]}
                        overviewMetric={overviewMetric}
                    />
                </Provider>
            )

            expect(trendBadgeMock.mock.calls).toContainEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        interpretAs:
                            OverviewMetricConfig[overviewMetric].interpretAs,
                        tooltip: 'Compared to: Feb 2nd, 2021 - Feb 2nd, 2021',
                        value: defaultMetricTrend?.data?.value,
                    }),
                ])
            )
        }
    )

    it('should render NoDataTooltip if no data available', () => {
        const metric = OverviewMetric.CustomerSatisfaction
        useCustomerSatisfactionTrendMock.mockReturnValue({
            data: {value: null, prevValue: null},
            isFetching: false,
            isError: false,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <TrendCard
                    {...OverviewMetricConfig[metric]}
                    overviewMetric={metric}
                />
            </Provider>
        )

        expect(screen.getByText(NO_DATA_TOOLTIP_ICON)).toBeInTheDocument()
    })
})
