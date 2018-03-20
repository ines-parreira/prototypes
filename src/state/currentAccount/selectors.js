// @flow
import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

// types
import type {stateType} from '../types'

export const getCurrentAccountState = (state: stateType) => state.currentAccount || fromJS({})

export const getCurrentAccountMeta = createSelector(
    [getCurrentAccountState],
    (state) => state.get('meta') || fromJS({})
)

export const getAccountStatus = createSelector(
    [getCurrentAccountState],
    (state) => state.get('status') || fromJS({})
)

export const isAccountActive = createSelector(
    [getAccountStatus],
    (state) => state.get('status') === 'active'
)

export const getCurrentSubscription = createSelector(
    [getCurrentAccountState],
    (state) => state.get('current_subscription') || fromJS({})
)

export const isTrialing = createSelector(
    [getCurrentSubscription],
    (state) => state.get('status') === 'trialing'
)

export const hasCreditCard = createSelector(
    [getCurrentAccountMeta],
    (state) => state.get('hasCreditCard', false)
)

export const shouldPayWithShopify = createSelector(
    [getCurrentAccountMeta],
    (state) => state.get('should_pay_with_shopify') || false
)

export const getShopifyBillingStatus = createSelector(
    [getCurrentAccountMeta],
    (state) => {
        const billingMeta = state.get('shopify_billing') || fromJS({})
        if (billingMeta.get('active')) {
            return 'active'
        } else if (billingMeta.get('charge_id')) {
            return 'canceled'
        }

        return 'inactive'
    }
)

export const paymentMethod = (state: stateType) => shouldPayWithShopify(state) ? 'shopify' : 'stripe'

export const paymentIsActive = (state: stateType) => {
    const currentPaymentMethod = paymentMethod(state)

    if (currentPaymentMethod === 'shopify') {
        return getShopifyBillingStatus(state) === 'active'
    }

    return hasCreditCard(state)
}

export const getChatSettings = createSelector(
    [getCurrentAccountState],
    (account) => {
        const settings = account.get('settings') || fromJS([])
        return settings.find((setting) => setting.get('type') === 'chat') || fromJS({})
    }
)
