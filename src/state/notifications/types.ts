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
}

type NotificationButton = {
    name: string
    onClick: () => void
    primary: boolean
}
type HandleUsageBanner = {
    newAccountStatus: string
    currentAccountStatus: string
    notification: Maybe<Notification>
}
