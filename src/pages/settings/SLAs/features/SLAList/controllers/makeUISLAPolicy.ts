import {SLAPolicy} from '@gorgias/api-queries'

import {UISLAPolicy} from 'pages/settings/SLAs/features/SLAList/types'

export default function makeUISLAPolicy(policy: SLAPolicy): UISLAPolicy {
    return {
        uuid: policy.uuid,
        name: policy.name,
        channels: policy.target_channels,
        isActive: policy.deactivated_datetime === null,
        updatedDatetime: policy.updated_datetime || policy.created_datetime,
        priority: Number(policy.priority || 0),
    }
}
