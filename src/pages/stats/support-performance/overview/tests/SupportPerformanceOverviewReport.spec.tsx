import React, { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { FilterKey } from 'models/stat/types'
import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { OverviewChartCard } from 'pages/stats/support-performance/components/OverviewChartCard'
import { MedianResponseTimeTrendCard } from 'pages/stats/support-performance/overview/charts/MedianResponseTimeTrendCard'
import { MessagesReceivedTrendCard } from 'pages/stats/support-performance/overview/charts/MessagesReceivedTrendCard'
import { TicketsCreatedVsClosedChart } from 'pages/stats/support-performance/overview/charts/TicketsCreatedVsClosedChart'
import { WorkloadPerChannelChart } from 'pages/stats/support-performance/overview/charts/WorkloadPerChannelChart'
import { ZeroTouchTicketsTrendCard } from 'pages/stats/support-performance/overview/charts/ZeroTouchTicketsTrendCard'
import {
    OverviewMetric,
    PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import SupportPerformanceOverviewReport from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReport'
import { SupportPerformanceTip } from 'pages/stats/SupportPerformanceTip'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const TIP_PLACEHOLDER = 'Tip:'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))
jest.mock(
    'pages/stats/support-performance/overview/DownloadOverviewData.tsx',
    () => ({
        DownloadOverviewData: () => null,
    }),
)

jest.mock('pages/stats/common/components/TrendCard')
const trendCardMock = assumeMock(TrendCard)

jest.mock('pages/stats/SupportPerformanceTip')
const supportPerformanceTipMock = assumeMock(SupportPerformanceTip)

jest.mock('pages/stats/support-performance/components/OverviewChartCard')
const overviewChartCardMock = assumeMock(OverviewChartCard)

jest.mock(
    'pages/stats/support-performance/overview/charts/TicketsCreatedVsClosedChart.tsx',
)
const ticketsCreatedVsClosedChartCardMock = assumeMock(
    TicketsCreatedVsClosedChart,
)

jest.mock(
    'pages/stats/support-performance/overview/charts/WorkloadPerChannelChart',
)
const workloadPerChannelChartMock = assumeMock(WorkloadPerChannelChart)
jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)

jest.mock(
    'pages/stats/support-performance/overview/charts/ZeroTouchTicketsTrendCard',
)
const ZeroTouchTicketsTrendCardMock = assumeMock(ZeroTouchTicketsTrendCard)
jest.mock(
    'pages/stats/support-performance/overview/charts/MessagesReceivedTrendCard',
)
const MessagesReceivedTrendCardMock = assumeMock(MessagesReceivedTrendCard)
jest.mock(
    'pages/stats/support-performance/overview/charts/MedianResponseTimeTrendCard',
)
const MedianResponseTimeTrendCardMock = assumeMock(MedianResponseTimeTrendCard)

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

const defaultState = {
    billing: fromJS(billingState),
}

