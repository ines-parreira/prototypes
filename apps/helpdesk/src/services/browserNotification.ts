import { history } from '@repo/routing'
import type { PushNotification } from 'push.js'
import notification from 'push.js'
import { Duration, isString, throttle } from '@gorgias/toolkit'

import { store } from 'common/store'
import { notificationSounds } from 'services'
import { defaultSound } from 'services/NotificationSounds'
import { getNotificationSettings } from 'state/currentUser/selectors'
import { assetsUrl } from 'utils'

const icon = assetsUrl('/img/icons/logo.png')

export class BrowserNotification {
    playSound = throttle(
        () => {
            const notificationSettings = getNotificationSettings(
                store.getState(),
            )

            const settings =
                notificationSettings?.data?.notification_sound || defaultSound

            if (!settings.enabled) return

            notificationSounds.play(settings.sound, settings.volume)
        },
        Duration.seconds(10),
        { trailing: false },
    )

    newMessage = ({
        title,
        body,
        ticketId,
        playSoundNotification,
        requireInteraction,
    }: {
        title?: unknown
        body?: unknown
        ticketId?: number | string | null
        playSoundNotification?: boolean | null
        requireInteraction?: boolean
    } = {}) => {
        if (
            playSoundNotification === null ||
            playSoundNotification === undefined ||
            !!playSoundNotification
        ) {
            this.playSound()
        }

        void notification.create(isString(title) && title ? title : 'Gorgias', {
            body: isString(body) && body ? body : 'You received an answer',
            icon,
            timeout: requireInteraction ? undefined : Duration.seconds(5),
            onClick: function () {
                // go to the ticket
                if (ticketId) {
                    history.push(`/app/ticket/${ticketId}`)
                }
                window.focus()
                ;(this as PushNotification).close()
            },
            requireInteraction: !!requireInteraction,
        })
    }

    // FIXME: remove once PLTCO-2134 is done
    newMessageThrottled = throttle(this.newMessage, Duration.seconds(10), {
        trailing: false,
    })
}

const browserNotification = new BrowserNotification()

export { browserNotification }
