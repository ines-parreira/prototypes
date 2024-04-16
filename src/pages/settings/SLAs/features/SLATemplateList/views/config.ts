import {TicketChannel} from '@gorgias/api-queries'

import {SLAPolicy} from 'models/SLAPolicy/types'

export type SLATemplate = Omit<SLAPolicy, 'id'> & {
    icon: string
}

export const TEMPLATES_LIST: SLATemplate[] = [
    {
        name: 'Chat good practices',
        description:
            'Provide customers with best in class chat support by using industry standard SLAs for chat.',
        business_hours: true,
        criteria: {
            channels: [TicketChannel.Chat],
        },
        metrics: [
            {
                name: 'FRT',
                threshold: 100,
                unit: 'second',
            },
            {
                name: 'HT',
                threshold: 360,
                unit: 'second',
            },
        ],
        icon: 'forum',
    },
    {
        name: 'Social media',
        description:
            'Provide customers with best in class chat support by using industry standard SLAs for social media.',
        business_hours: true,
        criteria: {
            channels: [TicketChannel.Chat],
        },

        metrics: [
            {
                name: 'FRT',
                threshold: 100,
                unit: 'second',
            },
            {
                name: 'HT',
                threshold: 360,
                unit: 'second',
            },
        ],
        icon: 'group',
    },
]
