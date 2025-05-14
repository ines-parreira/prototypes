import { useState } from 'react'

import { store } from '../../fixtureNew'

export type ChannelTypes =
    | 'email'
    | 'chat'
    | 'helpCenter'
    | 'contactForm'
    | 'voice'
    | 'sms'
    | 'whatsApp'
    | 'facebook'
    | 'tiktokShop'

export type ChannelIntegrationItem = {
    id: number
    name: string
    type: string
    meta: {
        address: string
    }
}

export interface Channel {
    title: string
    description: string
    count: number
    type: ChannelTypes
    assignedChannels: ChannelIntegrationItem[]
    unassignedChannels: ChannelIntegrationItem[]
}

export const useChannels = () => {
    const [channels, setChannels] = useState<Channel[]>([
        {
            title: 'Email',
            description: '',
            count: store.emails.assigned.length,
            type: 'email',
            assignedChannels: store.emails.assigned,
            unassignedChannels: store.emails.unassigned,
        },
        {
            title: 'Chat',
            description: '',
            count: store.chats.assigned.length,
            type: 'chat',
            assignedChannels: store.chats.assigned,
            unassignedChannels: store.chats.unassigned,
        },
        {
            title: 'Help Center',
            description: '',
            count: store.helpCenters.assigned.length,
            type: 'helpCenter',
            assignedChannels: store.helpCenters.assigned,
            unassignedChannels: store.helpCenters.unassigned,
        },
        {
            title: 'Contact Form',
            description: '',
            count: store.contactForms.assigned.length,
            type: 'contactForm',
            assignedChannels: store.contactForms.assigned,
            unassignedChannels: store.contactForms.unassigned,
        },
        {
            title: 'WhatsApp',
            description: '',
            count: store.whatsApps.assigned.length,
            type: 'whatsApp',
            assignedChannels: store.whatsApps.assigned,
            unassignedChannels: store.whatsApps.unassigned,
        },
        {
            title: 'Facebook, Messenger & Instagram',
            description: '',
            count: store.facebooks.assigned.length,
            type: 'facebook',
            assignedChannels: store.facebooks.assigned,
            unassignedChannels: store.facebooks.unassigned,
        },
        {
            title: 'TikTok Shop',
            description: '',
            count: store.tiktokShops.assigned.length,
            type: 'tiktokShop',
            assignedChannels: store.tiktokShops.assigned,
            unassignedChannels: store.tiktokShops.unassigned,
        },
    ])

    return { channels, setChannels }
}
