import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'

import {account} from 'fixtures/account'
import {
    CONVERT_PRODUCT_ID,
    convertPlan1,
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPlan,
    products,
    SMS_PRODUCT_ID,
    smsPlan1,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/productPrices'
import {RootState, StoreDispatch} from 'state/types'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

export const storeWithCanceledSubscription = mockedStore({
    currentAccount: fromJS({
        ...account,
        current_subscription: null,
    }),
    billing: fromJS({
        invoices: [],
        products,
        currentProductsUsage: {},
    }),
})

export const storeWithActiveSubscriptionWithConvert = mockedStore({
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: legacyBasicHelpdeskPlan.price_id,
                [CONVERT_PRODUCT_ID]: convertPlan1.price_id,
            },
        },
    }),
    billing: fromJS({invoices: [], products, currentProductsUsage: {}}),
})

export const storeWithActiveSubscriptionWithPhone = mockedStore({
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: legacyBasicHelpdeskPlan.price_id,
                [CONVERT_PRODUCT_ID]: convertPlan1.price_id,
                [SMS_PRODUCT_ID]: smsPlan1.price_id,
                [VOICE_PRODUCT_ID]: voicePlan1.price_id,
            },
        },
    }),
    billing: fromJS({invoices: [], products, currentProductsUsage: {}}),
})
