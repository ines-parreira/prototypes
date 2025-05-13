import React from 'react'

import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'

import { store } from './fixture'

import css from './StoreDetailsPage.less'

interface Channel {
    title: string
    description: string
    count: number
}

const Channels: Channel[] = [
    {
        title: 'Email',
        description: '',
        count: store.assignedChannels.emails.length,
    },
    {
        title: 'Chat',
        description: '',
        count: store.assignedChannels.chats.length,
    },
    {
        title: 'Help Center',
        description: '',
        count: store.assignedChannels.helpCenters.length,
    },
    {
        title: 'Contact Form',
        description: '',
        count: store.assignedChannels.contactForms.length,
    },
    {
        title: 'WhatsApp',
        description: '',
        count: store.assignedChannels.whatsApps.length,
    },
    {
        title: 'Facebook, Messenger & Instagram',
        description: '',
        count: store.assignedChannels.facebooks.length,
    },
    {
        title: 'TikTok Shop',
        description: '',
        count: store.assignedChannels.tiktokShops.length,
    },
]

export default function ChannelsTab() {
    return (
        <section className={css.channelsContainer}>
            <SettingsCard>
                <SettingsCardHeader>
                    <SettingsCardTitle>Channels</SettingsCardTitle>
                    <p>View and manage your channels for this store.</p>
                </SettingsCardHeader>
                <SettingsCardContent>
                    {Channels.map((channel) => (
                        <SettingsFeatureRow
                            key={channel.title}
                            title={channel.title}
                            description={channel.description}
                            badgeText={`${channel.count || 'None'} Assigned`}
                            nbFeatures={channel.count}
                            onClick={() => {}}
                        />
                    ))}
                </SettingsCardContent>
            </SettingsCard>
        </section>
    )
}
