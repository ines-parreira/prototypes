import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/plans'
import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { ShopifyIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import ReturnOrderFlowViewContainer from '../ReturnOrderFlowViewContainer'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
}))
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'shop-name',
                meta: {},
            },
        ],
    }),
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {},
        },
        chatsApplicationAutomationSettings: {},
    },
} as unknown as RootState

describe('<ReturnOrderFlowViewContainer />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: { id: 1 } as ShopifyIntegration,
            selfServiceConfiguration: selfServiceConfiguration1,
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })

    it('should redirect if not automate subscribed', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <ReturnOrderFlowViewContainer />
            </Provider>,
        )

        expect(screen.getByText('Redirect')).toBeInTheDocument()
    })

    it('should render return order flow', () => {
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    basicMonthlyHelpdeskPlan.plan_id,
                                [AUTOMATION_PRODUCT_ID]:
                                    basicMonthlyAutomationPlan.plan_id,
                            },
                            status: 'active',
                        },
                    }),
                })}
            >
                <ReturnOrderFlowViewContainer />
            </Provider>,
        )

        expect(screen.getByText('Return order')).toBeInTheDocument()
    })
})
