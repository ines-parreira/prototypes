import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import LD from 'launchdarkly-react-client-sdk'

import {AUTOMATION_RATE_FIXED_STATS} from 'pages/automate/automate-metrics/constants'
import {SegmentEvent, logEvent} from 'common/segment'
import {TicketChannel} from 'business/types/ticket'
import {account} from 'fixtures/account'

import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {LegacyStatsFilters} from 'models/stat/types'
import TrendBadge from 'pages/stats/TrendBadge'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {saveReport} from 'services/reporting/automateOverviewReportingService'
import {AccountFeature, AccountSettingType} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import {initialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    AutomateOverview,
    AAO_TIPS_VISIBILITY_KEY,
} from 'pages/stats/AutomateOverview'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {useSearchParam} from 'hooks/useSearchParam'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {AutomateTimeseries} from 'hooks/reporting/automate/types'
import {
    useAutomateMetricsTimeseriesV2,
    useAutomateMetricsTrendV2,
} from 'hooks/reporting/automate/useAutomationDatasetV2'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

const queryClient = mockQueryClient()

jest.useFakeTimers().setSystemTime(new Date('2022-02-02'))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/useId', () => () => 'abc')

jest.mock('react-chartjs-2')
jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock(
    'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn(),
    useLocation: () =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ({
            pathname: '/app/stats/automate-overview',
        } as any),
}))

// Timeseries
jest.mock('hooks/reporting/timeSeries')

jest.mock('hooks/reporting/automate/useAutomationDatasetV2')
const useAutomateMetricsTimeseriesV2Mock = assumeMock(
    useAutomateMetricsTimeseriesV2
)
const useAutomateMetricsTrendV2Mock = assumeMock(useAutomateMetricsTrendV2)

jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('pages/stats/TrendBadge')
const trendBadgeMock = assumeMock(TrendBadge)

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('services/reporting/automateOverviewReportingService')
const saveReportMock = assumeMock(saveReport)

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))
const mockedUseSearchParam = assumeMock(useSearchParam)

