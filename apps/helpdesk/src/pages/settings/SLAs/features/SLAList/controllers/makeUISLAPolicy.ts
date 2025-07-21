import { isString } from 'lodash'

import { SLAPolicy } from '@gorgias/helpdesk-queries'

import { UISLAPolicy } from 'pages/settings/SLAs/features/SLAList/types'

export default function makeUISLAPolicy(policy: SLAPolicy): UISLAPolicy {
    return {
        uuid: policy.uuid,
        name: policy.name,
        channels: policy.target_channels.filter(isString),
        isActive: policy.deactivated_datetime === null,
        updatedDatetime: policy.updated_datetime || policy.created_datetime,
        priority: Number(policy.priority || 0),
    }
}
