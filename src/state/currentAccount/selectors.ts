import {createSelector} from 'reselect'
import {fromJS, Map, List} from 'immutable'

import {RootState} from '../types'
import {toJS} from '../../utils'
import {isFeatureEnabled} from '../../utils/account'

import {
    AccountFeature,
    AccountSettingType,
    CurrentAccountState,
    ViewsOrderingAccountSetting,
} from './types'

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

export const getCurrentAccountFeatures = createSelector<
    RootState,
    Map<any, any>,
    CurrentAccountState
>(
    getCurrentAccountState,
    (state) => (state.get('features') as Map<any, any>) || fromJS({})
)

export const currentAccountHasFeature = (feature: AccountFeature) =>
    createSelector<RootState, boolean, Map<any, any>>(
        getCurrentAccountFeatures,
        (state) => isFeatureEnabled(toJS(state.get(feature)))
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

const createSettingByTypeSelector = (type: string) => {
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

export const getSurveysSettings = createSettingByTypeSelector(
    AccountSettingType.SatisfactionSurveys
)
export const getBusinessHoursSettings = createSettingByTypeSelector(
    AccountSettingType.BusinessHours
)
export const getTicketAssignmentSettings = createSettingByTypeSelector(
    AccountSettingType.TicketAssignment
)
export const DEPRECATED_getViewsOrderingSetting = createSettingByTypeSelector(
    AccountSettingType.ViewsOrdering
)
export const getViewsOrderingSetting = createSelector<
    RootState,
    ViewsOrderingAccountSetting | Record<string, unknown>,
    Map<any, any>
>(
    DEPRECATED_getViewsOrderingSetting,
    (setting) =>
        setting.toJS() as ViewsOrderingAccountSetting | Record<string, unknown>
)
