export enum NotificationStatus {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Loading = 'loading',
}

export enum NotificationStyle {
    Alert = 'alert',
    Banner = 'banner',
}

export type Notification = {
    status?: NotificationStatus
    message?: string
    id?: Maybe<string>
    title?: string
    dismissAfter?: number
    closeOnNext?: boolean
    buttons?: NotificationButton[]
    allowHTML?: boolean
    actionHTML?: string
    dismissible?: boolean
    style?: NotificationStyle
    type?: NotificationStatus
    onClick?: () => void
    noAutoDismiss?: boolean
    isTicketMessageFailedEvent?: boolean
    showIcon?: boolean
    closable?: boolean
    // TODO(@nikolam): separate strictly reapop notifications from the Gorgias type
    showDismissButton?: boolean
}

export type NotificationButton = {
    name: string
    onClick: () => void
    primary: boolean
    color?: 'string'
}

export type HandleUsageBanner = {
    newAccountStatus: string
    currentAccountStatus: string
    notification: Maybe<Notification>
}
