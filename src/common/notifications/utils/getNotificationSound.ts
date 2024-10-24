import {ticketMessageCreatedChannelWorkflowMap} from 'common/notifications/data'
import {Notification} from 'common/notifications/types'
import {defaultSound, SoundValue} from 'services/NotificationSounds'

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
