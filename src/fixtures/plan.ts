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
    automation_addon_equivalent_plan: 'pro-automation-yearly-usd-2',
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
        [AccountFeature.AutoAssignment]: {enabled: true},
        [AccountFeature.FacebookComment]: {enabled: true},
        [AccountFeature.ChatCampaigns]: {enabled: true},
        [AccountFeature.InstagramComment]: {enabled: true},
        [AccountFeature.InstagramDirectMessage]: {enabled: true},
        [AccountFeature.OverviewLiveStatistics]: {enabled: false},
        [AccountFeature.UsersLiveStatistics]: {enabled: false},
        [AccountFeature.PhoneNumber]: {enabled: true, limit: 50},
        [AccountFeature.TwitterIntegration]: {enabled: false, limit: 0},
        [AccountFeature.MagentoIntegration]: {enabled: true},
        [AccountFeature.YotpoIntegration]: {enabled: true},
        [AccountFeature.RevenueStatistics]: {enabled: false},
        [AccountFeature.SatisfactionSurveys]: {enabled: true},
        [AccountFeature.Teams]: {enabled: true},
        [AccountFeature.UserRoles]: {enabled: true},
        [AccountFeature.ViewSharing]: {enabled: false},
        [AccountFeature.HelpCenter]: {enabled: true},
        [AccountFeature.AutomationTrackOrderFlow]: {enabled: false},
        [AccountFeature.AutomationReportIssueFlow]: {enabled: false},
        [AccountFeature.AutomationCancellationsFlow]: {enabled: false},
        [AccountFeature.AutomationReturnFlow]: {enabled: false},
        [AccountFeature.AutomationSelfServiceStatistics]: {enabled: false},
    },
}

export default planFixture
