import notification, {PushNotification} from 'push.js'
import _throttle from 'lodash/throttle'
import _isString from 'lodash/isString'
import _noop from 'lodash/noop'

import history from '../pages/history'

const icon = `${
    window.GORGIAS_ASSETS_URL || ''
}/static/private/js/assets/img/icons/logo.png`

//eslint-disable-next-line @typescript-eslint/no-var-requires
const sound = new Audio(require('assets/audio/notification.mp3'))
sound.load()

class BrowserNotification {
    playSound = _throttle(
        () => {
            sound.play().catch(_noop)
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
        ticketId?: number | string
        playSoundNotification?: boolean
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
            }
        )
    }

    // FIXME: remove once PLTCO-2134 is done
    newMessageThrottled = _throttle(this.newMessage, 10000, {trailing: false})
}

export default new BrowserNotification()
