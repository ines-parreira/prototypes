import {Alert} from 'reactstrap'
import classnames from 'classnames'
import {Map} from 'immutable'
import React from 'react'

import css from './ImportStatusAlert.less'
import {ImportStatus} from './types'

interface ImportStatusAlertProps {
    integrationMeta: Map<any, any>
}

const ImportStatusAlert = ({integrationMeta}: ImportStatusAlertProps) => {
    const alertHeadingClassName = classnames(css.heading)
    const importStatus = integrationMeta.get('status')
    if (importStatus === ImportStatus.Pending) {
        return (
            <Alert color="info">
                <b className={alertHeadingClassName}>
                    <i className="material-icons md-spin mr-3">refresh</i>
                    <span>Importing your Zendesk data</span>
                </b>
            </Alert>
        )
    } else if (importStatus === ImportStatus.Success) {
        const synchronizationEnabled = integrationMeta.get(
            'continuous_import_enabled',
            false
        )
        if (synchronizationEnabled) {
            return (
                <Alert color="success">
                    <b className={alertHeadingClassName}>
                        <i className="material-icons mr-3">check_circle</i>
                        <span>
                            Initial import successful, continuous
                            synchronization active.
                        </span>
                    </b>
                </Alert>
            )
        }
        return (
            <Alert color="info">
                <b className={alertHeadingClassName}>
                    <i className="material-icons mr-3">info_outline</i>
                    <span>
                        Initial import successful, continuous synchronization
                        paused.
                    </span>
                </b>
            </Alert>
        )
    }
    return (
        <Alert color="danger">
            <b className={alertHeadingClassName}>
                <i className="material-icons mr-3">error_outline</i>
                <span>
                    {integrationMeta.get(
                        'error',
                        'Import failed. Please contact our support.'
                    )}
                </span>
            </b>
        </Alert>
    )
}

export default ImportStatusAlert
