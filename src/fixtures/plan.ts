import {PlanInterval, Plan} from '../models/billing/types'
import {AccountFeature} from '../state/currentAccount/types'

const planFixture: Plan = {
    id: 'pro-yearly-usd-2',
    cost_per_ticket: 0.23,
    interval: PlanInterval.Year,
    public: true,
    name: 'Pro',
    trial_period_days: 7,
    order: 2,
    currency: 'usd',
    free_tickets: 300,
    limits: {
        tickets: {
            min: 300,
            default: 350,
            max: 350,
        },
        messages: {
            min: 800,
            default: 1000,
            max: 1000,
        },
    },
    amount: 300000,
    integrations: 150,
    features: {
        [AccountFeature.AutoAssignment]: true,
        [AccountFeature.FacebookComment]: true,
        [AccountFeature.ChatCampaigns]: true,
        [AccountFeature.InstagramComment]: true,
        [AccountFeature.PhoneIntegration]: true,
        [AccountFeature.MagentoIntegration]: true,
        [AccountFeature.YotpoIntegration]: true,
        [AccountFeature.RevenueStatistics]: false,
        [AccountFeature.SatisfactionSurveys]: true,
        [AccountFeature.Teams]: true,
        [AccountFeature.UserRoles]: true,
        [AccountFeature.ViewSharing]: false,
    },
}

export default planFixture
