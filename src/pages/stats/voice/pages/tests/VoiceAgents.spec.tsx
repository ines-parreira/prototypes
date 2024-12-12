import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
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
import {
    FilterComponentKey,
    FilterKey,
    LegacyStatsFilters,
} from 'models/stat/types'
import {ADD_FILTER_BUTTON_LABEL} from 'pages/stats/common/filters/AddFilterButton'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {
    VOICE_AGENTS_PAGE_TITLE,
    VOICE_CALL_ACTIVITY_TITLE,
} from 'pages/stats/voice/constants/voiceAgents'
import VoiceAgents from 'pages/stats/voice/pages/VoiceAgents'
import {AccountFeature} from 'state/currentAccount/types'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {AGENT_PERFORMANCE_SLICE_NAME} from 'state/ui/stats/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('../../VoicePaywall', () => () => <div>VoicePaywall</div>)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const statsFilters: LegacyStatsFilters = {
    period: {
        start_datetime: '2023-12-11T00:00:00.000Z',
        end_datetime: '2023-12-11T23:59:59.999Z',
    },
    integrations: [123],
    agents: [agents[0].id],
    tags: [tags[0].id],
    score: ['4'],
    resolutionCompleteness: ['12'],
    communicationSkills: ['1'],
}

const getState = (featureEnabled: boolean) =>
    ({
        currentUser: fromJS(user) as Map<any, any>,
        currentAccount: fromJS({
            current_subscription: {
                ...account.current_subscription,
                products: {
                    ...account.current_subscription.products,
                    [AUTOMATION_PRODUCT_ID]: basicYearlyAutomationPlan.price_id,
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
                fetchingMap: {},
                statsTables: {
                    [AGENT_PERFORMANCE_SLICE_NAME]:
                        agentPerformanceInitialState,
                },
            },
        },
        entities: {tags: {[tags[0].id]: tags[0]}},
    }) as RootState

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
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
            [FeatureFlagKey.AutoQAFilters]: true,
        })
    })

    it('should render page when AnalyticsNewFiltersVoice is true', () => {
        const {getByText, getAllByText} = renderVoiceAgents()
        expect(getByText(VOICE_AGENTS_PAGE_TITLE)).toBeInTheDocument()

        fireEvent.click(getByText(ADD_FILTER_BUTTON_LABEL))

        expect(
            getByText(FilterLabels[FilterComponentKey.PhoneIntegrations])
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.Tags])[0]
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.Agents])[0]
        ).toBeInTheDocument()
    })

    it('should render Filters Panel with Score filter', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
        })

        const {getByText, getAllByText} = renderVoiceAgents()
        expect(getByText(VOICE_AGENTS_PAGE_TITLE)).toBeInTheDocument()

        fireEvent.click(getByText(ADD_FILTER_BUTTON_LABEL))

        expect(
            getByText(FilterLabels[FilterComponentKey.PhoneIntegrations])
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.Tags])[0]
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.Agents])[0]
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.Score])[0]
        ).toBeInTheDocument()
    })

    it('should render Filters Panel with Resolution Completeness and Communication Skills filters', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
            [FeatureFlagKey.AutoQAFilters]: true,
        })

        const {getByText, getAllByText} = renderVoiceAgents()
        expect(getByText(VOICE_AGENTS_PAGE_TITLE)).toBeInTheDocument()

        fireEvent.click(getByText(ADD_FILTER_BUTTON_LABEL))

        expect(
            getByText(FilterLabels[FilterKey.Integrations])
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.Tags])[0]
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.Agents])[0]
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.ResolutionCompleteness])[0]
        ).toBeInTheDocument()
        expect(
            getAllByText(FilterLabels[FilterKey.CommunicationSkills])[0]
        ).toBeInTheDocument()
    })
})

describe('VoiceAgents', () => {
    beforeAll(() => {
        mockFlags({
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

        expect(getByText('VoicePaywall')).toBeInTheDocument()
    })
})
