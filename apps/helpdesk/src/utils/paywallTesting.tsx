import { fromJS } from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'

import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsStateWithShopify } from 'fixtures/integrations'
import {
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    products,
} from 'fixtures/productPrices'
import type { HelpdeskPlan, Product, ProductType } from 'models/billing/types'
import type { RootState } from 'state/types'

export const getStateWithHelpdeskPlan = (
    helpdeskPlan: HelpdeskPlan = basicMonthlyHelpdeskPlan,
) => {
    const productsWithExtraPrice = _cloneDeep(products)
    const helpdeskProduct =
        productsWithExtraPrice[0] as Product<ProductType.Helpdesk>
    helpdeskProduct.prices.push(helpdeskPlan)

    return {
        integrations: fromJS(integrationsStateWithShopify),
        stats: initialState,
        billing: fromJS({ ...billingState, products: productsWithExtraPrice }),
        currentAccount: fromJS({
            current_subscription: {
                ...account.current_subscription,
                products: {
                    [HELPDESK_PRODUCT_ID]: helpdeskPlan.plan_id,
                },
            },
        }),
    } as RootState
}
