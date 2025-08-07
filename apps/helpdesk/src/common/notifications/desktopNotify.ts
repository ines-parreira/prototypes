export function desktopNotify(id: string, title: string, description?: string) {
    navigator.serviceWorker?.controller?.postMessage({
        type: 'notification.create',
        payload: { description, id, title },
    })
}
