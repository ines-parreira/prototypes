import {QueryClientProvider} from '@tanstack/react-query'
import {render, fireEvent} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/productPrices'
import {tags} from 'fixtures/tag'
import {user} from 'fixtures/users'
import {FilterKey, LegacyStatsFilters} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import * as VoiceCallCallerExperienceMetric from 'pages/stats/voice/components/VoiceCallerExperienceMetric/VoiceCallCallerExperienceMetric'
import {VoiceOverviewDownloadDataButton} from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {
    ALL_CALLS_FILTER_LABEL,
    CALL_LIST_TITLE,
    CALL_VOLUME_METRICS_TITLE,
    INBOUND_CALLS_METRIC_TITLE,
    INBOUND_CALLS_FILTER_LABEL,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_TITLE,
    VOICE_OVERVIEW_PAGE_TITLE,
    CALLER_EXPERIENCE_METRICS_TITLE,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import VoiceOverview from 'pages/stats/voice/pages/VoiceOverview'
import {VOICE_OVERVIEW_OPTIONAL_FILTERS} from 'pages/stats/voice/pages/VoiceOverviewReportConfig'
import {AccountFeature} from 'state/currentAccount/types'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState, StoreDispatch} from 'state/types'
import {VoiceMetric} from 'state/ui/stats/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/stats/voice/hooks/useVoiceCallCountTrend')
jest.mock('pages/stats/voice/hooks/useVoiceCallAverageTimeTrend')
jest.mock('pages/stats/voice/VoicePaywall', () => () => <div>VoicePaywall</div>)
jest.mock(
    'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
)
const VoiceOverviewDownloadDataButtonMock = assumeMock(
    VoiceOverviewDownloadDataButton
)
jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    }
)

assumeMock(useVoiceCallCountTrend).mockReturnValue({
    data: {prevValue: 10, value: 15},
    isFetching: false,
    isError: false,
})
assumeMock(useVoiceCallAverageTimeTrend).mockReturnValue({
    data: {prevValue: 1, value: 2},
    isFetching: false,
    isError: false,
})
const VoiceCallCallerExperienceMetricSpy = jest.spyOn(
    VoiceCallCallerExperienceMetric,
    'default'
)

