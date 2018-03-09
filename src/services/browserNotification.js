// @flow
import notification from 'push.js'
import {browserHistory} from 'react-router'
import _throttle from 'lodash/throttle'
import _isString from 'lodash/isString'

const icon = `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/icons/logo.png`
// $FlowFixMe
const sound = new Audio(require('../../audio/notification.mp3'))
sound.load()


type NotificationType = {
    title?: string,
    body?: string,
    ticketId?: number | string
}

class BrowserNotification {
    newMessage = _throttle((notif: NotificationType) => {
        if (!notif) {
            notif = {}
        }

        if (!_isString(notif.title) || !notif.title) {
            notif.title = 'Gorgias'
        }

        if (!_isString(notif.body) || !notif.body) {
            notif.body = 'You received an answer'
        }

        sound.play()
        notification.create(notif.title, {
            body: notif.body,
            icon,
            timeout: 5000,
            onClick: function() {
                // go to the ticket
                if (notif.ticketId) {
                    browserHistory.push(`/app/ticket/${notif.ticketId}`)
                }
                window.focus()
                this.close()
            }
        })
    }, 10000, {trailing: false})
}

export default new BrowserNotification()
