import { SLAPolicy } from '@gorgias/api-queries'

import { TicketChannel } from 'business/types/ticket'
import { UISLAPolicy } from 'pages/settings/SLAs/features/SLAList/types'

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
