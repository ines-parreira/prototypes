import React, { ComponentProps } from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { AutomateTimeseries } from 'domains/reporting/hooks/automate/types'
import {
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'domains/reporting/hooks/automate/useAutomationDataset'
import { useAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { useDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { useDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { AutomationBillingEventMeasure } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import {
    FilterKey,
    LegacyStatsFilters,
} from 'domains/reporting/models/stat/types'
import {
    AAO_TIPS_VISIBILITY_KEY,
    AutomateOverview,
} from 'domains/reporting/pages/automate/overview/AutomateOverview'
import { AutomateOverviewDownloadDataButton } from 'domains/reporting/pages/automate/overview/AutomateOverviewDownloadDataButton'
import { TimeSavedByAgentsKPIChart } from 'domains/reporting/pages/automate/overview/charts/TimeSavedByAgentsKPIChart'
import { BarChart } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { ADD_FILTER_BUTTON_LABEL } from 'domains/reporting/pages/common/filters/AddFilterButton'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import DEPRECATED_TagsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_TagsStatsFilter'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { useSearchParam } from 'hooks/useSearchParam'
import { IntegrationType } from 'models/integration/constants'
import { useAiAgentTypeForAccount } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { AUTOMATION_RATE_FIXED_STATS } from 'pages/automate/automate-metrics/constants'
import { AccountFeature, AccountSettingType } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const queryClient = mockQueryClient()

jest.useFakeTimers().setSystemTime(new Date('2022-02-02'))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/useId', () => () => 'abc')

jest.mock('react-chartjs-2', () => ({
    Line: () => null,
}))
jest.mock(
    'domains/reporting/pages/common/filters/DEPRECATED_TagsStatsFilter',
    () =>
        ({ value }: ComponentProps<typeof DEPRECATED_TagsStatsFilter>) => (
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
        ),
)
jest.mock(
    'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>,
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn(),
    useLocation: () =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ({
            pathname: '/app/stats/automate-overview',
        }) as any,
}))

// TimeSeries
jest.mock('domains/reporting/hooks/automate/useAutomationDataset')
const useAutomateMetricsTimeSeriesMock = assumeMock(
    useAutomateMetricsTimeSeries,
)
const useAutomateMetricsTrendMock = assumeMock(useAutomateMetricsTrend)

jest.mock('domains/reporting/hooks/automate/automationTrends')
const useFilteredAutomatedInteractionsMock = assumeMock(
    useFilteredAutomatedInteractions,
)

jest.mock('domains/reporting/pages/common/components/TrendBadge')
const trendBadgeMock = assumeMock(TrendBadge)

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)

jest.mock(
    'domains/reporting/pages/automate/overview/AutomateOverviewDownloadDataButton',
)
const AutomateOverviewDownloadDataButtonMock = assumeMock(
    AutomateOverviewDownloadDataButton,
)

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))
const mockedUseSearchParam = assumeMock(useSearchParam)

jest.mock('domains/reporting/hooks/automate/useAutomationRateTrend')
const useAutomationRateTrendMock = assumeMock(useAutomationRateTrend)
jest.mock('domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend')
const useDecreaseInResolutionTimeTrendMock = assumeMock(
    useDecreaseInResolutionTimeTrend,
)
jest.mock(
    'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend',
)
const useDecreaseInFirstResponseTimeTrendMock = assumeMock(
    useDecreaseInFirstResponseTimeTrend,
)
jest.mock('domains/reporting/hooks/automate/useAutomationRateTimeSeriesData')
const useAutomationRateTimeSeriesDataMock = assumeMock(
    useAutomationRateTimeSeriesData,
)

jest.mock(
    'domains/reporting/pages/automate/overview/charts/TimeSavedByAgentsKPIChart',
)
const TimeSavedByAgentsKPIChartMock = assumeMock(TimeSavedByAgentsKPIChart)

jest.mock('domains/reporting/pages/common/components/charts/BarChart/BarChart')
const BarChartMock = assumeMock(BarChart)

