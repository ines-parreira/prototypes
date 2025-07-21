import { TicketChannel } from 'business/types/ticket'
import type { Notification } from 'common/notifications'

import type { TicketPayload } from '../types'

const channelTypeMap: Partial<Record<TicketChannel, string>> = {
    [TicketChannel.Aircall]: 'ticket-message.created.aircall',
    [TicketChannel.Chat]: 'ticket-message.created.chat',
    [TicketChannel.Email]: 'ticket-message.created.email',
    [TicketChannel.Facebook]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookMention]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookMessenger]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookRecommendations]: 'ticket-message.created.facebook',
    [TicketChannel.InstagramAdComment]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramComment]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramDirectMessage]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramMention]: 'ticket-message.created.instagram',
    [TicketChannel.Phone]: 'ticket-message.created.phone',
    [TicketChannel.Sms]: 'ticket-message.created.sms',
    [TicketChannel.WhatsApp]: 'ticket-message.created.whatsapp',
    [TicketChannel.YotpoReview]: 'ticket-message.created.yotpo',
}

function isInstantChannel(channel: TicketChannel) {
    return [
        TicketChannel.Chat,
        TicketChannel.FacebookMessenger,
        TicketChannel.InstagramDirectMessage,
        TicketChannel.Sms,
        TicketChannel.WhatsApp,
    ].includes(channel)
}

export default function mapTicketMessageCreatedType(
    notification: Notification<TicketPayload>,
) {
    const { type } = notification
    const { channel, assignee_user_id } = notification.payload.ticket

    if (
        assignee_user_id === null &&
        isInstantChannel(channel) &&
        type === 'ticket-message.created'
    ) {
        return 'ticket-message.created.chat.unassigned'
    }
    return channelTypeMap[channel] || type
}
