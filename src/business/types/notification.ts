import {NotificationStatus} from '../../state/notifications/types'

export type Notification = {
    message: string
    status?: NotificationStatus.Warning
}
