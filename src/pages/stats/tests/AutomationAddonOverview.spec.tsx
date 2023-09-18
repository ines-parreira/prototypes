import {UseQueryResult} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import LD from 'launchdarkly-react-client-sdk'
import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {
    useFirstResponseTimeWithAutomationTrend,
    useResolutionTimeWithAutomationTrend,
    useAutomationRateTrend,
    useAutomatedInteractionTrend,
} from 'hooks/reporting/metricTrends'
import {
    useAutomationRateTimeSeries,
    useAutomatedInteractionTimeSeries,
    useAutomatedInteractionByEventTypesTimeSeries,
} from 'hooks/reporting/timeSeries'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
import TrendBadge from 'pages/stats/TrendBadge'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {usePostReporting} from 'models/reporting/queries'
import useTimeSeries from 'hooks/reporting/useTimeSeries'
import {saveReport} from 'services/reporting/automationAddOnReportingService'
import {AccountFeature, AccountSettingType} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import AutomationAddonOverview, {
    AAO_TIPS_VISIBILITY_KEY,
    automationRate,
} from '../AutomationAddonOverview'
import TagsStatsFilter from '../TagsStatsFilter'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/useId', () => () => 'abc')

jest.mock('react-chartjs-2')
jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)

// Trend
jest.mock('hooks/reporting/metricTrends')
const useFirstResponseTimeWithAutomationTrendMock = assumeMock(
    useFirstResponseTimeWithAutomationTrend
)
const useResolutionTimeWithAutomationTrendMock = assumeMock(
    useResolutionTimeWithAutomationTrend
)
const useAutomationRateTrendMock = assumeMock(useAutomationRateTrend)
const useAutomatedInteractionTrendMock = assumeMock(
    useAutomatedInteractionTrend
)

// Timeseries
jest.mock('hooks/reporting/timeSeries')
const useAutomationRateTimeSeriesMock = assumeMock(useAutomationRateTimeSeries)
const useAutomatedInteractionTimeSeriesMock = assumeMock(
    useAutomatedInteractionTimeSeries
)
const useAutomatedInteractionByEventTypesTimeSeriesMock = assumeMock(
    useAutomatedInteractionByEventTypesTimeSeries
)

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

// jest.mock('services/performanceTipService')
jest.mock('store/middlewares/segmentTracker')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('pages/stats/TrendBadge')
const trendBadgeMock = assumeMock(TrendBadge)

jest.mock('services/reporting/automationAddOnReportingService')
const saveReportMock = assumeMock(saveReport)

describe('<AutomationAddonOverview />', () => {
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
    const defaultStatsFilters: StatsFilters = {
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
        stats: fromJS({
            filters: defaultStatsFilters,
        }),
        integrations: fromJS({
            integrations: [
                getIntegration(1, IntegrationType.Shopify),
                getIntegration(2, IntegrationType.Magento2),
            ],
        }),
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

    beforeEach(() => {
        jest.resetAllMocks()
        useFirstResponseTimeWithAutomationTrendMock.mockReturnValue(
            firstResponseTimeWithAutomationTrend
        )
        useResolutionTimeWithAutomationTrendMock.mockReturnValue(
            resolutionTimeWithAutomationTrend
        )
        useAutomationRateTrendMock.mockReturnValue(automationRateTrend)
        useAutomatedInteractionTrendMock.mockReturnValue(
            automatedInteractionTrend
        )

        useAutomationRateTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useAutomatedInteractionTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useAutomatedInteractionByEventTypesTimeSeriesMock.mockReturnValue(
            defaultTimeSeries
        )
        usePostReportingMock.mockReturnValue({
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
        } as UseQueryResult)
        useCleanStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        trendBadgeMock.mockImplementation(() => <div>TrendBadgeMock</div>)

        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsPerformanceTips]: true,
        }))
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
            stats: fromJS({
                filters: defaultStatsFilters,
            }),
        } as RootState
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomationAddonOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display AAO', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomationAddonOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
    it('should send event to segment and call saveReport on download data button click', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomationAddonOverview />
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
                    <AutomationAddonOverview />
                </Provider>
            )

            expect(getByText(/^Top 10%/)).toBeInTheDocument()
        })

        it('should show tips and save the value to local storage on show tips button click', () => {
            localStorage.setItem(AAO_TIPS_VISIBILITY_KEY, 'false')

            const {getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <AutomationAddonOverview />
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
                    <AutomationAddonOverview />
                </Provider>
            )

            fireEvent.click(getByText(/Hide tips/))

            expect(queryAllByText(/^Top 10%/)).toHaveLength(0)
            expect(localStorage.getItem(AAO_TIPS_VISIBILITY_KEY)).toBe('false')
        })

        describe.each([
            ['light-error', /Room for improvement/, automationRate.avg - 0.1],
            ['light-success', /You’re doing good/, automationRate.top10P - 0.1],
            ['success', /You’re doing great/, automationRate.top10P + 0.1],
        ])('%s', (testName, sentiment, value) => {
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
                        <AutomationAddonOverview />
                    </Provider>
                )

                fireEvent.click(screen.getByText(/Show tips/))
                expect(screen.getByText(sentiment)).toBeInTheDocument()
                expect(screen).toMatchSnapshot()
            })
        })
    })
})
