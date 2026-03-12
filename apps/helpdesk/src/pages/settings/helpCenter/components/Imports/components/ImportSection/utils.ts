import { isAxiosError } from 'axios'

import type {
    AlertNotification,
    NotificationButton,
} from 'state/notifications/types'

import type { MigrationFailuresSection } from './components/MigrationStateModal/components/MigrationFailuresDetails/MigrationFailuresDetails'
import type { QuickSummaryEntry } from './components/MigrationStateModal/components/MigrationQuickSummary/MigrationQuickSummary'
import type {
    DetailMessage,
    ErrorResponse,
    MigrationSession,
    MigrationSessionCreate,
    UnprocessableContent,
} from './types'
import { MigrationSessionStatus } from './types'

const sessionKeys: (keyof MigrationSession)[] = [
    'session',
    'session_id',
    'status',
]
/**
 * The response typings from some of the generated OpenAPI endpoints are something like `Components.Schemas.SessionLong | Components.Schemas.Detail` (.Detail is in case of error)
 *
 * We type guard the response for this reason
 */
export const responseIsSession = (
    responseData: any,
): responseData is MigrationSession =>
    sessionKeys.every((key) => key in responseData)
/**
 * The response typings from some of the generated OpenAPI endpoints are something like `Components.Schemas.SessionLong | Components.Schemas.Detail` (.Detail is in case of error)
 *
 * We type guard the response for this reason
 */
export const responseIsSessionsList = (
    responsesData: any[],
): responsesData is MigrationSession[] => responsesData.every(responseIsSession)

export const sessionHasProgressStatus = (
    session: Pick<MigrationSession, 'status'> | null,
) => {
    return (
        [
            // If there's one of this states we can say the migration has started and it is in progress
            MigrationSessionStatus.Pending,
            MigrationSessionStatus.Running,
            MigrationSessionStatus.Started,
        ] as string[]
    ).includes(session?.status || '')
}

export const getSessionCreateData = (
    helpCenterId: number,
    providerPayload: Record<string, any>,
    accessToken: string,
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

export const longNotificationOptions: AlertNotification = {
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

export interface ParsedSessionStats {
    totalImported: number
    totalFailed: number
    totalExported: number
    quickSummaryEntries: QuickSummaryEntry[]
    failuresSections: MigrationFailuresSection[]
}

export const parseSessionStats = (
    session: Pick<MigrationSession, 'stats'> | null,
): ParsedSessionStats => {
    const { articles, categories } = session?.stats || {}

    const processes = [articles, categories]
    return {
        totalExported: processes.reduce(
            (acc, process) => acc + (process?.export_count || 0),
            0,
        ),
        totalImported: processes.reduce(
            (acc, process) => acc + (process?.import_count || 0),
            0,
        ),
        totalFailed: processes.reduce(
            (acc, process) => acc + (process?.errors_count || 0),
            0,
        ),
        quickSummaryEntries: [
            {
                label: 'Articles',
                showAlways: true,
                exported: articles?.export_count || 0,
                imported: articles?.import_count || 0,
                failed: articles?.errors_count || 0,
            },
            {
                label: 'Categories',
                exported: categories?.export_count || 0,
                imported: categories?.import_count || 0,
                failed: categories?.errors_count || 0,
            },
        ],
        failuresSections: [
            {
                title: 'Articles',
                items:
                    articles?.errors_details?.map((item) => ({
                        title: item.instance_title as string,
                        message: item.error_message,
                    })) || [],
            },
            {
                title: 'Categories',
                items:
                    categories?.errors_details?.map((item) => ({
                        title: item.instance_title as string,
                        message: item.error_message,
                    })) || [],
            },
        ],
    }
}

export const getErrorMessage = (error: unknown): string | undefined => {
    if (!isAxiosError<ErrorResponse>(error)) return
    if (!error.response) return

    const errorData = error.response.data

    return (
        (errorData as UnprocessableContent)[0]?.msg ||
        (errorData as DetailMessage).message
    )
}
