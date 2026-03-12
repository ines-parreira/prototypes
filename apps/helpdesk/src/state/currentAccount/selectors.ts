import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'
import { createSelector } from 'reselect'

import type {
    AccountFeature,
    AccountSettingAgentAvailabilityTableConfig,
    AccountSettingAgentCosts,
    AccountSettingAgentsTableConfig,
    AccountSettingAutoMerge,
    AccountSettingBusinessHours,
    AccountSettingChannelsTableConfig,
    AccountSettingDefaultIntegration,
    AccountSettingInTicketSuggestion,
    AccountSettingProductInsightsTableConfig,
    AccountSettingSatisfactionSurvey,
    AccountSettingViewsVisibility,
    ViewsOrderingAccountSetting,
} from 'state/currentAccount/types'
import {
    AccountSettingType,
    ShopifyBillingStatus,
} from 'state/currentAccount/types'
import { getTimezone } from 'state/currentUser/selectors'
import type { RootState } from 'state/types'
import { toJS } from 'utils'
import { isFeatureEnabled } from 'utils/account'

export const getCurrentAccountState = (state: RootState) =>
    state.currentAccount || fromJS({})

export const getAccountOwnerId = createSelector(
    getCurrentAccountState,
    (state) => state.get('user_id') as number,
)

export const getCurrentAccountId = createSelector(
    getCurrentAccountState,
    (state) => state.get('id') as number,
)

export const getCurrentAccountMeta = createSelector(
    getCurrentAccountState,
    (state) => (state.get('meta') as Map<any, any>) || fromJS({}),
)

export const getCurrentAccountCreatedDatetime = createSelector(
    getCurrentAccountState,
    (currentAccount) => currentAccount.get('created_datetime') as string,
)

export const getCurrentAccountFeatures = createSelector(
    getCurrentAccountState,
    (state) => (state.get('features') as Map<any, any>) || fromJS({}),
)

export const getCurrentDomain = createSelector(
    getCurrentAccountState,
    (state) => state.get('domain') as string,
)

export const currentAccountHasFeature = (feature: AccountFeature) =>
    createSelector(
        getCurrentAccountFeatures,
        (state) =>
            !!state.get(feature) && isFeatureEnabled(toJS(state.get(feature))),
    )

export const getAccountStatus = createSelector(
    getCurrentAccountState,
    (state) => (state.get('status') as Map<any, any>) || fromJS({}),
)

export const isAccountActive = createSelector(
    getAccountStatus,
    (state) => state.get('status') === 'active',
)

export const getCurrentSubscription = createSelector(
    getCurrentAccountState,
    (state) =>
        (state.get('current_subscription') as Map<any, any>) || fromJS({}),
)

export const getIsCurrentSubscriptionCanceled = createSelector(
    getCurrentSubscription,
    (state) => state.isEmpty(),
)

export const isTrialing = createSelector(
    getCurrentSubscription,
    (state) => state.get('status') === 'trialing',
)

export const getIsCurrentSubscriptionTrialingOrCanceled = createSelector(
    isTrialing,
    getIsCurrentSubscriptionCanceled,
    (trialing, canceled) => trialing || canceled,
)

export const hasCreditCard = createSelector(
    getCurrentAccountMeta,
    (state) => !!state.get('hasCreditCard'),
)

export const shouldPayWithShopify = createSelector(
    getCurrentAccountMeta,
    (state) => !!state.get('should_pay_with_shopify'),
)

export const getShopifyBillingStatus = createSelector(
    getCurrentAccountMeta,
    (state) => {
        const billingMeta =
            (state.get('shopify_billing') as Map<any, any>) || fromJS({})
        if (billingMeta.get('active')) {
            return ShopifyBillingStatus.Active
        } else if (billingMeta.get('charge_id')) {
            return ShopifyBillingStatus.Canceled
        }

        return ShopifyBillingStatus.Inactive
    },
)

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
    return createSelector(getCurrentAccountState, (account) => {
        const settings = (account.get('settings') as List<any>) || fromJS([])
        return (settings.find(
            (setting: Map<any, any>) => setting.get('type') === type,
        ) || fromJS({})) as Map<any, any>
    })
}

export const getAgentsTableConfigSettings = createSettingByTypeSelector(
    AccountSettingType.AgentsTableConfig,
)

