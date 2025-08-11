import { shouldSendNotification } from './helpers/shouldSendNotification'
import type { NotificationData } from './types'

declare const self: ServiceWorkerGlobalScope

export async function handleNotificationMessage(data: NotificationData) {
    const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
    })

    const hasFocusedTab =
        Array.from(clients).filter(
            (c) => c.frameType === 'top-level' && c.focused,
        ).length > 0
    if (hasFocusedTab) return

    const { description, id, title } = data.payload
    const canSend = await shouldSendNotification(id)
    if (!canSend) return

    await self.registration.showNotification(title, {
        body: description,
        icon: '',
        data: { id },
    })
}
