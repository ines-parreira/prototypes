import {LegacyChannelSlug} from '@gorgias/api-queries'

import {assetsUrl} from 'utils'

export const ChannelConfig = {
    [LegacyChannelSlug.Chat]: {
        settingsUrl: `/app/settings/channels/gorgias_chat`,
        linkText: 'Connect a Chat',
        description: ' to enable Automate features.',
        assetsUrl: assetsUrl('/img/workflows/chat_preview.png'),
        label: 'Chat',
    },
    [LegacyChannelSlug.HelpCenter]: {
        settingsUrl: `/app/settings/help-center`,
        linkText: 'Connect a Help Center',
        description: ' to enable Automate features.',
        assetsUrl: assetsUrl('/img/workflows/helpcenter_preview.png'),
        label: 'Help Center',
    },
    [LegacyChannelSlug.ContactForm]: {
        settingsUrl: `/app/settings/contact-form/forms`,
        linkText: 'Connect a Contact Form',
        description: ' to enable Automate features.',
        assetsUrl: assetsUrl('/img/workflows/contact_form_preview.png'),
        label: 'Contact Form',
    },
}
