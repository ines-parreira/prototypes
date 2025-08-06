declare const self: ServiceWorkerGlobalScope

export async function handleNotificationClick() {
    const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
    })
    const filteredClients = Array.from(clients).filter(
        (c) => c.frameType === 'top-level',
    )
    if (filteredClients.length === 0) return

    filteredClients[0].focus()
}