jest.mock('pages/aiAgent/Overview/hooks/useAiAgentType')
const useAiAgentTypeForAccountMock = assumeMock(useAiAgentTypeForAccount)

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
            [AccountFeature.AutomationSelfServiceStatistics]: { enabled: true },
            [AccountFeature.AutomationAddonOverview]: { enabled: true },
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
            stats: { filters: initialState },
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

    const automateMetricsTimeSeries: AutomateTimeseries = {
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
        mockFlags({
            [FeatureFlagKey.AutomateOverviewChannelsFilter]: true,
            [FeatureFlagKey.AutomateAIAgentInteractions]: true,
        })

        useFilteredAutomatedInteractionsMock.mockReturnValue(
            automatedInteractionTrend,
        )
        useAutomationRateTrendMock.mockReturnValue(automationRateTrend)
        useDecreaseInResolutionTimeTrendMock.mockReturnValue(
            decreaseInResolutionTimeWithAutomateTrend,
        )
        useDecreaseInFirstResponseTimeTrendMock.mockReturnValue(
            firstResponseTimeWithAutomationTrend,
        )
        useAutomationRateTimeSeriesDataMock.mockReturnValue({
            data: [],
            isError: false,
            isFetching: false,
        })
        useAutomateMetricsTimeSeriesMock.mockReturnValue(
            automateMetricsTimeSeries,
        )
        useAutomateMetricsTrendMock.mockReturnValue({
            automatedInteractionTrend,
            automationRateTrend,
            decreaseInFirstResponseTimeTrend:
                firstResponseTimeWithAutomationTrend,
            decreaseInResolutionTimeTrend:
                decreaseInResolutionTimeWithAutomateTrend,
        })

        trendBadgeMock.mockImplementation(() => <div>TrendBadgeMock</div>)
        AutomateOverviewDownloadDataButtonMock.mockImplementation(() => <div />)

        mockedUseSearchParam.mockReturnValue([null, jest.fn()])

        BarChartMock.mockReturnValue(<div>BarChart</div>)

        useAiAgentTypeForAccountMock.mockReturnValue({
            aiAgentType: 'mixed',
            isLoading: false,
        })
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
                stats: { filters: initialState },
            },
        } as RootState

        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display AAO', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    describe('Filters Panel', () => {
        it('should display new filters panel when the feature flag is enabled', async () => {
            mockFlags({
                [FeatureFlagKey.AutomateOverviewChannelsFilter]: true,
            })
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            const addFilterButton = screen.getByText(ADD_FILTER_BUTTON_LABEL)
            act(() => {
                userEvent.click(addFilterButton)
            })

            expect(
                screen.getByText(FilterLabels[FilterKey.Period]),
            ).toBeInTheDocument()
            await waitFor(() => {
                expect(
                    screen.getByText(FilterLabels[FilterKey.Channels]),
                ).toBeInTheDocument()
            })
        })

        it('should display new filters panel without Channels filter if feature flag is disabled', async () => {
            mockFlags({
                [FeatureFlagKey.AutomateOverviewChannelsFilter]: false,
            })
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.queryByText(ADD_FILTER_BUTTON_LABEL),
            ).not.toBeInTheDocument()
            await waitFor(() => {
                expect(
                    screen.queryByText(FilterLabels[FilterKey.Channels]),
                ).not.toBeInTheDocument()
            })
        })
    })

    it('should set filters to last 28 days if query param source=automate', () => {
        mockedUseSearchParam.mockReturnValue(['automate', jest.fn()])
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>,
        )

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                period: {
                    start_datetime: '2022-01-06T00:00:00Z',
                    end_datetime: '2022-02-02T23:59:59Z',
                },
            }),
        )
    })

    it('should render AutomateOverviewDownloadDataButton', () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>,
        )

        expect(AutomateOverviewDownloadDataButton).toHaveBeenCalled()
    })

    it('should render 72 hour notification', () => {
        const notificationFragment = 'Data for the past 72 hours'
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText(new RegExp(notificationFragment)),
        ).toBeInTheDocument()
        userEvent.click(screen.getByAltText('close-icon'))

        expect(
            screen.queryByText(new RegExp(notificationFragment)),
        ).not.toBeInTheDocument()
    })

    it('should render notification about missing data', () => {
        jest.useFakeTimers().setSystemTime(new Date('2025-02-02'))
        const notificationFragment = 'There is no activity for these features'
        const state = {
            ...defaultState,
            stats: {
                filters: {
                    period: {
                        start_datetime: '2024-01-06T00:00:00Z',
                        end_datetime: '2024-01-06T00:00:00Z',
                    },
                },
            },
        }
        useFilteredAutomatedInteractionsMock.mockReturnValue({
            ...defaultMetricTrend,
            data: {
                value: null,
                prevValue: null,
            },
        })

        const store = mockStore(state)
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AutomateOverview />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText(new RegExp(notificationFragment)),
        ).toBeInTheDocument()
        userEvent.click(screen.getByAltText('close-icon'))

        expect(
            screen.queryByText(new RegExp(notificationFragment)),
        ).not.toBeInTheDocument()
    })

    describe('Performance Tips', () => {
        it('should show tips by default', () => {
            const { getByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(getByText(/^Top 5%/)).toBeInTheDocument()
        })

        it('should show tips and save the value to local storage on show tips button click', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')

            const { getByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            fireEvent.click(getByText(/Show tips/))

            expect(getByText(/^Top 5%/)).toBeInTheDocument()
            expect(localStorage.getItem(AAO_TIPS_VISIBILITY_KEY)).toBe('true')
        })

        it('should hide tips and save the value to local storage on hide tips button click ', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'true')

            const { getByText, queryAllByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            fireEvent.click(getByText(/Hide tips/))

            expect(queryAllByText(/^Top 5%/)).toHaveLength(0)
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
        ])('%s', (_, sentiment, value) => {
            it('should show tips with sentiment ', () => {
                localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')
                useAutomationRateTrendMock.mockReturnValue({
                    ...defaultMetricTrend,
                    data: {
                        value,
                        prevValue: value,
                    },
                })

                const screen = render(
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <AutomateOverview />
                        </QueryClientProvider>
                    </Provider>,
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
            useAutomationRateTrendMock.mockReturnValue({
                ...defaultMetricTrend,
                data: {
                    value,
                    prevValue: value,
                },
            })

            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )
            fireEvent.click(screen.getByText(/Show tips/))

            expect(screen.getByText('-'))
        })
    })

    describe.each([['FRT show 0h 0m in case of', 0]])('%s', (_, value) => {
        it('should show tips with sentiment ', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')
            useDecreaseInFirstResponseTimeTrendMock.mockReturnValue({
                ...defaultMetricTrend,
                data: {
                    value,
                    prevValue: value,
                },
            })

            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )
            fireEvent.click(screen.getByText(/Show tips/))

            expect(screen.getByText('0h 0m'))
        })
    })

    describe.each([
        ['DecreaseInResolutionTimeWithAutomation show 0h 0m in case of', 0],
    ])('%s', (testName, value) => {
        it('should show tips with sentiment ', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')
            useDecreaseInResolutionTimeTrendMock.mockReturnValue({
                ...defaultMetricTrend,
                data: {
                    value,
                    prevValue: value,
                },
            })

            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )
            fireEvent.click(screen.getByText(/Show tips/))

            expect(screen.getByText('0h 0m'))
        })
    })

    describe.each([['AI show 0 in case of', 0]])('%s', (testName, value) => {
        it('should show tips with sentiment ', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')
            useFilteredAutomatedInteractionsMock.mockReturnValue({
                ...defaultMetricTrend,
                data: {
                    value,
                    prevValue: value,
                },
            })

            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )
            fireEvent.click(screen.getByText(/Show tips/))

            expect(screen.getByText('0'))
        })
    })

    describe('Autoresponder deprecation', () => {
        it('should display autoresponder filter label', () => {
            const automateMetricsTimeseries: AutomateTimeseries = {
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
                            label: AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders,
                            dateTime: '2022-02-02T12:45:33.122',
                            value: 23,
                        },
                    ],
                ],
            }
            useAutomateMetricsTimeSeriesMock.mockReturnValue(
                automateMetricsTimeseries,
            )
            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.getByText('Automated interactions by feature'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Autoresponders (deprecated)'),
            ).toBeInTheDocument()
        })

        it('should not show Auto-Responder label if not autoresponder in timeseries', () => {
            const automateMetricsTimeseries: AutomateTimeseries = {
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
                            label: AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation,
                            dateTime: '2022-02-02T12:45:33.122',
                            value: 23,
                        },
                    ],
                ],
            }
            useAutomateMetricsTimeSeriesMock.mockReturnValue(
                automateMetricsTimeseries,
            )
            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.queryByText('Autoresponders (deprecated)'),
            ).not.toBeInTheDocument()
        })
        it('should return false when hasAutomatedInteractionsByAutoResponders is false and item label matches', () => {
            const automateMetricsTimeseries: AutomateTimeseries = {
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
                            label: AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders,
                            dateTime: '2022-02-02T12:45:33.122',
                            value: 23,
                        },
                    ],
                ],
            }
            useAutomateMetricsTimeSeriesMock.mockReturnValue(
                automateMetricsTimeseries,
            )

            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            // Add assertions to check the specific behavior
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('Quickresponse deprecation', () => {
        it('should display quickresponse filter label', () => {
            const automateMetricsTimeseries: AutomateTimeseries = {
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
                            label: AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse,
                            dateTime: '2022-02-02T12:45:33.122',
                            value: 23,
                        },
                    ],
                ],
            }
            useAutomateMetricsTimeSeriesMock.mockReturnValue(
                automateMetricsTimeseries,
            )
            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.getByText('Automated interactions by feature'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Quick Responses (deprecated)'),
            ).toBeInTheDocument()
        })

        it('should not show Auto-Responder label if not quickresponse in timeseries', () => {
            const automateMetricsTimeseries: AutomateTimeseries = {
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
                            label: AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation,
                            dateTime: '2022-02-02T12:45:33.122',
                            value: 23,
                        },
                    ],
                ],
            }
            useAutomateMetricsTimeSeriesMock.mockReturnValue(
                automateMetricsTimeseries,
            )
            const screen = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.queryByText('Quick Responses (deprecated)'),
            ).not.toBeInTheDocument()
        })
        it('should return false when hasAutomatedInteractionsByQuickResponses is false and item label matches', () => {
            const automateMetricsTimeseries: AutomateTimeseries = {
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
                            label: AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse,
                            dateTime: '2022-02-02T12:45:33.122',
                            value: 23,
                        },
                    ],
                ],
            }
            useAutomateMetricsTimeSeriesMock.mockReturnValue(
                automateMetricsTimeseries,
            )

            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            // Add assertions to check the specific behavior
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should return false when hasAutomatedInteractionsByQuickResponse is false and item label matches', () => {
            const automateMetricsTimeseries: AutomateTimeseries = {
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
                            label: AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse,
                            dateTime: '2022-02-02T12:45:33.122',
                            value: 0,
                        },
                    ],
                ],
            }
            useAutomateMetricsTimeSeriesMock.mockReturnValue(
                automateMetricsTimeseries,
            )

            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            // Add assertions to check the specific behavior
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('TimeSavedByAgentsKPI', () => {
        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.ObservabilityTicketTimeToHandle]: true,
            })

            TimeSavedByAgentsKPIChartMock.mockImplementation(() => <div />)
        })

        it('should render TimeSavedByAgentsKPIChart when the flag is on', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(TimeSavedByAgentsKPIChartMock).toHaveBeenCalled()
        })
    })
})
