import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import {
    integrationsState,
    integrationsStateWithShopify,
} from 'fixtures/integrations'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    products,
} from 'fixtures/plans'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/types'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import useStoreIntegrations from '../useStoreIntegrations'

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

const shopifyIntegration = integrationsStateWithShopify.getIn([
    'integrations',
    0,
])

const additionalIntegrations = [
    {
        type: IntegrationType.Magento2,
    },
]

const defaultState = {
    currentAccount: fromJS({
        current_subscription: {
            products: {},
            status: 'active',
        },
    }),
    billing: fromJS({
        products,
    }),
    integrations: fromJS({
        integrations: [
            ...integrationsState.integrations,
            shopifyIntegration,
            ...additionalIntegrations,
        ],
    }),
} as RootState

describe('useStoreIntegrations', () => {
    it('should return integrations without automated products by default', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const { result } = renderHook(useStoreIntegrations, {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual([shopifyIntegration.toJS()])
    })

    it('should return integrations when account has automate products', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { result } = renderHook(useStoreIntegrations, {
            wrapper: ({ children }) => (
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            current_subscription: {
                                products: {
                                    [AUTOMATION_PRODUCT_ID]:
                                        basicMonthlyAutomationPlan.plan_id,
                                },
                                status: 'active',
                            },
                        }),
                    })}
                >
                    {children}
                </Provider>
            ),
        })
        expect(result.current).toEqual([
            integrationsState.integrations.find(
                ({ type }) => type === IntegrationType.BigCommerce,
            ),
            shopifyIntegration.toJS(),
            ...additionalIntegrations,
        ])
    })

    it('should return type filtered integrations', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useStoreIntegrations([IntegrationType.Shopify]),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual([shopifyIntegration.toJS()])
    })
})
