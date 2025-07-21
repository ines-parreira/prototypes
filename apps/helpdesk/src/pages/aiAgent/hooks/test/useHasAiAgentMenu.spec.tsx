import React from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { IntegrationBase } from 'models/integration/types/base'
import { useHasAiAgentMenu } from 'pages/aiAgent/hooks/useHasAiAgentMenu'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import { RootState } from 'state/types'
import { mockStore } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const renderUseHasAiAgentMenu = (integrations: IntegrationBase[] = []) => {
    const defaultState = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
        integrations: fromJS({
            integrations: [...integrations],
        }),
    } as RootState

    return renderHook(() => useHasAiAgentMenu(), {
        wrapper: ({ children }) => (
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        ),
    })
}

describe('useHasAiAgentMenu', () => {
    it('should be visible when there is no store integration', () => {
        const { result } = renderUseHasAiAgentMenu()
        expect(result.current).toBe(true)
    })

    it('should be visible when there is only Shopify integration', () => {
        const { result } = renderUseHasAiAgentMenu([
            getIntegration(1, IntegrationType.Shopify) as any,
        ])
        expect(result.current).toBe(true)
    })

    it.each([
        {
            description: 'Magento integration',
            integrations: [getIntegration(2, IntegrationType.Magento2)],
        },
        {
            description: 'BigCommerce integration',
            integrations: [getIntegration(3, IntegrationType.BigCommerce)],
        },
        {
            description: 'Magento and BigCommerce integrations',
            integrations: [
                getIntegration(2, IntegrationType.Magento2),
                getIntegration(3, IntegrationType.BigCommerce),
            ],
        },
    ])(
        'should be visible when there are Shopify integration and $description',
        ({ integrations }) => {
            const { result } = renderUseHasAiAgentMenu([
                getIntegration(1, IntegrationType.Shopify) as any,
                ...integrations,
            ])
            expect(result.current).toBe(true)
        },
    )

    it.each([
        {
            description: 'Magento integration',
            integrations: [getIntegration(2, IntegrationType.Magento2)],
        },
        {
            description: 'BigCommerce integration',
            integrations: [getIntegration(3, IntegrationType.BigCommerce)],
        },
        {
            description: 'Magento and BigCommerce integrations',
            integrations: [
                getIntegration(2, IntegrationType.Magento2),
                getIntegration(3, IntegrationType.BigCommerce),
            ],
        },
    ])(
        'should be hidden when there is only $description',
        ({ integrations }) => {
            const { result } = renderUseHasAiAgentMenu([
                ...(integrations as any),
            ])
            expect(result.current).toBe(false)
        },
    )
})