export const getAgentsTableConfigSettingsJS = createSelector(
    getAgentsTableConfigSettings,
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingAgentsTableConfig),
)

export const getAgentAvailabilityTableConfigSettings =
    createSettingByTypeSelector(AccountSettingType.AgentAvailabilityTableConfig)

export const getAgentAvailabilityTableConfigSettingsJS = createSelector(
    getAgentAvailabilityTableConfigSettings,
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingAgentAvailabilityTableConfig),
)

export const getChannelsTableConfigSettings = createSettingByTypeSelector(
    AccountSettingType.ChannelsTableConfig,
)

export const getChannelsTableConfigSettingsJS = createSelector(
    getChannelsTableConfigSettings,
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingChannelsTableConfig),
)

export const getProductInsightsTableConfigSettings =
    createSettingByTypeSelector(AccountSettingType.ProductInsightsTableConfig)

export const getProductInsightsTableConfigSettingsJS = createSelector(
    getProductInsightsTableConfigSettings,
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingProductInsightsTableConfig),
)

export const getSurveysSettings = createSettingByTypeSelector(
    AccountSettingType.SatisfactionSurveys,
)

export const getSurveysSettingsJS = createSelector(
    getSurveysSettings,
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingSatisfactionSurvey),
)

export const getAgentCostsSettings = createSelector(
    createSettingByTypeSelector(AccountSettingType.AgentCosts),
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingAgentCosts),
)

/**
 * @deprecated
 * @date 2021-08-21
 * @type feature-helper-fn
 */
export const DEPRECATED_getBusinessHoursSettings = createSettingByTypeSelector(
    AccountSettingType.BusinessHours,
)

export const getBusinessHoursSettings = createSelector(
    createSettingByTypeSelector(AccountSettingType.BusinessHours),
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingBusinessHours),
)

export const getViewsVisibilitySettings = createSelector(
    createSettingByTypeSelector(AccountSettingType.ViewsVisibility),
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingViewsVisibility),
)

export const getAutoMergeSettings = createSelector(
    createSettingByTypeSelector(AccountSettingType.AutoMerge),
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingAutoMerge),
)

export const getBusinessHoursRangesByUserTimezone = createSelector(
    getBusinessHoursSettings,
    getTimezone,
    (setting, timezone) => {
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
                timezone
                    ? [range[0].tz(timezone), range[1].tz(timezone)]
                    : range,
            )
    },
)

export const getTicketAssignmentSettings = createSettingByTypeSelector(
    AccountSettingType.TicketAssignment,
)

export const getLimitsSetting = createSettingByTypeSelector(
    AccountSettingType.Limits,
)

/**
 * @deprecated
 * @date 2021-08-06
 * @type feature-helper-fn
 */
export const DEPRECATED_getViewsOrderingSetting = createSettingByTypeSelector(
    AccountSettingType.ViewsOrdering,
)
export const getViewsOrderingSetting = createSelector(
    DEPRECATED_getViewsOrderingSetting,
    (setting) => setting.toJS() as ViewsOrderingAccountSetting,
)
export const getAccessSettings = createSettingByTypeSelector(
    AccountSettingType.Access,
)

export const getDefaultIntegrationSettings = createSelector(
    createSettingByTypeSelector(AccountSettingType.DefaultIntegration),
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingDefaultIntegration),
)

export const getTwoFAEnforcedDatetime = createSelector(
    getAccessSettings,
    (setting) =>
        setting.getIn(['data', 'two_fa_enforced_datetime']) as string | null,
)
export const is2FAEnforcedSelector = createSelector(
    getTwoFAEnforcedDatetime,
    (twoFAEnforcedDatetime) => !!twoFAEnforcedDatetime,
)

export const getSsoEnforcedDatetime = createSelector(
    getAccessSettings,
    (setting) =>
        setting.getIn(['data', 'sso_enforced_datetime']) as string | null,
)
export const isSsoEnforcedSelector = createSelector(
    getSsoEnforcedDatetime,
    (ssoEnforcedDatetime) => !!ssoEnforcedDatetime,
)

export const getInTicketSuggestionSettings = createSelector(
    createSettingByTypeSelector(AccountSettingType.InTicketSuggestion),
    (setting) =>
        setting.isEmpty()
            ? undefined
            : (setting.toJS() as AccountSettingInTicketSuggestion),
)
