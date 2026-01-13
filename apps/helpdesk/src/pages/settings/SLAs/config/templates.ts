import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import type { MappedFormSLAPolicy } from 'pages/settings/SLAs/features/SLAForm/controllers/makeMappedFormSLAPolicy'

export type SLATemplate = Omit<MappedFormSLAPolicy, 'uuid'> & {
    description: string
    icon: string
}

export const TEMPLATES_LIST: SLATemplate[] = [
    {
        name: 'Voice',
        description: 'Measure how quickly your team answers inbound calls.',
        target_channels: ['phone'],
        target: 0.9,
        metrics: {
            [SLAPolicyMetricType.WaitTime]: {
                threshold: 1,
                unit: SLAPolicyMetricUnit.Minute,
            },
        },
        icon: 'phone',
        active: true,
        business_hours_only: true,
    },
    {
        name: 'Chat',
        description:
            'Provide customers with best-in-class chat support by using the suggested SLA settings for chat.',
        target_channels: ['chat'],
        target: undefined,
        metrics: {
            FRT: {
                threshold: 1,
                unit: 'minute',
            },
            RT: {
                threshold: 35,
                unit: 'minute',
            },
        },
        icon: 'forum',
        active: true,
        business_hours_only: true,
    },
    {
        name: 'Email',
        description:
            'Provide customers with best-in-class email support by using the suggested SLA settings for email.',
        target_channels: ['email'],
        target: undefined,
        metrics: {
            FRT: {
                threshold: 1,
                unit: 'hour',
            },
            RT: {
                threshold: 12,
                unit: 'hour',
            },
        },
        icon: 'email',
        active: true,
        business_hours_only: true,
    },
    {
        name: 'Social media',
        description:
            'Provide customers with best-in-class social channel support by using the suggested SLA settings for social channels.',
        target_channels: [
            'facebook',
            'facebook-mention',
            'facebook-messenger',
            'facebook-recommendations',
            'instagram-ad-comment',
            'instagram-comment',
            'instagram-direct-message',
            'instagram-mention',
            'tiktok-shop',
            'twitter',
            'twitter-direct-message',
        ],
        target: undefined,
        metrics: {
            FRT: {
                threshold: 30,
                unit: 'minute',
            },
            RT: {
                threshold: 6,
                unit: 'hour',
            },
        },
        icon: 'group',
        active: true,
        business_hours_only: true,
    },
]
