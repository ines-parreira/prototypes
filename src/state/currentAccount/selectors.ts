import {createSelector} from 'reselect'
import {fromJS, Map, List} from 'immutable'
import moment, {Moment} from 'moment-timezone'

import {RootState} from '../types'
import {toJS} from '../../utils'
import {isFeatureEnabled} from '../../utils/account'
import {getTimezone} from '../currentUser/selectors'

import {
    AccountFeature,
    AccountSettingBusinessHours,
    AccountSettingType,
    CurrentAccountState,
    ShopifyBillingStatus,
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
        (state) =>
            !!state.get(feature) && isFeatureEnabled(toJS(state.get(feature)))
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

// see specs on automation add-on pricing https://linear.app/gorgias/issue/COR-1252#comment-7d58ba65
// TODO: change date once the exact release is announced
export const hasAutomationLegacyFeatures = createSelector<
    RootState,
    boolean,
    Map<any, any>
>(getCurrentAccountState, (state) =>
    moment
        .utc(state.get('created_datetime'))
        .isBefore(moment.utc('2021-10-04T00:00:00Z'))
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
    ShopifyBillingStatus,
    Map<any, any>
>(getCurrentAccountMeta, (state) => {
    const billingMeta =
        (state.get('shopify_billing') as Map<any, any>) || fromJS({})
    if (billingMeta.get('active')) {
        return ShopifyBillingStatus.Active
    } else if (billingMeta.get('charge_id')) {
        return ShopifyBillingStatus.Canceled
    }

    return ShopifyBillingStatus.Inactive
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
            return (settings.find(
                (setting: Map<any, any>) => setting.get('type') === type
            ) || fromJS({})) as Map<any, any>
        }
    )
}

export const getSurveysSettings = createSettingByTypeSelector(
    AccountSettingType.SatisfactionSurveys
)
export const DEPRECATED_getBusinessHoursSettings = createSettingByTypeSelector(
    AccountSettingType.BusinessHours
)

export const getBusinessHoursSettings = createSelector<
    RootState,
    AccountSettingBusinessHours | undefined,
    Map<any, any>
>(createSettingByTypeSelector(AccountSettingType.BusinessHours), (setting) =>
    setting.isEmpty()
        ? undefined
        : (setting.toJS() as AccountSettingBusinessHours)
)

export const getBusinessHoursRangesByUserTimezone = createSelector<
    RootState,
    [Moment, Moment][] | undefined,
    AccountSettingBusinessHours | undefined,
    string | null
>(getBusinessHoursSettings, getTimezone, (setting, timezone) => {
    if (!setting) {
        return undefined
    }
    const dayIndex = timezone
        ? moment().tz(timezone).format('d')
        : moment().format('d')
    const ranges = setting.data.business_hours
        .reduce((acc: [Moment, Moment][], value) => {
            if (value.days.split(',').includes(dayIndex.toString())) {
                acc.push([
                    moment
                        .utc(value.from_time, 'HH:mm')
                        .tz(setting.data.timezone, true),
                    moment
                        .utc(value.to_time, 'HH:mm')
                        .tz(setting.data.timezone, true),
                ])
            }
            return acc
        }, [])
        .sort((range1, range2) => range1[0].valueOf() - range2[0].valueOf())

    if (ranges.length === 0) {
        return undefined
    }
    let lastRange: [Moment, Moment] | undefined
    return ranges
        .reduce((acc: [Moment, Moment][], value) => {
            if (!lastRange || value[0] > lastRange[1]) {
                lastRange = value
                acc.push(value)
            } else {
                if (value[1] > lastRange[1]) {
                    lastRange[1] = value[1]
                }
                if (value[0] < lastRange[0]) {
                    lastRange[0] = value[0]
                }
            }
            return acc
        }, [])
        .map((range) =>
            timezone ? [range[0].tz(timezone), range[1].tz(timezone)] : range
        )
})

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
export const getAccessSettings = createSettingByTypeSelector(
    AccountSettingType.Access
)
