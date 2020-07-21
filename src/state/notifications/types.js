//@flow
export type Notification = {
    status: 'success' | 'error' | 'warning' | 'info' | 'loading',
    message?: string,
    id?: ?string,
    title?: string,
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
