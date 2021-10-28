import {ReactElement} from 'react'

import {AccountFeature} from '../state/currentAccount/types'

const assetsURL = window.GORGIAS_ASSETS_URL || ''

export type PaywallConfig = {
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
        header: 'Track customer satisfaction',
        description:
            'Send surveys to customers after your team has assisted them to monitor how well your support team is doing.',
        testimonial: {
            author: {
                name: 'Katelyn Chaffee',
                avatar: `${assetsURL}/static/private/img/paywalls/avatars/katelyn-chaffee.png`,
                position: 'Customer Experience Manager',
                company: {
                    name: 'jane iredale',
                    href: 'https://janeiredale.com/',
                },
            },
            text:
                'We recognize the importance of above and beyond customer service. The satisfaction survey ensures we’re staying on track with our service expectations, and also gives the team the pick-me-up kudos they deserve!',
        },
        preview: `${assetsURL}/static/private/img/paywalls/screens/satisfaction-surveys.png`,
    },
    [AccountFeature.RevenueStatistics]: {
        header: 'Track revenue from support',
        description:
            'Uncover upsell opportunities, track revenue generated per agents to compensate your team based on actual sales.',
        preview: `${assetsURL}/static/private/img/paywalls/screens/revenue-statistics.png`,
    },
    [AccountFeature.OverviewLiveStatistics]: {
        header: 'Track support in real time',
        description:
            'Get a live bird’s-eye view of your support team, including agent status, open tickets, and customers waiting longest for support to recognize and mitigate issues before they happen.',
        preview: `${assetsURL}/static/private/img/paywalls/screens/live-overview-statistic.png`,
    },
    [AccountFeature.UsersLiveStatistics]: {
        header: 'Track support in real time',
        description:
            'Track your agents in real-time. See how long they have been online, how many tickets have been assigned to them and the work they have accomplished over a given day.',
        preview: `${assetsURL}/static/private/img/paywalls/screens/live-agents-statistic.png`,
    },
}