describe('<AutomateOverview />', () => {
    function getIntegration(id: number, type: IntegrationType) {
        return {
            id,
            type,
            name: `My Phone Integration ${id}`,
            meta: {
                emoji: '',
                phone_number_id: id,
            },
        }
    }

    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
    }

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
        features: {
            ...account.features,
            [AccountFeature.AutomationSelfServiceStatistics]: {enabled: true},
            [AccountFeature.AutomationAddonOverview]: {enabled: true},
        },
    }
    const defaultState = {
        billing: fromJS(billingState),
        currentAccount: fromJS(defaultAccount),
        stats: {
            filters: defaultStatsFilters,
        },
        integrations: fromJS({
            integrations: [
                getIntegration(1, IntegrationType.Shopify),
                getIntegration(2, IntegrationType.Magento2),
            ],
        }),
        ui: {
            stats: initialState,
        },
    } as RootState

    const defaultMetricTrend: MetricTrend = {
        isFetching: false,
        isError: false,
        data: {
            value: 456,
            prevValue: 123,
        },
    }

    const firstResponseTimeWithAutomationTrend = {
        ...defaultMetricTrend,
        data: {
            value: 91,
            prevValue: 100,
        },
    }
    const decreaseInResolutionTimeWithAutomateTrend = {
        ...defaultMetricTrend,
        data: {
            value: 91,
            prevValue: 100,
        },
    }
    const resolutionTimeWithAutomationTrend = {
        ...defaultMetricTrend,
        data: {
            value: 92,
            prevValue: 100,
        },
    }
    const automationRateTrend = {
        ...defaultMetricTrend,
        data: {
            value: 93,
            prevValue: 100,
        },
    }
    const automatedInteractionTrend = {
        ...defaultMetricTrend,
        data: {
            value: 93,
            prevValue: 100,
        },
    }

    const automateMetricsTimeseriesV2: AutomateTimeseries = {
        isFetching: false,
        isError: false,
        automationRateTimeSeries: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
        automatedInteractionTimeSeries: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],

        automatedInteractionByEventTypesTimeSeries: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
    }

    beforeEach(() => {
        jest.resetAllMocks()
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AutomateOverviewChannelsFilter]: true,
        }))
        useAutomateMetricsTimeseriesV2Mock.mockReturnValue(
            automateMetricsTimeseriesV2
        )
        useAutomateMetricsTrendV2Mock.mockReturnValue({
            automatedInteractionTrend,
            automationRateTrend,
            decreaseInFirstResponseTimeTrend:
                firstResponseTimeWithAutomationTrend,
            decreaseInResolutionTimeTrend:
                decreaseInResolutionTimeWithAutomateTrend,
        })

        useCleanStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        trendBadgeMock.mockImplementation(() => <div>TrendBadgeMock</div>)

        mockedUseSearchParam.mockReturnValue([null, jest.fn()])
    })

    it('should display paywall', () => {
        const defaultState = {
            billing: fromJS(billingState),
            currentAccount: fromJS({
                ...defaultAccount,
                features: {
                    ...account.features,
                    [AccountFeature.AutomationSelfServiceStatistics]: {
                        enabled: false,
                    },
                },
            }),
            stats: {
                filters: defaultStatsFilters,
            },
            ui: {
                stats: initialState,
            },
        } as RootState
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display AAO', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
    it('should set filters to last 28 days if query param source=automate', () => {
        mockedUseSearchParam.mockReturnValue(['automate', jest.fn()])
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>
        )

        expect(store.getActions()).toEqual([
            mergeStatsFilters({
                period: {
                    start_datetime: '2022-01-06T00:00:00Z',
                    end_datetime: '2022-02-02T23:59:59Z',
                },
            }),
        ])
    })
    it('should send event to segment and call saveReport on download data button click', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
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
        it('should show tips by default', () => {
            const {getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>
            )

            expect(getByText(/^Top 10%/)).toBeInTheDocument()
        })

        it('should show tips and save the value to local storage on show tips button click', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')

            const {getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>
            )

            fireEvent.click(getByText(/Show tips/))

            expect(getByText(/^Top 10%/)).toBeInTheDocument()
            expect(localStorage.getItem(AAO_TIPS_VISIBILITY_KEY)).toBe('true')
        })

        it('should hide tips and save the value to local storage on hide tips button click ', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'true')

            const {getByText, queryAllByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>
            )

            fireEvent.click(getByText(/Hide tips/))

            expect(queryAllByText(/^Top 10%/)).toHaveLength(0)
            expect(localStorage.getItem(AAO_TIPS_VISIBILITY_KEY)).toBe('false')
        })

        describe.each([
            [
                'light-error',
                /Room for improvement/,
                AUTOMATION_RATE_FIXED_STATS.avg - 0.1,
            ],
            [
                'light-success',
                /You’re doing good/,
                AUTOMATION_RATE_FIXED_STATS.top10P - 0.1,
            ],
            [
                'success',
                /You’re doing great/,
                AUTOMATION_RATE_FIXED_STATS.top10P + 0.1,
            ],
        ])('%s', (testName, sentiment, value) => {
            it('should show tips with sentiment ', () => {
                localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')

                useAutomateMetricsTrendV2Mock.mockReturnValue({
                    automatedInteractionTrend,
                    automationRateTrend: {
                        ...defaultMetricTrend,
                        data: {
                            value,
                            prevValue: value,
                        },
                    },
                    decreaseInFirstResponseTimeTrend:
                        firstResponseTimeWithAutomationTrend,
                    decreaseInResolutionTimeTrend:
                        decreaseInResolutionTimeWithAutomateTrend,
                })
                const screen = render(
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <AutomateOverview />
                        </QueryClientProvider>
                    </Provider>
                )

                fireEvent.click(screen.getByText(/Show tips/))
                expect(screen.getByText(sentiment)).toBeInTheDocument()
                expect(screen).toMatchSnapshot()
            })
        })
    })
    describe.each([['show dash in case of', 0]])('%s', (testName, value) => {
        it('should show tips with sentiment ', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')

            useAutomateMetricsTrendV2Mock.mockReturnValue({
                automatedInteractionTrend,
                automationRateTrend: {
                    ...defaultMetricTrend,
                    data: {
                        value,
                        prevValue: value,
                    },
                },
                decreaseInFirstResponseTimeTrend:
                    firstResponseTimeWithAutomationTrend,
                decreaseInResolutionTimeTrend:
                    decreaseInResolutionTimeWithAutomateTrend,
            })
            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>
            )
            fireEvent.click(screen.getByText(/Show tips/))
            expect(screen.getByText('-'))
        })
    })
    describe.each([['FRT show 0h 0m in case of', 0]])(
        '%s',
        (testName, value) => {
            it('should show tips with sentiment ', () => {
                localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')

                useAutomateMetricsTrendV2Mock.mockReturnValue({
                    automatedInteractionTrend,
                    automationRateTrend,
                    decreaseInFirstResponseTimeTrend: {
                        ...defaultMetricTrend,
                        data: {
                            value,
                            prevValue: value,
                        },
                    },
                    decreaseInResolutionTimeTrend:
                        decreaseInResolutionTimeWithAutomateTrend,
                })

                const screen = render(
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <AutomateOverview />
                        </QueryClientProvider>
                    </Provider>
                )
                fireEvent.click(screen.getByText(/Show tips/))
                expect(screen.getByText('0h 0m'))
            })
        }
    )

    describe.each([
        ['DecreaseInResolutionTimeWithAutomation show 0h 0m in case of', 0],
    ])('%s', (testName, value) => {
        it('should show tips with sentiment ', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')

            useAutomateMetricsTrendV2Mock.mockReturnValue({
                automatedInteractionTrend,
                automationRateTrend,
                decreaseInFirstResponseTimeTrend:
                    firstResponseTimeWithAutomationTrend,
                decreaseInResolutionTimeTrend: {
                    ...defaultMetricTrend,
                    data: {
                        value,
                        prevValue: value,
                    },
                },
            })
            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>
            )
            fireEvent.click(screen.getByText(/Show tips/))
            expect(screen.getByText('0h 0m'))
        })
    })

    describe.each([['AI show 0 in case of', 0]])('%s', (testName, value) => {
        it('should show tips with sentiment ', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')

            useAutomateMetricsTrendV2Mock.mockReturnValue({
                automatedInteractionTrend: {
                    ...defaultMetricTrend,
                    data: {
                        value,
                        prevValue: value,
                    },
                },
                automationRateTrend,
                decreaseInFirstResponseTimeTrend:
                    firstResponseTimeWithAutomationTrend,
                decreaseInResolutionTimeTrend:
                    resolutionTimeWithAutomationTrend,
            })
            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>
            )
            fireEvent.click(screen.getByText(/Show tips/))
            expect(screen.getByText('0'))
        })
    })
})
