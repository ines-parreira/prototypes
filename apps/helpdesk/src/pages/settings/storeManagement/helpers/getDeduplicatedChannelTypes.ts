import type { Integration } from 'models/integration/types'

import { deriveTypeFromIntegration } from './deriveTypeFromIntegration'

export function getDeduplicatedChannelTypes(channels: Integration[]) {
    return Array.from(
        new Set(channels.map((channel) => deriveTypeFromIntegration(channel))),
    )
}
