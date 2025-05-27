import React from 'react'

import { Link } from 'react-router-dom'

import { ChannelTypes, ChannelWithMetadata } from '../../../types'

import css from './CreateNewChannel.less'

interface CreateNewChannelProps {
    activeChannel?: ChannelWithMetadata
}

const CHANNEL_CONFIG: Record<ChannelTypes, { path: string; label: string }> = {
    email: { path: '/app/settings/channels/email', label: 'Email' },
    chat: { path: '/app/settings/channels/chat', label: 'Chat' },
    helpCenter: {
        path: '/app/settings/channels/help-center',
        label: 'Help Center',
    },
    contactForm: {
        path: '/app/settings/channels/contact-form',
        label: 'Contact Form',
    },
    voice: {
        path: '/app/settings/channels/phone',
        label: 'Phone',
    },
    sms: {
        path: '/app/settings/channels/sms',
        label: 'SMS',
    },
    whatsApp: { path: '/app/settings/channels/whatsapp', label: 'WhatsApp' },
    facebook: { path: '/app/settings/channels/facebook', label: 'Facebook' },
    tiktokShop: {
        path: '/app/settings/channels/tiktok-shop',
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
