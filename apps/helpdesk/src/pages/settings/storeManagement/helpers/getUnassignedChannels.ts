import { Integration } from 'models/integration/types'

import { StoreMapping } from '../../../../models/storeMapping/types'
import getEligibleChannels from './getEligibleChannel'

export default function getUnassignedChannels(
    allIntegrations: Integration[],
    storeToChannelsMapping: StoreMapping[],
) {
    const eligibleChannels = getEligibleChannels(allIntegrations)

    const assignedChannels = storeToChannelsMapping.map(
        (mapping) => mapping.integration_id,
    )

    return eligibleChannels.filter(
        (channel) => !assignedChannels.includes(channel.id),
    )
}
