import type { ReactNode } from 'react'

import { formatDatetime } from '@repo/utils'
import type { DateTimeResultFormatType } from '@repo/utils'

import type { ZendeskIntegration } from 'models/integration/types'

import { ImportStatus } from './types'

export const getImportCompletionDate = (
    integration: ZendeskIntegration,
    datetimeFormat: DateTimeResultFormatType,
    timezone: string | null,
): ReactNode => {
    const importStatus = integration.meta.status

    if (importStatus === ImportStatus.Pending) {
        return `Started on ${formatDatetime(
            integration.created_datetime,
            datetimeFormat,
            timezone,
        ).toString()}`
    } else if (importStatus === ImportStatus.Success) {
        return `Completed on ${formatDatetime(
            integration.updated_datetime,
            datetimeFormat,
            timezone,
        ).toString()}`
    }
    return `Last updated on ${formatDatetime(
        integration.updated_datetime,
        datetimeFormat,
        timezone,
    ).toString()}`
}
