import React from 'react'

import Alert, {AlertType} from '../../../common/components/Alert/Alert'

import {ZendeskIntegrationMeta} from '../../../../models/integration/types'
import {ImportStatus} from './types'

interface ImportStatusAlertProps {
    integrationMeta: ZendeskIntegrationMeta
}

const ImportStatusAlert = ({integrationMeta}: ImportStatusAlertProps) => {
    const importStatus = integrationMeta.status
    if (importStatus === ImportStatus.Pending) {
        return (
            <Alert icon={<i className="material-icons md-spin">refresh</i>}>
                <span>Importing your Zendesk data</span>
            </Alert>
        )
    } else if (importStatus === ImportStatus.Success) {
        const synchronizationEnabled =
            integrationMeta.continuous_import_enabled || false
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
            {integrationMeta.error ||
                'Import failed. Please contact our support.'}
        </Alert>
    )
}

export default ImportStatusAlert
