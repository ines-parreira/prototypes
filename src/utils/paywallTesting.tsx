import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'
import {HelpdeskPlan} from 'models/billing/types'
import {
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    products,
} from 'fixtures/productPrices'
import {billingState} from 'fixtures/billing'
import {account} from 'fixtures/account'
import {initialState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {integrationsStateWithShopify} from 'fixtures/integrations'

export const getStateWithPrice = (
    price: HelpdeskPlan = basicMonthlyHelpdeskPrice
) => {
    const productsWithExtraPrice = _cloneDeep(products)
    productsWithExtraPrice[0].prices.push(price)

    return {
        integrations: fromJS(integrationsStateWithShopify),
        stats: initialState,
        billing: fromJS({...billingState, products: productsWithExtraPrice}),
        currentAccount: fromJS({
            current_subscription: {
                ...account.current_subscription,
                products: {
                    [HELPDESK_PRODUCT_ID]: price.price_id,
                },
            },
        }),
    } as RootState
}
