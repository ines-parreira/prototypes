export type NotificationData = {
    type: 'notification.create'
    payload: {
        id: string
        title: string
        description: string
    }
}
