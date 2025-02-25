import React from 'react'

import { DateTimeResultFormatType } from 'constants/datetime'
import { ZendeskIntegration } from 'models/integration/types'
import { formatDatetime } from 'utils'

import { ImportStatus } from './types'

export const getImportCompletionDate = (
    integration: ZendeskIntegration,
    datetimeFormat: DateTimeResultFormatType,
    timezone: string | null,
): React.ReactChild => {
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
