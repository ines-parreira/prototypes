export function desktopNotify(title: string, description: string) {
    navigator.serviceWorker?.controller?.postMessage({
        type: 'notification.create',
        payload: { description, title },
    })
}
