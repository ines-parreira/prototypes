import React, {ReactElement, ReactNode} from 'react'

import {assetsUrl} from 'utils'
import {
    PaywallTheme,
    UpgradeType,
} from 'pages/common/components/Paywall/Paywall'
import Button from 'pages/common/components/button/Button'
import {AccountFeature} from 'state/currentAccount/types'
import {
    GORGIAS_AUTOMATE_BADGE,
    PAGE_TITLE_AUTOMATE_PAYWALL,
} from 'pages/stats/self-service/constants'
import {
    VOICE_LEARN_MORE_URL,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'

export type PaywallConfig = {
    pageHeader?: ReactNode
    paywallTheme?: PaywallTheme
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
    preview: string
    requiredUpgrade?: string
    upgradeType?: UpgradeType
    customCta?: ReactNode
}

export const paywallConfigs: Partial<Record<AccountFeature, PaywallConfig>> = {
    [AccountFeature.SatisfactionSurveys]: {
        pageHeader: 'Satisfaction',
        header: 'Track customer satisfaction',
        description:
            'Send surveys to customers after your team has assisted them to monitor how well your support team is doing.',
        preview: assetsUrl('/img/paywalls/screens/satisfaction-surveys.png'),
    },
    [AccountFeature.RevenueStatistics]: {
        pageHeader: 'Revenue',
        header: 'Track revenue from support',
        description:
            'Uncover upsell opportunities, track revenue generated per agents to compensate your team based on actual sales.',
        testimonial: {
            author: {
                name: 'Cody Szymanski',
                avatar: assetsUrl('/img/paywalls/avatars/cody-szymanski.png'),
                position: 'Customer Experience Manager',
                company: {
                    name: 'Shinesty',
                    href: 'https://www.shinesty.com/',
                },
            },
            text: 'At Shinesty, our agents convert visitors into customers by using pre-sell questions sent via chat campaigns. I see the concrete results of our actions thanks to Revenue Statistics.',
        },
        preview: assetsUrl('/img/paywalls/screens/revenue-statistics.png'),
    },
    [AccountFeature.OverviewLiveStatistics]: {
        pageHeader: 'Live overview',
        header: 'Track support in real time',
        description:
            'Get a live bird’s-eye view of your support team, including agent status, open tickets, and customers waiting longest for support to recognize and mitigate issues before they happen.',
        preview: assetsUrl('/img/paywalls/screens/live-overview-statistic.png'),
    },
    [AccountFeature.UsersLiveStatistics]: {
        pageHeader: 'Live agents',
        header: 'Track support in real time',
        description:
            'Track your agents in real-time. See how long they have been online, how many tickets have been assigned to them and the work they have accomplished over a given day.',
        preview: assetsUrl('/img/paywalls/screens/live-agents-statistic.png'),
    },

    [AccountFeature.AutomationAddonOverview]: {
        paywallTheme: PaywallTheme.Default,
        header: PAGE_TITLE_AUTOMATE_PAYWALL,
        description: (
            <div>
                With Gorgias Automate, you can track your automation performance
                and leverage insights to improve.
            </div>
        ),
        preview: assetsUrl('/img/paywalls/screens/automate-overview.png'),
        requiredUpgrade: GORGIAS_AUTOMATE_BADGE,
        upgradeType: UpgradeType.None,
    },
    [AccountFeature.PhoneNumber]: {
        preview: assetsUrl('/img/paywalls/screens/voice_overview.png'),
        header: 'Voice add-on features',
        pageHeader: VOICE_OVERVIEW_PAGE_TITLE,
        description: (
            <div>
                Manage and monitor performance, efficiency, and quality of your
                phone support with our native Voice integration.
                <br />
                <a
                    href={VOICE_LEARN_MORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn about the benefits of using Gorgias Voice.
                </a>
            </div>
        ),
        requiredUpgrade: '',
        customCta: (
            <Button
                onClick={() => {
                    const windowRef = window.open(
                        VOICE_LEARN_MORE_URL,
                        '_blank',
                        'noopener noreferrer'
                    )
                    windowRef?.focus()
                }}
            >
                Learn more
            </Button>
        ),
    },
}
