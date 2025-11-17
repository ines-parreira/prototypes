import type { Integration } from 'models/integration/types'

import deriveTypeFromIntegration from './deriveTypeFromIntegration'

const channelSortMap: Record<string, number> = {
    email: 0,
    gmail: 0,
    outlook: 0,
    gorgias_chat: 1,
    'help-center': 2,
    'contact-form': 3,
    phone: 4,
    aircall: 4,
    sms: 5,
    whatsapp: 6,
    facebook: 7,
    'tiktok-shop': 8,
    other: 9,
}

export default function sortChannels(channels: Integration[]) {
    return [...channels].sort((a, b) => {
        const sortValueA =
            channelSortMap[deriveTypeFromIntegration(a)] ?? channelSortMap.other
        const sortValueB =
            channelSortMap[deriveTypeFromIntegration(b)] ?? channelSortMap.other
        return sortValueA - sortValueB
    })
}