describe('VoiceOverview', () => {
    beforeEach(() => {
        VoiceOverviewDownloadDataButtonMock.mockImplementation(() => <div />)
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: false,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
            [FeatureFlagKey.AutoQAFilters]: false,
        })
    })

    const renderVoiceOverview = (featureEnabled = true) => {
        const statsFilters: LegacyStatsFilters = {
            period: {
                start_datetime: '2023-12-11T00:00:00.000Z',
                end_datetime: '2023-12-11T23:59:59.999Z',
            },
            agents: [agents[0].id],
            tags: [tags[0].id],
        }
        const state = {
            currentUser: fromJS(user) as Map<any, any>,
            currentAccount: fromJS({
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        ...account.current_subscription.products,
                        [AUTOMATION_PRODUCT_ID]:
                            basicYearlyAutomationPlan.price_id,
                        ...(featureEnabled && {
                            [VOICE_PRODUCT_ID]: voicePlan1.price_id,
                        }),
                    },
                },
                features: fromJS({
                    [AccountFeature.PhoneNumber]: {
                        enabled: featureEnabled,
                    },
                }),
            }),
            billing: fromJS(billingState),
            stats: {
                filters: fromLegacyStatsFilters(statsFilters),
            },
            integrations: fromJS({integrations: []}),
            ui: {
                stats: {
                    filters: {
                        cleanStatsFilters: fromLegacyStatsFilters(statsFilters),
                        isFilterDirty: false,
                    },
                },
            },
            entities: {tags: {[tags[0].id]: tags[0]}},
        } as RootState
        return render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <VoiceOverview />
                </Provider>
            </QueryClientProvider>
        )
    }

    it('should render page title', () => {
        const {queryByText, queryAllByText, getByText} = renderVoiceOverview()

        // header elements
        expect(queryByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
        expect(queryByText('Voice add-on features')).toBeNull()

        // filters
        expect(queryByText('All integrations')).toBeInTheDocument()
        expect(queryByText('1 tag')).toBeInTheDocument()
        expect(queryByText('1 agent')).toBeInTheDocument()
        expect(queryByText('Dec 11, 2023')).toBeInTheDocument()
        expect(VoiceOverviewDownloadDataButtonMock).toHaveBeenCalled()

        // caller experience cards
        expect(queryByText(CALLER_EXPERIENCE_METRICS_TITLE)).toBeInTheDocument()
        expect(queryByText(AVERAGE_TALK_TIME_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(AVERAGE_WAIT_TIME_METRIC_TITLE)).toBeInTheDocument()

        // metric cards
        expect(queryByText(CALL_VOLUME_METRICS_TITLE)).toBeInTheDocument()
        expect(queryByText(TOTAL_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(OUTBOUND_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(INBOUND_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(MISSED_CALLS_METRIC_TITLE)).toBeInTheDocument()

        // list of calls section
        expect(queryByText(CALL_LIST_TITLE)).toBeInTheDocument()

        expect(queryAllByText(ALL_CALLS_FILTER_LABEL)).toHaveLength(2)
        fireEvent.click(queryAllByText(ALL_CALLS_FILTER_LABEL)[0])
        expect(queryByText(INBOUND_CALLS_FILTER_LABEL)).toBeInTheDocument()
        expect(queryByText(OUTBOUND_CALLS_METRIC_TITLE)).toBeInTheDocument()

        fireEvent.click(getByText(INBOUND_CALLS_FILTER_LABEL))
        expect(queryAllByText(ALL_CALLS_FILTER_LABEL)).toHaveLength(1)
        expect(queryAllByText(INBOUND_CALLS_FILTER_LABEL)).toHaveLength(2)

        // footer
        expect(
            queryByText('Analytics are using EST timezone')
        ).toBeInTheDocument()
    })

    it('should render with no default filters and with new filters panel when feature flag is enabled', () => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFiltersVoice]: true})
        const {queryByText, getByText} = renderVoiceOverview()

        // filter buttons (default filters)
        expect(queryByText('All integrations')).not.toBeInTheDocument()
        expect(queryByText('1 tag')).not.toBeInTheDocument()
        expect(queryByText('1 agent')).not.toBeInTheDocument()
        expect(queryByText('Dec 11, 2023')).not.toBeInTheDocument()

        expect(VoiceOverviewDownloadDataButtonMock).toHaveBeenCalled()
        VOICE_OVERVIEW_OPTIONAL_FILTERS.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render new filters panel when feature flag is enabled and add Score filter', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
        })
        const extendedVoiceOverviewFilters = [
            ...VOICE_OVERVIEW_OPTIONAL_FILTERS,
            FilterKey.Score,
        ]

        const {getByText} = renderVoiceOverview()

        extendedVoiceOverviewFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render new filters panel when feature flag is enabled and add Resolution Completeness and Communication Skills filters', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
            [FeatureFlagKey.AutoQAFilters]: true,
        })
        const extendedVoiceOverviewFilters = [
            ...VOICE_OVERVIEW_OPTIONAL_FILTERS,
            FilterKey.ResolutionCompleteness,
            FilterKey.CommunicationSkills,
        ]

        const {getByText} = renderVoiceOverview()

        extendedVoiceOverviewFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render Download data button', () => {
        renderVoiceOverview()

        expect(VoiceOverviewDownloadDataButtonMock).toHaveBeenCalled()
    })

    it('should render paywall page', () => {
        const {getByText} = renderVoiceOverview(false)

        expect(getByText('VoicePaywall')).toBeInTheDocument()
    })

    it('should pass correct props to VoiceCallCallerExperienceMetric', () => {
        renderVoiceOverview()

        expect(VoiceCallCallerExperienceMetricSpy).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                metricData: {
                    metricName: VoiceMetric.AverageWaitTime,
                    title: AVERAGE_WAIT_TIME_METRIC_TITLE,
                },
            }),
            {}
        )
        expect(VoiceCallCallerExperienceMetricSpy).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                metricData: {
                    metricName: VoiceMetric.AverageTalkTime,
                    title: AVERAGE_TALK_TIME_METRIC_TITLE,
                },
            }),
            {}
        )
    })
})
