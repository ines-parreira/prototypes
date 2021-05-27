import React, {ReactElement} from 'react'

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
    [AccountFeature.AutoAssignment]: {
        header: 'Auto-assign tickets with teams',
        description:
            'As your team grows, free for all doesn’t work anymore. You waste time manually assigning tickets and cherry picking becomes an issue. \nStart using teams to automatically assign tickets to agents.',
        testimonial: {
            author: {
                name: 'Amir Mot',
                avatar: `${assetsURL}/static/private/img/paywalls/avatars/amir-mot.png`,
                position: 'CEO',
                company: {
                    name: 'Bradza',
                    href: 'https://www.bradza.com/',
                },
            },
            text:
                'With Auto-assign, we have been able to utilize rules to assign tickets to certain teams based on the ticket parameters. It has saved us time instead of having our lead agents manually assigning tickets to teams based on the ticket request type.',
        },
        preview: `${assetsURL}/static/private/img/paywalls/screens/auto-assignment.png`,
    },
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
    [AccountFeature.Teams]: {
        header: 'Organize your agents with Teams ',
        description:
            'As your support team grows, it becomes crucial to optimize your helpdesk for team collaboration. Starting using teams to auto-assign tickets and share views across groups of agents.',
        preview: `${assetsURL}/static/private/img/paywalls/screens/auto-assignment.png`,
    },
    [AccountFeature.UserRoles]: {
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
    [AccountFeature.ChatCampaigns]: {
        header: 'Convert your visitors',
        description:
            'Drive revenue through proactive customer engagement with Chat campaigns.',
        testimonial: {
            author: {
                name: 'Ashley Gonzalez',
                avatar: `${assetsURL}/static/private/img/paywalls/avatars/ashley-gonzalez.png`,
                position: 'Community Manager',
                company: {
                    name: 'Posh Peanut',
                    href: 'https://poshpeanut.com/',
                },
            },
            text:
                'Chat Campaigns have made it easy for us to reach our customers when they need help the most. We saw 4X the chat tickets after implementing a couple of chat campaigns.',
        },
        preview: `${assetsURL}/static/private/img/paywalls/screens/chat-campaigns.png`,
    },
}
