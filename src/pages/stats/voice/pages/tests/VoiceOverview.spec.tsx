import React from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {render, fireEvent} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {
    CALL_LIST_TITLE,
    CALL_VOLUME_METRICS_TITLE,
    INBOUND_CALLS_METRIC_TITLE,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_TITLE,
    VOICE_LEARN_MORE_URL,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import {billingState} from 'fixtures/billing'
import {agents} from 'fixtures/agents'
import {StatsFilters} from 'models/stat/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import VoiceOverview from '../VoiceOverview'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceOverview', () => {
    const renderVoiceOverview = (featureEnabled = true) => {
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2023-12-11T00:00:00.000Z',
                end_datetime: '2023-12-11T23:59:59.999Z',
            },
            agents: [agents[0].id],
        }
        const state = {
            currentAccount: fromJS({
                current_subscription: account.current_subscription,
                features: fromJS({
                    [AccountFeature.PhoneNumber]: {
                        enabled: featureEnabled,
                    },
                }),
            }),
            billing: fromJS(billingState),
            stats: fromJS({
                filters: statsFilters,
            }),
            integrations: fromJS({integrations: []}),
            ui: {
                stats: {
                    cleanStatsFilters: statsFilters,
                    isFilterDirty: false,
                    fetchingMap: {},
                },
            },
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
        const {queryByText} = renderVoiceOverview()

        // header elements
        expect(queryByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
        expect(queryByText('Voice add-on features')).toBeNull()

        // filters
        expect(queryByText('All integrations')).toBeInTheDocument()
        expect(queryByText('Dec 11, 2023')).toBeInTheDocument()

        // metric cards
        expect(queryByText(CALL_VOLUME_METRICS_TITLE)).toBeInTheDocument()
        expect(queryByText(TOTAL_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(OUTBOUND_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(INBOUND_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(MISSED_CALLS_METRIC_TITLE)).toBeInTheDocument()

        // list of calls section
        expect(queryByText(CALL_LIST_TITLE)).toBeInTheDocument()

        // footer
        expect(
            queryByText('Analytics are using UTC timezone')
        ).toBeInTheDocument()
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
