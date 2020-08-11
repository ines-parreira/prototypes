import {createSelector} from 'reselect'
import {fromJS, Map, List} from 'immutable'

import {RootState} from '../types'

import * as constants from './constants.js'
import {CurrentAccountState} from './types'

// types

export const getCurrentAccountState = (state: RootState) =>
    state.currentAccount || fromJS({})

export const getCurrentAccountMeta = createSelector<
    RootState,
    Map<any, any>,
    CurrentAccountState
>(
    getCurrentAccountState,
    (state) => (state.get('meta') as Map<any, any>) || fromJS({})
)

export const getAccountStatus = createSelector<
    RootState,
    Map<any, any>,
    CurrentAccountState
>(
    getCurrentAccountState,
    (state) => (state.get('status') as Map<any, any>) || fromJS({})
)

export const isAccountActive = createSelector<
    RootState,
    boolean,
    Map<any, any>
>(getAccountStatus, (state) => state.get('status') === 'active')

export const getCurrentSubscription = createSelector<
    RootState,
    Map<any, any>,
    CurrentAccountState
>(
    getCurrentAccountState,
    (state) =>
        (state.get('current_subscription') as Map<any, any>) || fromJS({})
)

export const isTrialing = createSelector<RootState, boolean, Map<any, any>>(
    getCurrentSubscription,
    (state) => state.get('status') === 'trialing'
)

export const hasCreditCard = createSelector<RootState, boolean, Map<any, any>>(
    getCurrentAccountMeta,
    (state) => !!state.get('hasCreditCard')
)

export const shouldPayWithShopify = createSelector<
    RootState,
    boolean,
    Map<any, any>
>(getCurrentAccountMeta, (state) => !!state.get('should_pay_with_shopify'))

export const getShopifyBillingStatus = createSelector<
    RootState,
    string,
    Map<any, any>
>(getCurrentAccountMeta, (state) => {
    const billingMeta =
        (state.get('shopify_billing') as Map<any, any>) || fromJS({})
    if (billingMeta.get('active')) {
        return 'active'
    } else if (billingMeta.get('charge_id')) {
        return 'canceled'
    }

    return 'inactive'
})

export const paymentMethod = (state: RootState) =>
    shouldPayWithShopify(state) ? 'shopify' : 'stripe'

export const paymentIsActive = (state: RootState) => {
    const currentPaymentMethod = paymentMethod(state)

    if (currentPaymentMethod === 'shopify') {
        return getShopifyBillingStatus(state) === 'active'
    }

    return hasCreditCard(state)
}

export const getSettingsByType = (type: string) => {
    return createSelector<RootState, Map<any, any>, CurrentAccountState>(
        getCurrentAccountState,
        (account) => {
            const settings =
                (account.get('settings') as List<any>) || fromJS([])
            return (
                (settings.find(
                    (setting: Map<any, any>) => setting.get('type') === type
                ) as Map<any, any>) || fromJS({})
            )
        }
    )
}

export const getSurveysSettings = getSettingsByType(
    constants.SETTING_TYPE_SATISFACTION_SURVEYS
)
export const getBusinessHoursSettings = getSettingsByType(
    constants.SETTING_TYPE_BUSINESS_HOURS
)
export const getTicketAssignmentSettings = getSettingsByType(
    constants.SETTING_TYPE_TICKET_ASSIGNMENT
)
