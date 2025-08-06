export async function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }

    return Notification.permission === 'granted'
}
