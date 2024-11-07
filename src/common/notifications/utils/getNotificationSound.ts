import {TicketChannel} from 'business/types/ticket'

import {defaultSound, SoundValue} from 'services/NotificationSounds'

import {Notification} from '../types'

const ticketMessageCreatedChannelWorkflowMap: Partial<
    Record<TicketChannel, string>
> = {
    [TicketChannel.Email]: 'ticket-message.created.email',
    [TicketChannel.Chat]: 'ticket-message.created.chat',
    [TicketChannel.Phone]: 'ticket-message.created.phone',
    [TicketChannel.Sms]: 'ticket-message.created.sms',
    [TicketChannel.Facebook]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookMention]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookMessenger]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookRecommendations]: 'ticket-message.created.facebook',
    [TicketChannel.InstagramAdComment]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramComment]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramDirectMessage]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramMention]: 'ticket-message.created.instagram',
    [TicketChannel.WhatsApp]: 'ticket-message.created.whatsapp',
    [TicketChannel.YotpoReview]: 'ticket-message.created.yotpo',
    [TicketChannel.Aircall]: 'ticket-message.created.aircall',
}

export default function getNotificationSound(
    notification: Notification,
    eventSettings: Record<
        string,
        {
            sound: '' | SoundValue
        }
    >
) {
    const notificationType = notification.type
    let sound

    if (notificationType === 'ticket-message.created') {
        const ticketChannel = notification.payload.ticket.channel
        const workflowName =
            ticketMessageCreatedChannelWorkflowMap[ticketChannel]
        workflowName && (sound = eventSettings[workflowName]?.sound)
    } else {
        sound = eventSettings[notificationType]?.sound
    }
    if (sound === undefined) {
        sound = defaultSound.sound
    }

    return sound
}
