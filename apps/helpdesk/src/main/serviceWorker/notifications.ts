import { isNotificationData } from './helpers/isNotificationData'

// The Trackstar library sets all properties on window to be a
// Trackstar object, so I have to manually override that here
declare const self: ServiceWorkerGlobalScope

export function registerNotifications() {
    self.addEventListener('message', async (event) => {
        const { data } = event
        if (!isNotificationData(data)) return

        const clients = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        })

        const shouldSend =
            Array.from(clients).filter(
                (c) => c.frameType === 'top-level' && c.focused,
            ).length === 0
        if (!shouldSend) return

        const { description, id, title } = data.payload
        await self.registration.showNotification(title, {
            body: description,
            icon: '',
            data: { id },
        })
    })
}
