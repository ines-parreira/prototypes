import { Integration } from 'models/integration/types'

import deriveTypeFromIntegration from './deriveTypeFromIntegration'

export default function getDeduplicatedChannelTypes(channels: Integration[]) {
    return Array.from(
        new Set(channels.map((channel) => deriveTypeFromIntegration(channel))),
    )
}
