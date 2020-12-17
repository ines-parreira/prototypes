import {Map} from 'immutable'
import React from 'react'
import moment from 'moment'

import {ImportStatus} from './types'

export const getImportCompletionDate = (
    integration: Map<any, any>
): React.ReactChild => {
    const importStatus = integration.getIn(['meta', 'status'])
    const dateTimeFormat = 'DD/MM/YYYY h:mm A'

    if (importStatus === ImportStatus.Pending) {
        return `Started on ${moment(integration.get('created_datetime')).format(
            dateTimeFormat
        )}`
    } else if (importStatus === ImportStatus.Success) {
        return `Completed on ${moment(
            integration.get('updated_datetime')
        ).format(dateTimeFormat)}`
    }
    return `Last updated on ${moment(
        integration.get('updated_datetime')
    ).format(dateTimeFormat)}`
}
