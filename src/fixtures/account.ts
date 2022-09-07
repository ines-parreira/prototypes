import {
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
    AUTOMATION_PRODUCT_ID,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {
    Account,
    AccountFeature,
    AccountSettingType,
    AccountStatus,
} from 'state/currentAccount/types'

export const account: Account = {
    id: 1,
    current_subscription: {
        trial_start_datetime: '2017-08-23T01:38:53+00:00',
        trial_end_datetime: '2017-09-06T01:38:53+00:00',
        plan: 'team-usd-1',
        status: 'trialing',
        start_datetime: '2017-08-23T01:38:53+00:00',
        products: {
            [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
        },
    },
    created_datetime: '2017-08-23T01:38:52.479339+00:00',
    deactivated_datetime: null,
    domain: 'acme',
    meta: {},
    settings: [
        {
            id: 2,
            type: AccountSettingType.BusinessHours,
            data: {
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '00:00',
                        to_time: '01:00',
                    },
                    {
                        days: '7',
                        from_time: '07:00',
                        to_time: '22:00',
                    },
                ],
                timezone: 'US/Pacific',
            },
        },
    ],
    status: {
        status: AccountStatus.Active,
    },
    stripe_id: 'cus_BGKUKAzUbK1bix',
    user_id: 1,
    features: {
        [AccountFeature.Api1stPartyRateLimit]: {enabled: true},
        [AccountFeature.Api3rdPartyRateLimit]: {enabled: true},
        [AccountFeature.AutoAssignment]: {enabled: true},
        [AccountFeature.FacebookComment]: {enabled: true},
        [AccountFeature.ChatCampaigns]: {enabled: true},
        [AccountFeature.InstagramComment]: {enabled: true},
        [AccountFeature.InstagramDirectMessage]: {enabled: true},
        [AccountFeature.UsersLiveStatistics]: {enabled: true},
        [AccountFeature.OverviewLiveStatistics]: {enabled: true},
        [AccountFeature.PhoneNumber]: {enabled: true, limit: 5},
        [AccountFeature.TwitterIntegration]: {enabled: true, limit: 2},
        [AccountFeature.MagentoIntegration]: {enabled: true},
        [AccountFeature.YotpoIntegration]: {enabled: true},
        [AccountFeature.RevenueStatistics]: {enabled: true},
        [AccountFeature.SatisfactionSurveys]: {enabled: true},
        [AccountFeature.Teams]: {enabled: true},
        [AccountFeature.UserRoles]: {enabled: true},
        [AccountFeature.ViewSharing]: {enabled: true},
        [AccountFeature.HelpCenter]: {enabled: true},
        [AccountFeature.AutomationManagedRules]: {enabled: true},
        [AccountFeature.AutomationTrackOrderFlow]: {enabled: true},
        [AccountFeature.AutomationReportIssueFlow]: {enabled: true},
        [AccountFeature.AutomationCancellationsFlow]: {enabled: true},
        [AccountFeature.AutomationReturnFlow]: {enabled: true},
        [AccountFeature.AutomationSelfServiceStatistics]: {enabled: true},
    },
}

export const automationSubscriptionProductPrices = {
    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
    [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPrice.price_id,
}
