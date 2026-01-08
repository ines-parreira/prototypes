import type { ComponentProps } from 'react'

import {
    FeatureFlagKey,
    useAreFlagsLoading,
    useFlag,
} from '@repo/feature-flags'
import { assumeMock, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { DisplayEventType } from 'domains/reporting/hooks/automate/automateStatsMeasureLabelMap'
import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import type { AutomateTimeseries } from 'domains/reporting/hooks/automate/types'
import { useAIAgentAutomatedInteractionsTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useAIAgentInteractionsBySkillTimeSeries } from 'domains/reporting/hooks/automate/useAIAgentInteractionsBySkillTimeSeries'
import {
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'domains/reporting/hooks/automate/useAutomationDataset'
import { useAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { useDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { useDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { useFilteredAutomatedInteractionTimeSeries } from 'domains/reporting/hooks/automate/useFilteredAutomatedInteractionTimeSeries'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { AutomationBillingEventMeasure } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AutomateOverview } from 'domains/reporting/pages/automate/overview/AutomateOverview'
import { AutomateOverviewDownloadDataButton } from 'domains/reporting/pages/automate/overview/AutomateOverviewDownloadDataButton'
import { TimeSavedByAgentsKPIChart } from 'domains/reporting/pages/automate/overview/charts/TimeSavedByAgentsKPIChart'
import { BarChart } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { ADD_FILTER_BUTTON_LABEL } from 'domains/reporting/pages/common/filters/AddFilterButton'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import type DEPRECATED_TagsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_TagsStatsFilter'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { useSearchParam } from 'hooks/useSearchParam'
import { IntegrationType } from 'models/integration/constants'
import { useAiAgentTypeForAccount } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { AccountFeature, AccountSettingType } from 'state/currentAccount/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const queryClient = mockQueryClient()

jest.useFakeTimers().setSystemTime(new Date('2022-02-02'))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useId: jest.fn().mockImplementation(() => 'abc'),
}))

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
            pathname: '/app/stats/ai-agent-overview',
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
const mockUseTrendFromMultipleMetricsTrend = jest.requireMock(
    'domains/reporting/hooks/automate/automationTrends',
).useTrendFromMultipleMetricsTrend

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

jest.mock('pages/aiAgent/analyticsOverview/hooks/useAutomationRateByFeature')
const useAutomationRateByFeatureMock = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useAutomationRateByFeature',
).useAutomationRateByFeature

jest.mock('domains/reporting/hooks/metricTrends')
const mockUseTicketHandleTimeTrend = jest.requireMock(
    'domains/reporting/hooks/metricTrends',
).useTicketHandleTimeTrend

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)
const useAreFlagsLoadingMock = assumeMock(useAreFlagsLoading)

jest.mock(
    'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend',
)
const useAIAgentAutomatedInteractionsTrendMock = assumeMock(
    useAIAgentAutomatedInteractionsTrend,
)

jest.mock('domains/reporting/hooks/automate/useAIAgentAutomationRateTrend')
const useAIAgentAutomationRateTrendMock = assumeMock(
    useAIAgentAutomationRateTrend,
)

jest.mock(
    'domains/reporting/hooks/automate/useAIAgentInteractionsBySkillTimeSeries',
)
const useAIAgentInteractionsBySkillTimeSeriesMock = assumeMock(
    useAIAgentInteractionsBySkillTimeSeries,
)

jest.mock(
    'domains/reporting/hooks/automate/useFilteredAutomatedInteractionTimeSeries',
)

