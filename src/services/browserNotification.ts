import notification, {PushNotification} from 'push.js'
import {browserHistory} from 'react-router'
import _throttle from 'lodash/throttle'
import _isString from 'lodash/isString'
import _noop from 'lodash/noop'

const icon = `${
    window.GORGIAS_ASSETS_URL || ''
}/static/private/img/icons/logo.png`
const sound = new Audio(require('../../audio/notification.mp3'))
sound.load()

class BrowserNotification {
    newMessage = _throttle(
        ({
            title,
            body,
            ticketId,
        }: {
            title?: unknown
            body?: unknown
            ticketId?: number | string
        } = {}) => {
            sound.play().catch(_noop)

            void notification.create(
                _isString(title) && title ? title : 'Gorgias',
                {
                    body:
                        _isString(body) && body
                            ? body
                            : 'You received an answer',
                    icon,
                    timeout: 5000,
                    onClick: function () {
                        // go to the ticket
                        if (ticketId) {
                            browserHistory.push(`/app/ticket/${ticketId}`)
                        }
                        window.focus()
                        ;(this as PushNotification).close()
                    },
                }
            )
        },
        10000,
        {trailing: false}
    )
}

export default new BrowserNotification()
