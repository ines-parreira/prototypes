import {Notification, NotificationButton} from 'state/notifications/types'
import {
    MigrationSession,
    MigrationSessionCreate,
    MigrationSessionStatus,
} from './types'

// If there's one of this states we can say the migration has started and it is in progress
export const sessionHasProgressStatus = (
    session: Pick<MigrationSession, 'status'> | null
) => {
    return (
        [
            MigrationSessionStatus.Pending,
            MigrationSessionStatus.Running,
            MigrationSessionStatus.Started,
        ] as string[]
    ).includes(session?.status || '')
}

export const getSessionCreateData = (
    helpCenterId: number,
    providerPayload: Record<string, any>,
    accessToken: string
): MigrationSessionCreate => ({
    migration: {
        provider: {
            ...(providerPayload as any), // the fields from here are dynamic so ignoring the type
        },
        receiver: {
            type: 'Gorgias',
            access_token: accessToken,
            help_center_id: helpCenterId,
        },
    },
})

export const longNotificationOptions: Notification = {
    dismissAfter: 20 * 1000,
    dismissible: true,
    showDismissButton: true,
}

export const notificationRefreshButton: NotificationButton = {
    name: 'Refresh',
    primary: true,
    onClick: () => {
        window.location.reload()
    },
}
