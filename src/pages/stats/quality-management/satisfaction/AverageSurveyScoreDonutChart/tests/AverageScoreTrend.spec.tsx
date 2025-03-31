import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMedianResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesReceivedTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useTicketHandleTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import { useAverageScoreTrend } from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import { useOneTouchTicketsPercentageMetricTrend } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { useZeroTouchTicketsMetricTrend } from 'hooks/reporting/support-performance/overview/useZeroTouchTicketsMetricTrend'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import TrendBadge, {
    DEFAULT_BADGE_TEXT,
} from 'pages/stats/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { AverageScoreTrend } from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageScoreTrend'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { getBadgeTooltipForPreviousPeriod } from 'pages/stats/utils'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('pages/stats/common/drill-down/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))

jest.mock('pages/stats/common/components/TrendBadge')
const trendBadgeMock = assumeMock(TrendBadge)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('hooks/reporting/metricTrends')
jest.mock(
    'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend',
)
jest.mock(
    'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend',
)
jest.mock(
    'hooks/reporting/support-performance/overview/useZeroTouchTicketsMetricTrend',
)

const useCustomerSatisfactionTrendMock = assumeMock(
    useCustomerSatisfactionTrend,
)
const useMedianFirstResponseTimeTrendMock = assumeMock(
    useMedianFirstResponseTimeTrend,
)
const useMedianResolutionTimeTrendMock = assumeMock(
    useMedianResolutionTimeTrend,
)
const useMessagesPerTicketTrendMock = assumeMock(useMessagesPerTicketTrend)
const useOpenTicketsTrendMock = assumeMock(useOpenTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(useClosedTicketsTrend)
const useTicketsCreatedTrendMock = assumeMock(useTicketsCreatedTrend)
const useTicketsRepliedTrendMock = assumeMock(useTicketsRepliedTrend)
const useMessagesSentTrendMock = assumeMock(useMessagesSentTrend)
const useMessagesReceivedTrendMock = assumeMock(useMessagesReceivedTrend)
const useTicketHandleTimeTrendMock = assumeMock(useTicketHandleTimeTrend)
const useOneTouchTicketTrendMock = assumeMock(
    useOneTouchTicketsPercentageMetricTrend,
)
const useZeroTouchTicketTrendMock = assumeMock(useZeroTouchTicketsMetricTrend)
const useMedianResponseTimeTrendMock = assumeMock(useMedianResponseTimeTrend)
const useAverageScoreTrendMock = assumeMock(useAverageScoreTrend)
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

describe('<AverageScoreTrend />', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: withDefaultLogicalOperator([TicketChannel.Chat]),
        integrations: withDefaultLogicalOperator([
            integrationsState.integrations[0].id,
        ]),
        agents: withDefaultLogicalOperator([agents[0].id]),
        tags: [
            {
                ...withDefaultLogicalOperator([1]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }

    const defaultState = {
        stats: {
            filters: defaultStatsFilters,
        },
        ui: {
            stats: { filters: uiStatsInitialState },
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
    const messagesReceivedMetricTrend = {
        ...defaultMetricTrend,
    }
    const useMedianResponseTimeTrend = {
        ...defaultMetricTrend,
    }
    const ticketHandleTimeTrend = {
        ...defaultMetricTrend,
    }
    const averageScoreTrend = {
        ...defaultMetricTrend,
        isError: false,
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
            customerSatisfactionMetricTrend,
        )
        useMedianFirstResponseTimeTrendMock.mockReturnValue(
            medianFirstResponseTimeMetricTrend,
        )
        useMedianResolutionTimeTrendMock.mockReturnValue(
            medianResolutionTimeMetricTrend,
        )
        useMessagesPerTicketTrendMock.mockReturnValue(
            messagesPerTicketMetricTrend,
        )
        useOpenTicketsTrendMock.mockReturnValue(openTicketsMetricTrend)
        useClosedTicketsTrendMock.mockReturnValue(closedTicketsMetricTrend)
        useTicketsCreatedTrendMock.mockReturnValue(createdTicketsMetricTrend)
        useTicketsRepliedTrendMock.mockReturnValue(repliedTicketsMetricTrend)
        useMessagesSentTrendMock.mockReturnValue(messagesSentMetricTrend)
        useMessagesReceivedTrendMock.mockReturnValue(
            messagesReceivedMetricTrend,
        )
        useOneTouchTicketTrendMock.mockReturnValue(oneTouchTicketsMetricTrend)
        useZeroTouchTicketTrendMock.mockReturnValue(oneTouchTicketsMetricTrend)
        useMedianResponseTimeTrendMock.mockReturnValue(
            useMedianResponseTimeTrend,
        )
        useTicketHandleTimeTrendMock.mockReturnValue(ticketHandleTimeTrend)
        useAverageScoreTrendMock.mockReturnValue(averageScoreTrend)

        trendBadgeMock.mockImplementation(() => <>{DEFAULT_BADGE_TEXT}</>)
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            granularity: ReportingGranularity.Day,
            userTimezone: DEFAULT_TIMEZONE,
        })
    })

    it.each(Object.values(OverviewMetric))(
        'should render customer experience section with a badge tooltip %s %#',
        (overviewMetric) => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <AverageScoreTrend
                        {...OverviewMetricConfig[overviewMetric]}
                        drillDownMetric={overviewMetric}
                    />
                </Provider>,
            )

            expect(trendBadgeMock.mock.calls).toContainEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        interpretAs:
                            OverviewMetricConfig[overviewMetric].interpretAs,
                        tooltipData: {
                            period: getBadgeTooltipForPreviousPeriod(
                                defaultStatsFilters.period,
                            ),
                        },
                        value: defaultMetricTrend?.data?.value,
                        prevValue: defaultMetricTrend.data?.prevValue,
                        isLoading: !defaultMetricTrend?.data,
                        metricFormat:
                            OverviewMetricConfig[overviewMetric].metricFormat,
                    }),
                ]),
            )
        },
    )

    it('should render not available placeholder and default badge text if no data available', () => {
        const metric = OverviewMetric.CustomerSatisfaction
        useCustomerSatisfactionTrendMock.mockReturnValue({
            data: { value: null, prevValue: null },
            isFetching: false,
            isError: false,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <AverageScoreTrend
                    {...OverviewMetricConfig[metric]}
                    drillDownMetric={metric}
                />
            </Provider>,
        )

        expect(
            screen.getByText(
                `${NOT_AVAILABLE_PLACEHOLDER}${DEFAULT_BADGE_TEXT}`,
            ),
        ).toBeInTheDocument()
    })

    it('should call useTrend with legacyStatsFilters', () => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            granularity: ReportingGranularity.Day,
            userTimezone: DEFAULT_TIMEZONE,
        })
        const metric = OverviewMetric.CustomerSatisfaction
        const useTrendSpy = jest.fn().mockReturnValue({
            data: { value: null, prevValue: null },
            isFetching: false,
            isError: false,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <AverageScoreTrend
                    {...OverviewMetricConfig[metric]}
                    useTrend={useTrendSpy}
                    drillDownMetric={metric}
                />
            </Provider>,
        )

        expect(useTrendSpy).toHaveBeenCalledWith(
            defaultStatsFilters,
            DEFAULT_TIMEZONE,
        )
    })

    it('should call useTrend with statsFiltersWithLogicalOperators', () => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            granularity: ReportingGranularity.Day,
            userTimezone: DEFAULT_TIMEZONE,
        })
        const metric = OverviewMetric.CustomerSatisfaction
        const useTrendSpy = jest.fn().mockReturnValue({
            data: { value: null, prevValue: null },
            isFetching: false,
            isError: false,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <AverageScoreTrend
                    {...OverviewMetricConfig[metric]}
                    useTrend={useTrendSpy}
                    drillDownMetric={metric}
                />
            </Provider>,
        )

        expect(useTrendSpy).toHaveBeenCalledWith(
            defaultStatsFilters,
            DEFAULT_TIMEZONE,
        )
    })

    it('should render customer experience section with a badge and with custom class name', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <AverageScoreTrend
                    className="averageScoreMetric"
                    useTrend={useAverageScoreTrend}
                    interpretAs={'more-is-better'}
                />
            </Provider>,
        )

        const averageScoreMetric = container.querySelector(
            '.averageScoreMetric',
        )
        expect(averageScoreMetric).toBeInTheDocument()
        expect(averageScoreMetric).toHaveTextContent('456')
        expect(trendBadgeMock.mock.calls).toContainEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    interpretAs: 'more-is-better',
                    tooltipData: {
                        period: getBadgeTooltipForPreviousPeriod(
                            defaultStatsFilters.period,
                        ),
                    },
                    value: defaultMetricTrend?.data?.value,
                    prevValue: defaultMetricTrend.data?.prevValue,
                    isLoading: !defaultMetricTrend?.data,
                }),
            ]),
        )
    })
})
