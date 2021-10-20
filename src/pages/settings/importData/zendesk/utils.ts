import {Map} from 'immutable'
import React from 'react'

import {formatDatetime} from '../../../../../js/utils'

import {ImportStatus} from './types'

export const getImportCompletionDate = (
    integration: Map<any, any>,
    timezone: string | null
): React.ReactChild => {
    const importStatus = integration.getIn(['meta', 'status'])
    const dateTimeFormat = 'L LT'

    if (importStatus === ImportStatus.Pending) {
        return `Started on ${formatDatetime(
            integration.get('created_datetime'),
            timezone,
            dateTimeFormat
        ).toString()}`
    } else if (importStatus === ImportStatus.Success) {
        return `Completed on ${formatDatetime(
            integration.get('updated_datetime'),
            timezone,
            dateTimeFormat
        ).toString()}`
    }
    return `Last updated on ${formatDatetime(
        integration.get('updated_datetime'),
        timezone,
        dateTimeFormat
    ).toString()}`
}
