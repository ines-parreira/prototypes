export enum NotificationStatus {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Loading = 'loading',
}

export type Notification = {
    status: NotificationStatus
    message?: string
    id?: Maybe<string>
    title?: string
    dismissAfter?: number
    closeOnNext?: boolean
    buttons?: NotificationButton[]
    allowHTML?: boolean
    dismissible?: boolean
    style?: string
    type?: NotificationStatus
    onClick?: () => void
}

export type NotificationButton = {
    name: string
    onClick: () => void
    primary: boolean
}

export type HandleUsageBanner = {
    newAccountStatus: string
    currentAccountStatus: string
    notification: Maybe<Notification>
}
