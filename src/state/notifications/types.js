//@flow
import {NOTIFICATION_STATUS} from './constants.ts'

export type NotificationStatus = $Values<typeof NOTIFICATION_STATUS>

export type Notification = {
    status: NotificationStatus,
    message?: string,
    id?: ?string,
    title?: string,
    type?: NotificationStatus,
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
