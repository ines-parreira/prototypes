import { Link } from 'react-router-dom'

import type { ChannelWithMetadata } from '../../../types'

interface MappedChannelsDrawerInfoBlockProps {
    channel: ChannelWithMetadata
}

export default function DrawerHeader({
    channel,
}: MappedChannelsDrawerInfoBlockProps) {
    switch (channel.type) {
        case 'email':
            return (
                <div>
                    Choose which support emails should be assigned to this
                    store. Manage all integrations in{' '}
                    <Link to={'/app/settings/channels/email'}>
                        Email settings.
                    </Link>{' '}
                </div>
            )
        case 'chat':
            return (
                <div>
                    Choose which Chats that should be assigned to this store.
                    Manage all integrations in{' '}
                    <Link to={'/app/settings/channels/gorgias_chat'}>
                        Chat settings.
                    </Link>{' '}
                </div>
            )

        case 'helpCenter':
            return (
                <div>
                    Choose which Help Centers should be assigned to this store.
                    Manage all integrations in{' '}
                    <Link to={'/app/settings/help-center'}>
                        Help Center settings.
                    </Link>{' '}
                </div>
            )
        case 'contactForm':
            return (
                <div>
                    Choose which Contact Forms should be assigned to this store.
                    Manage all forms in{' '}
                    <Link to={'/app/settings/contact-form/forms'}>
                        Contact Form settings.
                    </Link>{' '}
                </div>
            )
        case 'voice':
            return (
                <div>
                    Choose which phone lines should be assigned to this store.
                    Manage all integrations in{' '}
                    <Link to={'/app/settings/phone-numbers'}>
                        Voice settings.
                    </Link>{' '}
                </div>
            )
        case 'sms':
            return (
                <div>
                    Choose which SMS should be assigned to this store. Manage
                    all integrations in{' '}
                    <Link to={'/app/settings/channels/sms'}>
                        SMS settings.
                    </Link>{' '}
                </div>
            )
        case 'whatsApp':
            return (
                <div>
                    Choose which WhatsApp numbers should be assigned to this
                    store. Manage all integrations in{' '}
                    <Link to={'/app/settings/integrations/whatsapp'}>
                        WhatsApp settings.
                    </Link>{' '}
                </div>
            )

        case 'facebook':
            return (
                <div>
                    Choose which Facebook, Messenger & Instagram accounts should
                    be assigned to this store. Manage all accounts in
                    <Link to={'/app/settings/integrations/facebook'}>
                        {' '}
                        Facebook, Messenger & Instagram settings.
                    </Link>{' '}
                </div>
            )
        case 'tiktokShop':
            return (
                <div>
                    Choose which TikTok Shop accounts should be assigned to this
                    store. Manage all accounts in{' '}
                    <Link
                        to={
                            '/app/settings/integrations/app/653a626236234a4ec85eca67'
                        }
                    >
                        TikTok Shop settings.
                    </Link>{' '}
                </div>
            )
        default:
            return null
    }
}
