import notification, {PushNotification} from 'push.js'
import {LDClient} from 'launchdarkly-js-client-sdk'
import _throttle from 'lodash/throttle'
import _isString from 'lodash/isString'
import _noop from 'lodash/noop'

import {FeatureFlagKey} from 'config/featureFlags'
import {store} from 'init'
import history from 'pages/history'
import {notificationSounds} from 'services'
import {defaultSound} from 'services/NotificationSounds'
import {getNotificationSettings} from 'state/currentUser/selectors'
import {assetsUrl} from 'utils'
import {getLDClient} from 'utils/launchDarkly'

const icon = assetsUrl('/img/icons/logo.png')

//eslint-disable-next-line @typescript-eslint/no-var-requires
const sound = new Audio(require('assets/audio/classic.mp3'))
sound.load()

export class BrowserNotification {
    ldClient: LDClient

    constructor() {
        this.ldClient = getLDClient()
    }

    playSound = _throttle(
        async () => {
            await this.ldClient.waitForInitialization()

            const isNotificationSoundsEnabled = this.ldClient.variation(
                FeatureFlagKey.NotificationSounds
            )

            if (!isNotificationSoundsEnabled) {
                sound.play().catch(_noop)
                return
            }

            const notificationSettings = getNotificationSettings(
                store.getState()
            )

            const settings = notificationSettings
                ? notificationSettings.data.notification_sound
                : defaultSound

            if (!settings.enabled) return

            notificationSounds.play(settings.sound, settings.volume)
        },
        10000,
        {trailing: false}
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
            void this.playSound()
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
            }
        )
    }

    // FIXME: remove once PLTCO-2134 is done
    newMessageThrottled = _throttle(this.newMessage, 10000, {trailing: false})
}

export default new BrowserNotification()
