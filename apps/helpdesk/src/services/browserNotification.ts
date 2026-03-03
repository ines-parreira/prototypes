import { history } from '@repo/routing'
import _isString from 'lodash/isString'
import _throttle from 'lodash/throttle'
import type { PushNotification } from 'push.js'
import notification from 'push.js'

import { store } from 'common/store'
import { notificationSounds } from 'services'
import { defaultSound } from 'services/NotificationSounds'
import { getNotificationSettings } from 'state/currentUser/selectors'
import { assetsUrl } from 'utils'

const icon = assetsUrl('/img/icons/logo.png')

export class BrowserNotification {
    playSound = _throttle(
        () => {
            const notificationSettings = getNotificationSettings(
                store.getState(),
            )

            const settings =
                notificationSettings?.data?.notification_sound || defaultSound

            if (!settings.enabled) return

            notificationSounds.play(settings.sound, settings.volume)
        },
        10000,
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

        void notification.create(
            _isString(title) && title ? title : 'Gorgias',
            {
                body: _isString(body) && body ? body : 'You received an answer',
                icon,
                timeout: requireInteraction ? undefined : 5000,
                onClick: function () {
                    // go to the ticket
                    if (ticketId) {
                        history.push(`/app/ticket/${ticketId}`)
                    }
                    window.focus()
                    ;(this as PushNotification).close()
                },
                requireInteraction: !!requireInteraction,
            },
        )
    }

    // FIXME: remove once PLTCO-2134 is done
    newMessageThrottled = _throttle(this.newMessage, 10000, { trailing: false })
}

const browserNotification = new BrowserNotification()

export default browserNotification