describe('<SupportPerformanceOverview />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })
        trendCardMock.mockImplementation(({ tip }) => (
            <div>TrendCardMock {tip}</div>
        ))
        overviewChartCardMock.mockImplementation(() => (
            <div>OverviewChartCardMock</div>
        ))
        supportPerformanceTipMock.mockImplementation(() => (
            <div>{TIP_PLACEHOLDER}</div>
        ))
        ticketsCreatedVsClosedChartCardMock.mockImplementation(() => (
            <div>TicketsCreatedVsClosedChartCardMock</div>
        ))
        workloadPerChannelChartMock.mockImplementation(() => (
            <div>workloadPerChannelChartMock</div>
        ))
        ZeroTouchTicketsTrendCardMock.mockImplementation(() => <div />)
        MessagesReceivedTrendCardMock.mockImplementation(() => <div />)
        MedianResponseTimeTrendCardMock.mockImplementation(() => <div />)
        mockFlags({
            [FeatureFlagKey.ReportingAgentsTableAverageAndTotal]: true,
        })
    })

    it.each([
        OverviewMetric.CustomerSatisfaction,
        OverviewMetric.MedianFirstResponseTime,
        OverviewMetric.MedianResolutionTime,
        OverviewMetric.MessagesPerTicket,
    ])(
        'should render customer experience section with TrendCards %#',
        (customerMetricTrend) => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverviewReport />
                </Provider>,
            )

            expect(trendCardMock.mock.calls).toContainEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        drillDownMetric: customerMetricTrend,
                    }),
                ]),
            )
        },
    )

    it('should render productivity section with OneTouchTickets TrendCard', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceOverviewReport />
            </Provider>,
        )
        expect(trendCardMock.mock.calls).toContainEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    drillDownMetric: OverviewMetric.OneTouchTickets,
                }),
            ]),
        )
    })

    it('should render ZeroTouchTicketsTrendCard TrendCard', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceOverviewReport />
            </Provider>,
        )

        expect(ZeroTouchTicketsTrendCardMock).toHaveBeenCalled()
    })

    it('should render MedianResponseTimeTrendCard TrendCard', () => {
        mockFlags({
            [FeatureFlagKey.ReportingAverageResponseTime]: true,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceOverviewReport />
            </Provider>,
        )

        expect(MedianResponseTimeTrendCardMock).toHaveBeenCalled()
    })

    it('should render Messages Received TrendCard', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceOverviewReport />
            </Provider>,
        )

        expect(MessagesReceivedTrendCardMock).toHaveBeenCalled()
    })

    describe('Performance Tips', () => {
        it('should show tips by default', () => {
            const { queryAllByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverviewReport />
                </Provider>,
            )

            expect(queryAllByText(/^Tip:/)).not.toHaveLength(0)
        })

        it('should show tips and save the value to local storage on show tips button click', () => {
            localStorage.setItem(STATS_TIPS_VISIBILITY_KEY, 'false')

            const { getByText, queryAllByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverviewReport />
                </Provider>,
            )

            fireEvent.click(getByText(/Show tips/))

            expect(queryAllByText(/^Tip:/)).not.toHaveLength(0)
            expect(localStorage.getItem(STATS_TIPS_VISIBILITY_KEY)).toBe('true')
        })

        it('should hide tips and save the value to local storage on hide tips button click ', () => {
            localStorage.setItem(STATS_TIPS_VISIBILITY_KEY, 'true')

            const { getByText, queryAllByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverviewReport />
                </Provider>,
            )

            fireEvent.click(getByText(/Hide tips/))

            expect(queryAllByText(/^Tip:/)).toHaveLength(0)
            expect(localStorage.getItem(STATS_TIPS_VISIBILITY_KEY)).toBe(
                'false',
            )
        })
    })

    describe('FiltersHeader', () => {
        it('should show Filters Panel and render expected filters', () => {
            const { getByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverviewReport />
                </Provider>,
            )

            PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS.forEach((filter) => {
                expect(getByText(filter)).toBeInTheDocument()
            })
            expect(useCleanStatsFiltersMock).toHaveBeenCalled()
        })

        it('should show Filters Panel and render expected filters with score filter', () => {
            const { getByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverviewReport />
                </Provider>,
            )
            const filtersWithScore = [
                ...PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
                FilterKey.Score,
            ]
            filtersWithScore.forEach((filter) => {
                expect(getByText(filter)).toBeInTheDocument()
            })
        })

        it('should show Filters Panel and render expected filters with resolution completeness and communication skills filters', () => {
            const state = {
                ...defaultState,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicYearlyHelpdeskPlan.price_id,
                            [AUTOMATION_PRODUCT_ID]:
                                basicYearlyAutomationPlan.price_id,
                        },
                        status: 'active',
                    },
                }),
            }
            const { getByText } = render(
                <Provider store={mockStore(state)}>
                    <SupportPerformanceOverviewReport />
                </Provider>,
            )
            const filtersWithResolutionCompletenessAndCommunicationSkills = [
                ...PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
                ...AUTO_QA_FILTER_KEYS,
            ]
            filtersWithResolutionCompletenessAndCommunicationSkills.forEach(
                (filter) => {
                    expect(getByText(filter)).toBeInTheDocument()
                },
            )
        })
    })
})
