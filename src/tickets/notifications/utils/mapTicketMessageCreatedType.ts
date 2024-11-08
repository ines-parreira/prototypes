import {TicketChannel} from 'business/types/ticket'

import type {Notification, PayloadWithSender} from 'common/notifications'

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

export default function mapTicketMessageCreatedType(
    notification: Notification
) {
    const {channel} = (notification.payload as PayloadWithSender).ticket
    return channelTypeMap[channel] || notification.type
}
