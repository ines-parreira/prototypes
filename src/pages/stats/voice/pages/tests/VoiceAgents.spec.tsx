import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/productPrices'
import { tags } from 'fixtures/tag'
import { user } from 'fixtures/users'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import {
    VOICE_AGENTS_PAGE_TITLE,
    VOICE_CALL_ACTIVITY_TITLE,
} from 'pages/stats/voice/constants/voiceAgents'
import VoiceAgents from 'pages/stats/voice/pages/VoiceAgents'
import { AccountFeature } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { VOICE_AGENTS_PERFORMANCE_SLICE_NAME } from 'state/ui/stats/constants'
import { initialState as agentPerformanceInitialState } from 'state/ui/stats/voiceAgentsPerformanceSlice'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('pages/stats/voice/VoicePaywall', () => () => <div>VoicePaywall</div>)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2023-12-11T00:00:00.000Z',
        end_datetime: '2023-12-11T23:59:59.999Z',
    },
    integrations: withDefaultLogicalOperator([123]),
    agents: withDefaultLogicalOperator([agents[0].id]),
    tags: [
        {
            ...withDefaultLogicalOperator([tags[0].id]),
            filterInstanceId: TagFilterInstanceId.First,
        },
    ],
    score: withDefaultLogicalOperator(['4']),
    resolutionCompleteness: withDefaultLogicalOperator(['12']),
    communicationSkills: withDefaultLogicalOperator(['1']),
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
            filters: statsFilters,
        },
        integrations: fromJS({ integrations: [] }),
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: statsFilters,
                    isFilterDirty: false,
                    appliedSavedFilterId: null,
                    savedFilterDraft: null,
                },
                fetchingMap: {},
                statsTables: {
                    [VOICE_AGENTS_PERFORMANCE_SLICE_NAME]:
                        agentPerformanceInitialState,
                },
            },
        },
        entities: { tags: { [tags[0].id]: tags[0] } },
    }) as RootState

const renderVoiceAgents = (featureEnabled = true) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(getState(featureEnabled))}>
                <VoiceAgents />
            </Provider>
        </QueryClientProvider>,
    )
}

describe('VoiceAgents', () => {
    it('should render page', () => {
        const { queryByText } = renderVoiceAgents()

        // title
        expect(queryByText(VOICE_AGENTS_PAGE_TITLE)).toBeInTheDocument()
        expect(queryByText(VOICE_CALL_ACTIVITY_TITLE)).toBeInTheDocument()

        expect(queryByText('Voice add-on features')).toBeNull()

        // footer
        expect(
            queryByText('Analytics are using EST timezone'),
        ).toBeInTheDocument()
    })

    it('should render paywall page', () => {
        const { getByText } = renderVoiceAgents(false)

        expect(getByText('VoicePaywall')).toBeInTheDocument()
    })
})
