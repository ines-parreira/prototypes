import { handleNotificationClick } from './handleNotificationClick'
import { handleNotificationMessage } from './handleNotificationMessage'
import { isNotificationData } from './helpers/isNotificationData'

// The Trackstar library sets all properties on window to be a
// Trackstar object, so I have to manually override that here
declare const self: ServiceWorkerGlobalScope

export function registerNotifications() {
    self.addEventListener('message', async (event) => {
        const { data } = event
        if (!isNotificationData(data)) return

        event.waitUntil(handleNotificationMessage(data))
    })

    self.addEventListener('notificationclick', (event) => {
        event.notification.close()
        event.preventDefault()
        event.waitUntil(handleNotificationClick())
    })
}
