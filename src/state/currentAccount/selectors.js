import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

export const getCurrentAccountState = (state) => state.currentAccount || fromJS({})


export const getCurrentAccountMeta = createSelector(
    [getCurrentAccountState],
    state => state.get('meta') || fromJS({})
)

export const getAccountStatus = createSelector(
    [getCurrentAccountState],
    state => state.get('status') || fromJS({})
)

export const isAccountActive = createSelector(
    [getAccountStatus],
    state => state.get('status') === 'active'
)

export const getCurrentSubscription = createSelector(
    [getCurrentAccountState],
    state => state.get('current_subscription') || fromJS({})
)

export const hasCreditCard = createSelector(
    [getCurrentAccountMeta],
    state => state.get('hasCreditCard', false)
)

export const shouldPayWithShopify = createSelector(
    [getCurrentAccountMeta],
    state => state.get('should_pay_with_shopify', false)
)

export const doesPayWithShopify = createSelector(
    [getCurrentAccountMeta],
    state => state.getIn(['shopify_billing', 'active'], false)
)

export const paymentMethod = (state) => shouldPayWithShopify(state) ? 'shopify' : 'stripe'

export const paymentIsActive = (state) => {
    const currentPaymentMethod = paymentMethod(state)

    if (currentPaymentMethod === 'shopify') {
        return doesPayWithShopify(state)
    }

    return hasCreditCard(state)
}

export const getChatSettings = createSelector(
    [getCurrentAccountState],
    (account) => {
        const settings = account.get('settings') || fromJS([])
        return settings.find(setting => setting.get('type') === 'chat') || fromJS({})
    }
)
