import {Position, Status} from 'reapop'

import {AlertBannerProps} from 'pages/common/components/BannerNotifications/AlertBanner'
import {AlertBannerTypes} from 'pages/common/components/BannerNotifications/types'

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

type ReapopNotification = {
    id: string
    title?: string
    message?: string
    status: Status
    position?: Position
    buttons?: NotificationButton[]
    image?: string
    dismissAfter?: number
    dismissible?: boolean
    onAdd?: (...args: any[]) => void
    onDismiss?: (...args: any[]) => void
    showDismissButton?: boolean
    allowHTML?: boolean
}

export type AlertNotification = Omit<ReapopNotification, 'status' | 'id'> & {
    style?: NotificationStyle.Alert
    status?: NotificationStatus
    id?: Maybe<string>
    // double check this one
    type?: NotificationStatus
    closeOnNext?: boolean
    noAutoDismiss?: boolean
    isTicketMessageFailedEvent?: boolean
}

// Types below are due to mixing reapop with banners :(
// Remove them once banners have their own system
export type BannerNotification = Omit<AlertBannerProps, 'borderless'> & {
    style: NotificationStyle.Banner
    id: string
}

export const isAlertNotification = (
    notification: Notification
): notification is AlertNotification =>
    notification.style === NotificationStyle.Alert ||
    notification.style === undefined

export const isBannerNotification = (
    notification: Notification
): notification is BannerNotification =>
    notification.style === NotificationStyle.Banner

export type BannerNotificationFromBackend = Omit<
    BannerNotification,
    'style'
> & {
    type: AlertBannerTypes
}

export type Notification = AlertNotification | BannerNotification

export type NotificationButton = {
    name: string
    primary?: boolean
    onClick?: (...args: any[]) => void
}

export type HandleUsageBanner = {
    newAccountStatus: string
    currentAccountStatus: string
    notification?: BannerNotificationFromBackend
}
