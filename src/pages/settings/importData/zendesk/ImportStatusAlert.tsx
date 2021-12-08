import {Map} from 'immutable'
import React from 'react'

import Alert, {AlertType} from '../../../common/components/Alert/Alert'

import {ImportStatus} from './types'

interface ImportStatusAlertProps {
    integrationMeta: Map<any, any>
}

const ImportStatusAlert = ({integrationMeta}: ImportStatusAlertProps) => {
    const importStatus = integrationMeta.get('status')
    if (importStatus === ImportStatus.Pending) {
        return (
            <Alert icon={<i className="material-icons md-spin">refresh</i>}>
                <span>Importing your Zendesk data</span>
            </Alert>
        )
    } else if (importStatus === ImportStatus.Success) {
        const synchronizationEnabled = integrationMeta.get(
            'continuous_import_enabled',
            false
        )
        if (synchronizationEnabled) {
            return (
                <Alert type={AlertType.Success} icon>
                    Initial import successful, continuous synchronization
                    active.
                </Alert>
            )
        }
        return (
            <Alert icon>
                Initial import successful, continuous synchronization paused.
            </Alert>
        )
    }
    return (
        <Alert type={AlertType.Error} icon>
            {integrationMeta.get(
                'error',
                'Import failed. Please contact our support.'
            )}
        </Alert>
    )
}

export default ImportStatusAlert
