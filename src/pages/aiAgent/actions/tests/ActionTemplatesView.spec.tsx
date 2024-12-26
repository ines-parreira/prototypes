import {QueryClientProvider} from '@tanstack/react-query'
import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'

import thunk from 'redux-thunk'

import {useFlag} from 'common/flags'

import {FeatureFlagKey} from 'config/featureFlags'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {shopifyIntegration} from 'fixtures/integrations'
import {statsFilters} from 'fixtures/stats'

import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {useAiAgentEnabled} from 'pages/aiAgent/hooks/useAiAgentEnabled'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import ActionTemplatesView from '../ActionTemplatesView'

jest.mock('common/flags')
jest.mock('models/workflows/queries')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')

const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

const queryClient = mockQueryClient()
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const mockStore = configureMockStore([thunk])
const useGetWorkflowConfigurationTemplatesMock = jest.mocked(
    useGetWorkflowConfigurationTemplates
)

const defaultStore = mockStore({
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: automationSubscriptionProductPrices,
            status: 'active',
        },
    }),
    billing: fromJS(billingState),
    integrations: fromJS([shopifyIntegration]),
    stats: {filters: fromLegacyStatsFilters(statsFilters)},
})

describe('<ActionTemplatesView  />', () => {
    beforeEach(() => {
        jest.restoreAllMocks()

        mockUseFlag.mockReturnValue({
            [FeatureFlagKey.ActionsUseCaseTemplates]: true,
        })
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        useGetWorkflowConfigurationTemplatesMock.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
    })
    it('should render template view', () => {
        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionTemplatesView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/',
                route: '/shopify/my-shop/ai-agent/actions/',
            }
        )
        expect(
            screen.getByText(
                'Choose a template and customize it to fit your needs'
            )
        ).toBeInTheDocument()
    })
})
