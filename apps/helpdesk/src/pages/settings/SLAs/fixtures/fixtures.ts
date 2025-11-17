import type { SLAPolicy } from '@gorgias/helpdesk-queries'
import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import type { UISLAPolicy } from 'pages/settings/SLAs/features/SLAList/types'

export const slaPolicy1: SLAPolicy = {
    uuid: '1',
    name: 'policy',
    target_channels: ['email'],
    deactivated_datetime: null,
    updated_datetime: '2021-07-01T00:00:00Z',
    created_datetime: '2021-07-01T00:00:00Z',
    archived_datetime: null,
    metrics: [],
    version: 1,
    priority: '1',
    business_hours_only: false,
}

export const slaPolicy2: SLAPolicy = {
    uuid: '2',
    name: 'policy',
    target_channels: [
        'chat',
        'aircall',
        'email',
        'facebook',
        'twitter',
        'contact_form',
        'instagram-comment',
    ],
    deactivated_datetime: null,
    updated_datetime: '2021-08-01T00:00:00Z',
    created_datetime: '2021-08-01T00:00:00Z',
    archived_datetime: null,
    metrics: [],
    version: 1,
    priority: '0.5',
    business_hours_only: false,
}

export const slaPolicy3: SLAPolicy = {
    uuid: '3',
    name: 'policy',
    target_channels: ['email', 'chat'],
    deactivated_datetime: null,
    updated_datetime: '2021-08-01T00:00:00Z',
    created_datetime: '2021-08-01T00:00:00Z',
    archived_datetime: null,
    metrics: [
        {
            name: SLAPolicyMetricType.Frt,
            threshold: 30,
            unit: SLAPolicyMetricUnit.Minute,
        },
        {
            name: SLAPolicyMetricType.Rt,
            threshold: 120,
            unit: SLAPolicyMetricUnit.Minute,
        },
    ],
    version: 1,
    priority: '0.5',
    business_hours_only: true,
}

export const UISLAPolicy1: UISLAPolicy = {
    uuid: '1',
    name: 'policy',
    channels: [TicketChannel.Email],
    isActive: true,
    updatedDatetime: '2021-07-01T00:00:00Z',
    priority: 1,
}

export const UISLAPolicy2: UISLAPolicy = {
    uuid: '2',
    name: 'policy',
    channels: [TicketChannel.Chat],
    isActive: true,
    updatedDatetime: '2021-08-01T00:00:00Z',
    priority: 0.5,
}
