import React from 'react'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {render, fireEvent, waitFor} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    ALL_CALLS_FILTER_LABEL,
    CALL_LIST_TITLE,
    CALL_VOLUME_METRICS_TITLE,
    INBOUND_CALLS_METRIC_TITLE,
    INBOUND_CALLS_FILTER_LABEL,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_TITLE,
    VOICE_LEARN_MORE_URL,
    VOICE_OVERVIEW_PAGE_TITLE,
    CALLER_EXPERIENCE_METRICS_TITLE,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import {billingState} from 'fixtures/billing'
import {agents} from 'fixtures/agents'
import {StatsFilters} from 'models/stat/types'
import {tags} from 'fixtures/tag'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {saveReport} from 'services/reporting/voiceOverviewReportingService'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {assumeMock} from 'utils/testing'
import {user} from 'fixtures/users'
import {VOICE_PRODUCT_ID, voicePlan1} from 'fixtures/productPrices'
import VoiceOverview from 'pages/stats/voice/pages/VoiceOverview'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('services/reporting/voiceOverviewReportingService')
jest.mock('pages/stats/voice/hooks/useVoiceCallCountTrend')
jest.mock('pages/stats/voice/hooks/useVoiceCallAverageTimeTrend')
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
const mockSaveReport = assumeMock(saveReport)

describe('VoiceOverview', () => {
    beforeEach(() => {
        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.DisplayVoiceAnalyticsNiceToHave]: true,
            [FeatureFlagKey.DisplayVoiceAnalyticsV1]: true,
            [FeatureFlagKey.NewDatePickerVariant]: false,
        })
    })

    const renderVoiceOverview = (featureEnabled = true) => {
        const statsFilters: StatsFilters = {
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
                filters: statsFilters,
            },
            integrations: fromJS({integrations: []}),
            ui: {
                stats: {
                    cleanStatsFilters: statsFilters,
                    isFilterDirty: false,
                    fetchingMap: {},
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
        expect(queryByText('Download data')).toBeInTheDocument()

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

    it('should trigger save report when clicking on download data', async () => {
        const {getByRole} = renderVoiceOverview()

        fireEvent.click(getByRole('button', {name: /Download data/i}))
        await waitFor(() => expect(mockSaveReport).toHaveBeenCalled())
    })

    it('should render paywall page', () => {
        const {getByText} = renderVoiceOverview(false)

        expect(getByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
        expect(getByText('Voice add-on features')).toBeInTheDocument()
        expect(getByText('Learn more')).toBeInTheDocument()
        fireEvent.click(getByText('Learn more'))
        expect(window.open).toHaveBeenCalledWith(
            VOICE_LEARN_MORE_URL,
            '_blank',
            'noopener noreferrer'
        )
    })
})
