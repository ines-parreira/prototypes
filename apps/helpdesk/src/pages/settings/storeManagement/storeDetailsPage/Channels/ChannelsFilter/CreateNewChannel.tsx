import React from 'react'

import { Link } from 'react-router-dom'

import type { ChannelTypes, ChannelWithMetadata } from '../../../types'

import css from './CreateNewChannel.less'

interface CreateNewChannelProps {
    activeChannel?: ChannelWithMetadata
}

const CHANNEL_CONFIG: Record<ChannelTypes, { path: string; label: string }> = {
    email: { path: '/app/settings/channels/email/new', label: 'Email' },
    chat: {
        path: '/app/settings/channels/gorgias_chat/new/create-wizard',
        label: 'Chat',
    },
    helpCenter: {
        path: '/app/settings/help-center/new',
        label: 'Help Center',
    },
    contactForm: {
        path: '/app/settings/contact-form/new',
        label: 'Contact Form',
    },
    voice: {
        path: '/app/settings/channels/phone/new',
        label: 'Phone',
    },
    sms: {
        path: '/app/settings/channels/sms/new',
        label: 'SMS',
    },
    whatsApp: {
        path: '/app/settings/integrations/whatsapp/integrations',
        label: 'WhatsApp',
    },
    facebook: {
        path: '/app/settings/integrations/facebook',
        label: 'Facebook',
    },
    tiktokShop: {
        path: '/app/settings/integrations/app/653a626236234a4ec85eca67',
        label: 'TikTok Shop',
    },
}

export default function CreateNewChannel({
    activeChannel,
}: CreateNewChannelProps) {
    if (!activeChannel) return null

    const { type } = activeChannel
    const { path = '', label = '' } = CHANNEL_CONFIG[type] || {}

    return (
        <div className={css.createNewChannelContainer}>
            <Link to={path}>Add New {label}</Link>
        </div>
    )
}
