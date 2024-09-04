import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {user} from 'fixtures/users'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import {FilterKey, LegacyStatsFilters} from 'models/stat/types'
import {agents} from 'fixtures/agents'
import {billingState} from 'fixtures/billing'
import {tags} from 'fixtures/tag'
import {
    VOICE_AGENTS_PAGE_TITLE,
    VOICE_CALL_ACTIVITY_TITLE,
} from 'pages/stats/voice/constants/voiceAgents'

import {fromLegacyStatsFilters} from 'state/stats/utils'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {VOICE_LEARN_MORE_URL} from 'pages/stats/voice/constants/voiceOverview'

import {VOICE_PRODUCT_ID, voicePlan1} from 'fixtures/productPrices'
import VoiceAgents from 'pages/stats/voice/pages/VoiceAgents'
import {FeatureFlagKey} from 'config/featureFlags'
import {ADD_FILTER_BUTTON_LABEL} from 'pages/stats/common/filters/AddFilterButton'
import {FilterLabels} from 'pages/stats/common/filters/constants'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const statsFilters: LegacyStatsFilters = {
    period: {
        start_datetime: '2023-12-11T00:00:00.000Z',
        end_datetime: '2023-12-11T23:59:59.999Z',
    },
    agents: [agents[0].id],
    tags: [tags[0].id],
}

const getState = (featureEnabled: boolean) =>
    ({
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
            filters: fromLegacyStatsFilters(statsFilters),
        },
        integrations: fromJS({integrations: []}),
        ui: {
            stats: {
                cleanStatsFilters: statsFilters,
                isFilterDirty: false,
                fetchingMap: {},
            },
            agentPerformance: agentPerformanceInitialState,
        },
        entities: {tags: {[tags[0].id]: tags[0]}},
    } as RootState)

const renderVoiceAgents = (featureEnabled = true) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(getState(featureEnabled))}>
                <VoiceAgents />
            </Provider>
        </QueryClientProvider>
    )
}

describe('VoiceAgents with the new filters', () => {
    beforeAll(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
        })
    })

    it('should render page when AnalyticsNewFiltersVoice is true', () => {
        const {getByText, getAllByText} = renderVoiceAgents()
        expect(getByText(VOICE_AGENTS_PAGE_TITLE)).toBeInTheDocument()
        fireEvent.click(getByText(ADD_FILTER_BUTTON_LABEL))
        expect(
            getByText(FilterLabels[FilterKey.Integrations])
        ).toBeInTheDocument()
        expect(getByText(FilterLabels[FilterKey.Tags])).toBeInTheDocument()
        expect(getAllByText(FilterLabels[FilterKey.Agents])).toHaveLength(2)
    })
})

describe('VoiceAgents', () => {
    beforeAll(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: false,
        })
    })

    it('should render page', () => {
        const {queryByText} = renderVoiceAgents()

        // title
        expect(queryByText(VOICE_AGENTS_PAGE_TITLE)).toBeInTheDocument()
        expect(queryByText(VOICE_CALL_ACTIVITY_TITLE)).toBeInTheDocument()

        expect(queryByText('Voice add-on features')).toBeNull()

        // filters
        expect(queryByText('All integrations')).toBeInTheDocument()
        expect(queryByText('1 tag')).toBeInTheDocument()
        expect(queryByText('1 agent')).toBeInTheDocument()
        expect(queryByText('Dec 11, 2023')).toBeInTheDocument()
        expect(queryByText('Download data')).toBeInTheDocument()

        // footer
        expect(
            queryByText('Analytics are using EST timezone')
        ).toBeInTheDocument()
    })

    it('should render paywall page', () => {
        const {getByText} = renderVoiceAgents(false)

        expect(getByText(VOICE_AGENTS_PAGE_TITLE)).toBeInTheDocument()
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
