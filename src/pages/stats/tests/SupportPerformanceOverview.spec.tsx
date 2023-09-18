import {fromJS} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, render} from '@testing-library/react'
import moment from 'moment'
import {
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {FeatureFlagKey} from 'config/featureFlags'
import * as PerformanceTipHook from 'hooks/reporting/usePerformanceTips'
import {TipQualifier} from 'services/supportPerformanceTipService'
import {tags} from 'fixtures/tag'
import {TicketChannel} from 'business/types/ticket'
import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {teams} from 'fixtures/teams'
import {StatsFilters} from 'models/stat/types'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {AccountSettingType} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useFirstResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useResolutionTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {assumeMock} from 'utils/testing'
import {saveReport} from 'services/reporting/supportPerformanceReportingService'
import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import useTimeSeries from 'hooks/reporting/useTimeSeries'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import TrendBadge from 'pages/stats/TrendBadge'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import SupportPerformanceOverview, {
    AGENTS_REPORT_RELEASE_DATE,
    STATS_TIPS_VISIBILITY_KEY,
} from '../SupportPerformanceOverview'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/useId', () => () => 'abc')

jest.mock('react-chartjs-2')
jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)

jest.mock('hooks/reporting/metricTrends')
const useCustomerSatisfactionTrendMock = assumeMock(
    useCustomerSatisfactionTrend
)
const useFirstResponseTimeTrendMock = assumeMock(useFirstResponseTimeTrend)
const useResolutionTimeTrendMock = assumeMock(useResolutionTimeTrend)
const useMessagesPerTicketTrendMock = assumeMock(useMessagesPerTicketTrend)
const useOpenTicketsTrendMock = assumeMock(useOpenTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(useClosedTicketsTrend)
const useTicketsCreatedTrendMock = assumeMock(useTicketsCreatedTrend)
const useTicketsRepliedTrendMock = assumeMock(useTicketsRepliedTrend)
const useMessagesSentTrendMock = assumeMock(useMessagesSentTrend)

jest.mock('hooks/reporting/timeSeries')
const useTicketsCreatedTimeSeriesMock = assumeMock(useTicketsCreatedTimeSeries)
const useTicketsClosedTimeSeriesMock = assumeMock(useTicketsClosedTimeSeries)
const useTicketsRepliedTimeSeriesMock = assumeMock(useTicketsRepliedTimeSeries)
const useMessagesSentTimeSeriesMock = assumeMock(useMessagesSentTimeSeries)

jest.mock('hooks/reporting/distributions')
const useWorkloadPerChannelDistributionMock = assumeMock(
    useWorkloadPerChannelDistribution
)
const useWorkloadPerChannelDistributionForPreviousPeriodMock = assumeMock(
    useWorkloadPerChannelDistributionForPreviousPeriod
)

jest.mock('models/reporting/queries')

jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

jest.mock('services/supportPerformanceTipService')
jest.mock('store/middlewares/segmentTracker')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('pages/stats/TrendBadge')
const trendBadgeMock = assumeMock(TrendBadge)

jest.mock('services/reporting/supportPerformanceReportingService')
const saveReportMock = assumeMock(saveReport)

describe('<SupportPerformanceOverview />', () => {
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

    const tag = tags[0]
    const defaultAccount = {
        ...account,
        settings: [
            ...account.settings,
            {
                id: 123,
                type: AccountSettingType.SatisfactionSurveys,
                data: {
                    send_survey_for_chat: true,
                    send_survey_for_email: false,
                    survey_email_html: 'string',
                    survey_email_text: 'string',
                    survey_interval: 100,
                },
            },
        ],
    }
    const defaultState = {
        currentAccount: fromJS(defaultAccount),
        integrations: fromJS(integrationsState),
        stats: fromJS({
            filters: defaultStatsFilters,
        }),
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        entities: {
            tags: {
                [tag.id]: tag,
            },
        },
    } as RootState

    const accountCreatedBeforeRelease = {
        ...defaultAccount,
        created_datetime: moment(AGENTS_REPORT_RELEASE_DATE)
            .subtract(1, 'day')
            .toISOString(),
    }
    const accountCreatedAfterRelease = {
        ...defaultAccount,
        created_datetime: moment(AGENTS_REPORT_RELEASE_DATE)
            .add(1, 'day')
            .toISOString(),
    }
    const stateWithOldAccount = {
        ...defaultState,
        currentAccount: fromJS(accountCreatedBeforeRelease),
    }
    const stateWithFreshAccount = {
        ...defaultState,
        currentAccount: fromJS(accountCreatedAfterRelease),
    }
    const defaultMetricTrend: MetricTrend = {
        isFetching: false,
        isError: true,
        data: {
            value: 456,
            prevValue: 123,
        },
    }
    const openTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 90,
            prevValue: 100,
        },
    }
    const closedTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 91,
            prevValue: 100,
        },
    }
    const createdTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 92,
            prevValue: 100,
        },
    }
    const repliedTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 93,
            prevValue: 100,
        },
    }
    const messagesSentMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 94,
            prevValue: 100,
        },
    }
    const customerSatisfactionMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'more-is-better',
            value: 95,
            prevValue: 100,
        },
    }
    const firstResponseTimeMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value: 96,
            prevValue: 100,
        },
    }
    const resolutionTimeMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value: 97,
            prevValue: 100,
        },
    }
    const messagesPerTicketMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value: 98,
            prevValue: 100,
        },
    }

    const defaultTimeSeries = {
        data: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
    } as ReturnType<typeof useTimeSeries>

    const workloadDistribution = {
        data: [
            {
                value: 200,
                label: TicketChannel.Email,
            },
            {
                value: 34,
                label: TicketChannel.Chat,
            },
        ],
    } as ReturnType<typeof useWorkloadPerChannelDistributionForPreviousPeriod>

    beforeEach(() => {
        jest.resetAllMocks()
        useCustomerSatisfactionTrendMock.mockReturnValue(
            customerSatisfactionMetricTrend
        )
        useFirstResponseTimeTrendMock.mockReturnValue(
            firstResponseTimeMetricTrend
        )
        useResolutionTimeTrendMock.mockReturnValue(resolutionTimeMetricTrend)
        useMessagesPerTicketTrendMock.mockReturnValue(
            messagesPerTicketMetricTrend
        )
        useOpenTicketsTrendMock.mockReturnValue(openTicketsMetricTrend)
        useClosedTicketsTrendMock.mockReturnValue(closedTicketsMetricTrend)
        useTicketsCreatedTrendMock.mockReturnValue(createdTicketsMetricTrend)
        useTicketsRepliedTrendMock.mockReturnValue(repliedTicketsMetricTrend)
        useMessagesSentTrendMock.mockReturnValue(messagesSentMetricTrend)
        useTicketsCreatedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsClosedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsRepliedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useMessagesSentTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useWorkloadPerChannelDistributionForPreviousPeriodMock.mockReturnValue(
            workloadDistribution
        )
        useWorkloadPerChannelDistributionMock.mockReturnValue(
            workloadDistribution
        )
        useCleanStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        trendBadgeMock.mockImplementation(() => <div>TrendBadgeMock</div>)
        jest.spyOn(PerformanceTipHook, 'usePerformanceTips').mockReturnValue({
            type: TipQualifier.Success,
            content: 'Tip: some content',
            average: '4.5',
            topTen: '3.9',
        })
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsPerformanceTips]: true,
        }))
    })

    it('should render the page', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        customerSatisfactionMetricTrend,
        firstResponseTimeMetricTrend,
        resolutionTimeMetricTrend,
        messagesPerTicketMetricTrend,
    ])(
        'should render customer experience section with a badge tooltip #$#',
        (customerMetricTrend) => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            expect(trendBadgeMock.mock.calls).toContainEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        interpretAs: customerMetricTrend.data.interpretAs,
                        tooltip: 'Compared to: Feb 2nd, 2021 - Feb 2nd, 2021',
                        value: customerMetricTrend.data.value,
                    }),
                ])
            )
        }
    )

    it.each([
        openTicketsMetricTrend,
        closedTicketsMetricTrend,
        createdTicketsMetricTrend,
        repliedTicketsMetricTrend,
        messagesSentMetricTrend,
    ])(
        'should render workload section trend badges as neutral with a badge tooltip #$#',
        (workloadMetricTrend) => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverview />
                </Provider>
            )
            expect(trendBadgeMock.mock.calls).toContainEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        interpretAs: 'neutral',
                        tooltip: 'Compared to: Feb 2nd, 2021 - Feb 2nd, 2021',
                        value: workloadMetricTrend.data.value,
                    }),
                ])
            )
        }
    )

    it('should send event to segment and call saveReport on download data button click', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceOverview />
            </Provider>
        )
        fireEvent.click(getByText(/Download data/))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
        expect(saveReportMock).toHaveBeenCalled()
    })

    describe('Performance Tips', () => {
        beforeEach(() => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AnalyticsPerformanceTips]: true,
            }))
        })

        it('should show tips by default', () => {
            const {queryAllByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            expect(queryAllByText(/^Tip:/)).not.toHaveLength(0)
        })

        it('should show tips and save the value to local storage on show tips button click', () => {
            localStorage.setItem(STATS_TIPS_VISIBILITY_KEY, 'false')

            const {getByText, queryAllByText} = render(
                <Provider store={mockStore(defaultState)}>
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
                <Provider store={mockStore(defaultState)}>
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

    describe('Switching to old version banner', () => {
        it('should render a banner that allows switching to the old version if user is registered before agents report release date', () => {
            const {getByText} = render(
                <Provider store={mockStore(stateWithOldAccount)}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            expect(
                getByText('Welcome to the new Statistics Overview!', {
                    exact: false,
                })
            ).toBeInTheDocument()
        })

        it('should NOT render the switching to the old version banner if user is registered after agents report release date', () => {
            const {queryByText} = render(
                <Provider store={mockStore(stateWithFreshAccount)}>
                    <SupportPerformanceOverview />
                </Provider>
            )

            expect(
                queryByText('Welcome to the new Statistics Overview!', {
                    exact: false,
                })
            ).not.toBeInTheDocument()
        })
    })
})
