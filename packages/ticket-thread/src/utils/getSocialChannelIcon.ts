import { TicketThreadItemTag } from '../hooks/types'

const SOCIAL_CHANNEL_ICONS: Record<string, string> = {
    [TicketThreadItemTag.Messages.SocialMediaFacebookComment]:
        'channel-facebook',
    [TicketThreadItemTag.Messages.SocialMediaFacebookPost]: 'channel-facebook',
    [TicketThreadItemTag.Messages.SocialMediaFacebookMessage]:
        'channel-fb-messenger',
    [TicketThreadItemTag.Messages.SocialMediaInstagramComment]:
        'channel-instagram',
    [TicketThreadItemTag.Messages.SocialMediaInstagramMedia]: 'comm-instagram',
    [TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage]:
        'channel-instagram-dm',
    [TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention]:
        'channel-instagram',
    [TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply]:
        'channel-instagram',
    [TicketThreadItemTag.Messages.SocialMediaTwitterTweet]: 'channel-twitter',
    [TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage]:
        'channel-twitter',
    [TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage]:
        'channel-whatsapp',
}

export function getSocialChannelIcon(tag: string): string | null {
    return SOCIAL_CHANNEL_ICONS[tag] ?? null
}
