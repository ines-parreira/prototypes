import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { useHasMagentoOrBigCommerceIntegration } from 'hooks/useHasMagentoOrBigCommerceIntegration'
import { IntegrationType } from 'models/integration/constants'
import { IntegrationBase } from 'models/integration/types/base'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

const renderUseHasMagentoOrBigCommerceIntegration = (
    integrations: IntegrationBase[],
) => {
    const defaultState = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
        integrations: fromJS({
            integrations: [...integrations],
        }),
    } as RootState

    return renderHook(() => useHasMagentoOrBigCommerceIntegration(), {
        wrapper: ({ children }) => (
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        ),
    })
}

describe('useHasMagentoOrBigCommerceIntegration', () => {
    it('should return false if the account has no Magento/BigCommerce integration', () => {
        const { result } = renderUseHasMagentoOrBigCommerceIntegration([
            getIntegration(1, IntegrationType.Shopify) as any,
        ])
        expect(result.current).toBe(false)
    })

    it('should return true if the account has a Magento integration', () => {
        const { result } = renderUseHasMagentoOrBigCommerceIntegration([
            getIntegration(1, IntegrationType.Magento2) as any,
        ])
        expect(result.current).toBe(true)
    })

    it('should return true if the account has a BigCommerce integration', () => {
        const { result } = renderUseHasMagentoOrBigCommerceIntegration([
            getIntegration(1, IntegrationType.BigCommerce) as any,
        ])
        expect(result.current).toBe(true)
    })

    it('should return true if the account has a Magento2 and a BigCommerce integration', () => {
        const { result } = renderUseHasMagentoOrBigCommerceIntegration([
            getIntegration(1, IntegrationType.BigCommerce) as any,
            getIntegration(2, IntegrationType.Magento2) as any,
        ])
        expect(result.current).toBe(true)
    })
})
