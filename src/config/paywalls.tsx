import React, {ReactElement} from 'react'

import {AccountFeatures} from '../state/currentAccount/types'

const assetsURL = window.GORGIAS_ASSETS_URL || ''

type PaywallConfig = {
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

export const paywallConfigs: {
    [key in typeof AccountFeatures[keyof typeof AccountFeatures]]?: PaywallConfig
} = {
    [AccountFeatures.AutoAssignment]: {
        header: 'Auto-assign tickets with teams',
        description:
            'As your team grows, free for all doesn’t work anymore. You waste time manually assigning tickets and cherry picking becomes an issue. \nStart using teams to automatically assign tickets to agents.',
        testimonial: {
            author: {
                name: 'Alyse Nathan',
                avatar: `${assetsURL}/static/private/img/paywalls/avatars/alyse-nathan.png`,
                position: 'Director of customer Service',
                company: {
                    name: 'Steve Madden',
                    href: 'https://www.stevemadden.com/',
                },
            },
            text:
                'With Auto-assign, tickets are automatically routed to the right person, based on tags and brand. This way, we respond to customers much faster.',
        },
        preview: `${assetsURL}/static/private/img/paywalls/screens/auto-assignment.png`,
    },
    [AccountFeatures.SatisfactionSurveys]: {
        header: 'Track customer satisfaction',
        description:
            'Send surveys to customers after your team has assisted them to monitor how well your support team is doing.',
        testimonial: {
            author: {
                name: 'Jonathan Ward',
                avatar: `${assetsURL}/static/private/img/paywalls/avatars/jonathan-ward.png`,
                position: 'Customer service lead',
                company: {
                    name: 'GrooveLife',
                    href: 'https://groovelife.com/',
                },
            },
            text:
                'Satisfaction surveys allows us to track the individual performance of each agent and to track the quality of our customer service.',
        },
        preview: `${assetsURL}/static/private/img/paywalls/screens/satisfaction-surveys.png`,
    },
    [AccountFeatures.RevenueStatistics]: {
        header: 'Track revenue from support',
        description:
            'Uncover upsell opportunities, track revenue generated per agents to compensate your team based on actual sales.',
        testimonial: {
            author: {
                name: 'Jonathan Ward',
                avatar: `${assetsURL}/static/private/img/paywalls/avatars/jonathan-ward.png`,
                position: 'Customer service lead',
                company: {
                    name: 'GrooveLife',
                    href: 'https://groovelife.com/',
                },
            },
            text:
                'At Groovelife, our agents upsell customers when they start a return or exchange. We’ve been able to offset a third of the customer service team budget.',
        },
        preview: `${assetsURL}/static/private/img/paywalls/screens/revenue-statistics.png`,
    },
    [AccountFeatures.Teams]: {
        header: 'Organize your agents with Teams ',
        description:
            'As your support team grows, it becomes crucial to optimize your helpdesk for team collaboration. Starting using teams to auto-assign tickets and share views across groups of agents.',
        preview: `${assetsURL}/static/private/img/paywalls/screens/auto-assignment.png`,
    },
    [AccountFeatures.UserRoles]: {
        header: 'Limit user capabilities with precision',
        description: (
            <div>
                Upgrade to a pro plan to enable user permissions, allowing you
                to limit the abilities of a user. You can learn more about the
                different roles that you can assign to users in{' '}
                <a
                    href="https://docs.gorgias.com/user/adding-team-members#user_permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    this article
                </a>
            </div>
        ),
    },
    [AccountFeatures.ChatCampaigns]: {
        header: 'Convert your visitors',
        description:
            'Drive revenue through proactive customer engagement with Chat campaigns.',
        testimonial: {
            author: {
                name: 'Alyse Nathan',
                avatar: `${assetsURL}/static/private/img/paywalls/avatars/alyse-nathan.png`,
                position: 'Director of customer Service',
                company: {
                    name: 'Steve Madden',
                    href: 'https://www.stevemadden.com/',
                },
            },
            text:
                'With Chat campaigns, we’ve increased out website conversation by 5% and identified the top objections customers have when they see a product.',
        },
        preview: `${assetsURL}/static/private/img/paywalls/screens/chat-campaigns.png`,
    },
}
