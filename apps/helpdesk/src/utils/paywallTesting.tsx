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
} from 'fixtures/plans'
import type {
    AvailablePlansOf,
    HelpdeskPlan,
    ProductType,
} from 'models/billing/types'
import type { RootState } from 'state/types'

export const getStateWithHelpdeskPlan = (
    helpdeskPlan: HelpdeskPlan = basicMonthlyHelpdeskPlan,
) => {
    const productsWithExtraPlan = _cloneDeep(products)
    const helpdeskProduct =
        productsWithExtraPlan[0] as AvailablePlansOf<ProductType.Helpdesk>
    helpdeskProduct.prices.push(helpdeskPlan)

    return {
        integrations: fromJS(integrationsStateWithShopify),
        stats: initialState,
        billing: fromJS({ ...billingState, products: productsWithExtraPlan }),
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
