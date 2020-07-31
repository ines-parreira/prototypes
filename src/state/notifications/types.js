//@flow
export type Notification = {
    status: 'success' | 'error' | 'warning' | 'info' | 'loading',
    message?: string,
    id?: ?string,
    title?: string,
    type?: 'success' | 'error' | 'warning' | 'info' | 'loading',
    dismissAfter?: number,
    closeOnNext?: boolean,
    allowHTML?: boolean,
    buttons?: NotificationButton[],
}

type NotificationButton = {
    name: string,
    onClick: () => void,
    primary: boolean,
}

export type HandleUsageBanner = {
    newAccountStatus: string,
    currentAccountStatus: string,
    notification: ?Notification,
}
