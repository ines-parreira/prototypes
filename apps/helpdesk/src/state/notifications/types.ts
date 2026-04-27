import type { Position, Status } from 'reapop'

import type { AlertBannerProps, AlertBannerTypes } from 'AlertBanners'

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export enum NotificationStatus {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Loading = 'loading',
}

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export enum NotificationStyle {
    Alert = 'alert',
    Banner = 'banner',
}

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
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

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export type AlertNotification = Omit<ReapopNotification, 'status' | 'id'> & {
    style?: NotificationStyle.Alert
    status?: NotificationStatus
    id?: Maybe<string>
    // double check this one
    type?: NotificationStatus
    closeOnNext?: boolean
    noAutoDismiss?: boolean
}

// Types below are due to mixing reapop with banners :(
// Remove them once banners have their own system
/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export type BannerNotification = Omit<AlertBannerProps, 'borderless'> & {
    style: NotificationStyle.Banner
    id: string
}

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export const isAlertNotification = (
    notification: Notification,
): notification is AlertNotification =>
    notification.style === NotificationStyle.Alert ||
    notification.style === undefined

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export const isBannerNotification = (
    notification: Notification,
): notification is BannerNotification =>
    notification.style === NotificationStyle.Banner

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export type BannerNotificationFromBackend = Omit<
    BannerNotification,
    'style'
> & {
    type: AlertBannerTypes
}

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export type Notification = AlertNotification | BannerNotification

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export type NotificationButton = {
    name: string
    primary?: boolean
    onClick?: (...args: any[]) => void
}

/**
 * @deprecated Use the axiom `toast` API from `@gorgias/axiom` instead.
 */
export type HandleUsageBanner = {
    newAccountStatus: string
    currentAccountStatus: string
    notification?: BannerNotificationFromBackend
}
