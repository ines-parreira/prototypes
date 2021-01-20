import {
    Account,
    AccountFeatures,
    AccountSettingType,
    AccountStatus,
} from '../state/currentAccount/types'

export const account: Account = {
    current_subscription: {
        trial_start_datetime: '2017-08-23T01:38:53+00:00',
        trial_end_datetime: '2017-09-06T01:38:53+00:00',
        plan: 'team-usd-1',
        status: 'trialing',
        start_datetime: '2017-08-23T01:38:53+00:00',
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
        [AccountFeatures.AutoAssignment]: true,
        [AccountFeatures.FacebookComment]: true,
        [AccountFeatures.ChatCampaigns]: true,
        [AccountFeatures.InstagramComment]: true,
        [AccountFeatures.MagentoIntegration]: true,
        [AccountFeatures.RevenueStatistics]: true,
        [AccountFeatures.SatisfactionSurveys]: true,
        [AccountFeatures.Teams]: true,
        [AccountFeatures.UserRoles]: true,
        [AccountFeatures.ViewSharing]: true,
    },
}
