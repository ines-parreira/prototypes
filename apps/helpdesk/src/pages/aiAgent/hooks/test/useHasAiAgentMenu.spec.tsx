import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import type { IntegrationBase } from 'models/integration/types/base'
import { useHasAiAgentMenu } from 'pages/aiAgent/hooks/useHasAiAgentMenu'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

const renderUseHasAiAgentMenu = (
    integrations: IntegrationBase[] = [],
    accountOverrides: Partial<typeof account> = {},
) => {
    const defaultState = {
        currentAccount: fromJS({ ...account, ...accountOverrides }),
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

    describe('when account is deactivated', () => {
        it('should be hidden regardless of integrations', () => {
            const { result } = renderUseHasAiAgentMenu([], {
                deactivated_datetime: '2025-01-01T00:00:00Z',
            })
            expect(result.current).toBe(false)
        })

        it('should be hidden even with Shopify integration', () => {
            const { result } = renderUseHasAiAgentMenu(
                [getIntegration(1, IntegrationType.Shopify) as any],
                { deactivated_datetime: '2025-01-01T00:00:00Z' },
            )
            expect(result.current).toBe(false)
        })

        it('should be hidden even with multiple integrations', () => {
            const { result } = renderUseHasAiAgentMenu(
                [
                    getIntegration(1, IntegrationType.Shopify) as any,
                    getIntegration(2, IntegrationType.Magento2) as any,
                ],
                { deactivated_datetime: '2025-01-01T00:00:00Z' },
            )
            expect(result.current).toBe(false)
        })
    })

    describe('when account is active', () => {
        it('should work normally when deactivated_datetime is null', () => {
            const { result } = renderUseHasAiAgentMenu(
                [getIntegration(1, IntegrationType.Shopify) as any],
                { deactivated_datetime: null },
            )
            expect(result.current).toBe(true)
        })

        it('should work normally when deactivated_datetime is undefined', () => {
            const { result } = renderUseHasAiAgentMenu(
                [getIntegration(1, IntegrationType.Shopify) as any],
                { deactivated_datetime: undefined },
            )
            expect(result.current).toBe(true)
        })
    })
})
