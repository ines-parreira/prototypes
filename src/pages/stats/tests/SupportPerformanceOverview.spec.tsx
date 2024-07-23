import LD from 'launchdarkly-react-client-sdk'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, render} from '@testing-library/react'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {FeatureFlagKey} from 'config/featureFlags'
import {TicketsCreatedVsClosedChartCard} from 'pages/stats/support-performance/components/TicketsCreatedVsClosedChartCard'
import {OverviewChartCard} from 'pages/stats/support-performance/components/OverviewChartCard'
import {WorkloadPerChannelChart} from 'pages/stats/support-performance/components/WorkloadPerChannelChart'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'
import {TrendCard} from 'pages/stats/common/components/TrendCard'

import {RootState, StoreDispatch} from 'state/types'
import {OverviewMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'

import SupportPerformanceOverview, {
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/SupportPerformanceOverview'

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
jest.mock('pages/stats/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: () => <div />,
}))
jest.mock(
    'pages/stats/support-performance/components/DownloadOverviewData.tsx',
    () => ({
        DownloadOverviewData: () => null,
    })
)

jest.mock('pages/stats/common/components/TrendCard')
const trendCardMock = assumeMock(TrendCard)

jest.mock('pages/stats/SupportPerformanceTip')
const supportPerformanceTipMock = assumeMock(SupportPerformanceTip)

jest.mock('pages/stats/support-performance/components/OverviewChartCard')
const overviewChartCardMock = assumeMock(OverviewChartCard)

jest.mock(
    'pages/stats/support-performance/components/TicketsCreatedVsClosedChartCard.tsx'
)
const ticketsCreatedVsClosedChartCardMock = assumeMock(
    TicketsCreatedVsClosedChartCard
)

jest.mock('pages/stats/support-performance/components/WorkloadPerChannelChart')
const workloadPerChannelChartMock = assumeMock(WorkloadPerChannelChart)

jest.mock('pages/stats/common/filters/FiltersPanel')
const filtersPanelMock = assumeMock(FiltersPanel)

describe('<SupportPerformanceOverview />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        trendCardMock.mockImplementation(({tip}) => (
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
        filtersPanelMock.mockImplementation(() => <div>FiltersHeaderMock</div>)
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsNewFilters]: false,
        }))
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
                <Provider store={mockStore({})}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            expect(trendCardMock.mock.calls).toContainEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        drillDownMetric: customerMetricTrend,
                    }),
                ])
            )
        }
    )

    it('should render productivity section with OneTouchTickets TrendCard', () => {
        render(
            <Provider store={mockStore({})}>
                <SupportPerformanceOverview />
            </Provider>
        )
        expect(trendCardMock.mock.calls).toContainEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    drillDownMetric: OverviewMetric.OneTouchTickets,
                }),
            ])
        )
    })

    describe('Performance Tips', () => {
        it('should show tips by default', () => {
            const {queryAllByText} = render(
                <Provider store={mockStore({})}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            expect(queryAllByText(/^Tip:/)).not.toHaveLength(0)
        })

        it('should show tips and save the value to local storage on show tips button click', () => {
            localStorage.setItem(STATS_TIPS_VISIBILITY_KEY, 'false')

            const {getByText, queryAllByText} = render(
                <Provider store={mockStore({})}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            fireEvent.click(getByText(/Show tips/))

            expect(queryAllByText(/^Tip:/)).not.toHaveLength(0)
            expect(localStorage.getItem(STATS_TIPS_VISIBILITY_KEY)).toBe('true')
        })

        it('should hide tips and save the value to local storage on hide tips button click ', () => {
            localStorage.setItem(STATS_TIPS_VISIBILITY_KEY, 'true')

            const {getByText, queryAllByText} = render(
                <Provider store={mockStore({})}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            fireEvent.click(getByText(/Hide tips/))

            expect(queryAllByText(/^Tip:/)).toHaveLength(0)
            expect(localStorage.getItem(STATS_TIPS_VISIBILITY_KEY)).toBe(
                'false'
            )
        })
    })

    describe('FiltersHeader', () => {
        beforeEach(() => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AnalyticsNewFilters]: true,
            }))
        })

        it('should show New Filters Panel', () => {
            render(
                <Provider store={mockStore({})}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            expect(filtersPanelMock).toHaveBeenCalled()
        })
    })
})
