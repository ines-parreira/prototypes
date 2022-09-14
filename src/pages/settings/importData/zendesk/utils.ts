import React from 'react'

import {formatDatetime} from '../../../../../js/utils'

import {ZendeskIntegration} from '../../../../models/integration/types'
import {ImportStatus} from './types'

export const getImportCompletionDate = (
    integration: ZendeskIntegration,
    timezone: string | null
): React.ReactChild => {
    const importStatus = integration.meta.status
    const dateTimeFormat = 'L LT'

    if (importStatus === ImportStatus.Pending) {
        return `Started on ${formatDatetime(
            integration.created_datetime,
            timezone,
            dateTimeFormat
        ).toString()}`
    } else if (importStatus === ImportStatus.Success) {
        return `Completed on ${formatDatetime(
            integration.updated_datetime,
            timezone,
            dateTimeFormat
        ).toString()}`
    }
    return `Last updated on ${formatDatetime(
        integration.updated_datetime,
        timezone,
        dateTimeFormat
    ).toString()}`
}
