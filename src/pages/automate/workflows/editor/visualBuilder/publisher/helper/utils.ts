import {TicketChannel} from '@gorgias/api-queries'
import {assetsUrl} from 'utils'

export const ChannelConfig = {
    [TicketChannel.Chat]: {
        settingsUrl: `/app/settings/channels/gorgias_chat`,
        linkText: 'Connect a Chat',
        description: ' to this store to enable this Flow.',
        assetsUrl: assetsUrl('/img/workflows/chat_preview.png'),
        label: 'Chat',
    },
    [TicketChannel.HelpCenter]: {
        settingsUrl: `/app/settings/help-center`,
        linkText: 'Connect a Help Center',
        description:
            ' to this store to enable this Flow. Only available for Shopify stores.',
        assetsUrl: assetsUrl('/img/workflows/helpcenter_preview.png'),
        label: 'Help Center',
    },
    [TicketChannel.ContactForm]: {
        settingsUrl: `/app/settings/contact-form/forms`,
        linkText: 'Connect a Contact Form',
        description: ' to your store to enable this Flow.',
        assetsUrl: assetsUrl('/img/workflows/contact_form_preview.png'),
        label: 'Contact Form',
    },
}
