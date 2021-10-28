import {ReactElement} from 'react'

import {AccountFeature} from '../state/currentAccount/types'

const assetsURL = window.GORGIAS_ASSETS_URL || ''

export type PaywallConfig = {
    pageHeader?: string
    header: string
    description: string | ReactElement
    testimonial?: {
        author: {
            name: string
            avatar: string
            position: string
            company: {
                name: string
                href: string
            }
        }
        text: string
    }
    preview?: string
}

export const paywallConfigs: Partial<Record<AccountFeature, PaywallConfig>> = {
    [AccountFeature.SatisfactionSurveys]: {
        pageHeader: 'Satisfaction',
        header: 'Track customer satisfaction',
        description:
            'Send surveys to customers after your team has assisted them to monitor how well your support team is doing.',
        preview: `${assetsURL}/static/private/img/paywalls/screens/satisfaction-surveys.png`,
    },
    [AccountFeature.RevenueStatistics]: {
        pageHeader: 'Revenue',
        header: 'Track revenue from support',
        description:
            'Uncover upsell opportunities, track revenue generated per agents to compensate your team based on actual sales.',
        testimonial: {
            author: {
                name: 'Cody Szymanski',
                avatar: `${assetsURL}/static/private/img/paywalls/avatars/cody-szymanski.png`,
                position: 'Customer Experience Manager',
                company: {
                    name: 'Shinesty',
                    href: 'https://www.shinesty.com/',
                },
            },
            text:
                'At Shinesty, our agents convert visitors into customers by using pre-sell questions sent via chat campaigns. I see the concrete results of our actions thanks to Revenue Statistics.',
        },
        preview: `${assetsURL}/static/private/img/paywalls/screens/revenue-statistics.png`,
    },
    [AccountFeature.OverviewLiveStatistics]: {
        pageHeader: 'Live overview',
        header: 'Track support in real time',
        description:
            'Get a live bird’s-eye view of your support team, including agent status, open tickets, and customers waiting longest for support to recognize and mitigate issues before they happen.',
        preview: `${assetsURL}/static/private/img/paywalls/screens/live-overview-statistic.png`,
    },
    [AccountFeature.UsersLiveStatistics]: {
        pageHeader: 'Live agents',
        header: 'Track support in real time',
        description:
            'Track your agents in real-time. See how long they have been online, how many tickets have been assigned to them and the work they have accomplished over a given day.',
        preview: `${assetsURL}/static/private/img/paywalls/screens/live-agents-statistic.png`,
    },
}