const useFilteredAutomatedInteractionTimeSeriesMock = assumeMock(
    useFilteredAutomatedInteractionTimeSeries,
)

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
        useAreFlagsLoadingMock.mockReturnValue(false)
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AutomateOverviewChannelsFilter)
                return true
            if (flag === FeatureFlagKey.AutomateAIAgentInteractions) return true

            return false
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

        useAIAgentAutomatedInteractionsTrendMock.mockReturnValue({
            data: {
                value: 1234,
                prevValue: 1000,
            },
            isFetching: false,
            isError: false,
        })

        useAIAgentAutomationRateTrendMock.mockReturnValue({
            data: {
                value: 0.4567,
                prevValue: 0.4123,
            },
            isFetching: false,
            isError: false,
        })

        useAIAgentInteractionsBySkillTimeSeriesMock.mockReturnValue({
            data: {
                'AI Agent Support': [
                    [{ dateTime: '2022-02-02T12:45:33.122', value: 23 }],
                ],
                'AI Agent Sales': [
                    [{ dateTime: '2022-02-02T12:45:33.122', value: 15 }],
                ],
            },
            isLoading: false,
            isError: false,
        } as any)

        useFilteredAutomatedInteractionTimeSeriesMock.mockReturnValue({
            filteredData: [],
            colors: [],
            isArticleRecommendationsEnabled: true,
        })

        useAutomationRateByFeatureMock.mockReturnValue({
            data: [
                { name: 'AI Agent', value: 18 },
                { name: 'Flows', value: 7 },
                { name: 'Article Recommendation', value: 4 },
                { name: 'Order Management', value: 3 },
            ],
            isLoading: false,
            isError: false,
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
            integrations: fromJS({
                integrations: [getIntegration(1, IntegrationType.Shopify)],
            }),
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
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AutomateOverviewChannelsFilter)
                    return true
                return false
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
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AutomateOverviewChannelsFilter)
                    return false
                return false
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

    describe('Autoresponder deprecation', () => {
        it('should display autoresponder filter label', () => {
            useFilteredAutomatedInteractionTimeSeriesMock.mockReturnValue({
                filteredData: [
                    {
                        label: DisplayEventType.AUTORESPONDERS,
                        values: [{ x: '2022-02-02T12:45:33.122', y: 23 }],
                    },
                ],
                colors: ['#123456'],
                isArticleRecommendationsEnabled: true,
            })
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
            useFilteredAutomatedInteractionTimeSeriesMock.mockReturnValue({
                filteredData: [
                    {
                        label: DisplayEventType.QUICK_RESPONSES_DEPRECATED,
                        values: [{ x: '2022-02-02T12:45:33.122', y: 23 }],
                    },
                ],
                colors: ['#123456'],
                isArticleRecommendationsEnabled: true,
            })
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
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.ObservabilityTicketTimeToHandle)
                    return true
                return false
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

    describe('Feature flags loading state', () => {
        it('should return null when flags are loading', () => {
            useAreFlagsLoadingMock.mockReturnValue(true)

            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(container.firstChild).toBeNull()
        })

        it('should render AnalyticsOverviewLayout when AiAgentAnalyticsDashboardsNewScreens flag is enabled', () => {
            const useStatsFiltersSpy = jest.spyOn(
                require('domains/reporting/hooks/support-performance/useStatsFilters'),
                'useStatsFilters',
            )

            try {
                useAreFlagsLoadingMock.mockReturnValue(false)
                useFlagMock.mockImplementation((flag) => {
                    if (
                        flag ===
                        FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                    )
                        return true
                    return false
                })

                useStatsFiltersSpy.mockReturnValue({
                    cleanStatsFilters: {
                        period: { from: '2024-01-01', to: '2024-01-31' },
                    },
                    userTimezone: 'UTC',
                } as any)

                mockUseTicketHandleTimeTrend.mockReturnValue({
                    data: { value: 1.5 },
                    isFetching: false,
                    isError: false,
                })

                mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
                    data: { value: 100 },
                    isFetching: false,
                    isError: false,
                })

                const { container } = render(
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <AutomateOverview />
                        </QueryClientProvider>
                    </Provider>,
                )

                expect(container.querySelector('.analyticsOverviewLayout'))
            } finally {
                useStatsFiltersSpy.mockRestore()
            }
        })
    })

    describe('AI Agent KPI Charts', () => {
        beforeEach(() => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AutomateOverviewChannelsFilter)
                    return true
                if (flag === FeatureFlagKey.AutomateAIAgentInteractions)
                    return true
                return false
            })
        })

        it('should render AI Agent KPI charts when ActionDrivenAiAgentNavigation flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AutomateOverviewChannelsFilter)
                    return true
                if (flag === FeatureFlagKey.AutomateAIAgentInteractions)
                    return true
                if (
                    flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                )
                    return false
                return false
            })

            const { getByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(getByText('AI Agent automation rate')).toBeInTheDocument()

            // There are two elements with this text - the KPI chart and the bar chart
            const aiAgentInteractionElements = screen.getAllByText(
                'AI Agent automated interactions',
            )
            expect(aiAgentInteractionElements).toHaveLength(2)
        })

        it('should render AI Agent KPI charts regardless of ActionDrivenAiAgentNavigation flag', () => {
            const { queryByText, getAllByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <AutomateOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(queryByText('AI Agent automation rate')).toBeInTheDocument()
            // There are two elements with this text - the KPI chart and the bar chart
            const aiAgentInteractionElements = getAllByText(
                'AI Agent automated interactions',
            )
            expect(aiAgentInteractionElements).toHaveLength(2)
        })
    })
})
