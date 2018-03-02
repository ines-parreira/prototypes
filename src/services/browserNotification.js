import notification from 'push.js'
import {browserHistory} from 'react-router'
import _throttle from 'lodash/throttle'

const icon = `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/icons/logo.png`
const sound = new Audio(require('../../audio/notification.mp3'))
sound.load()

class BrowserNotification {
    newMessage = _throttle(({title = 'Gorgias', body = 'You received an answer', ticketId}) => {
        sound.play()
        notification.create(title, {
            body,
            icon,
            timeout: 5000,
            onClick: function() {
                // go to the ticket
                if (ticketId) {
                    browserHistory.push(`/app/ticket/${ticketId}`)
                }
                window.focus()
                this.close()
            }
        })
    }, 10000, {trailing: false})
}

export default new BrowserNotification()
