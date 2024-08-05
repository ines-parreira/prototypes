import React from 'react'
import classnames from 'classnames'

import css from './RecordStatus.less'

type Props = {
    isVerified: boolean
    isPending?: boolean
    isRequested?: boolean
}

const RecordStatus = ({isVerified, isPending, isRequested}: Props) => {
    if (isPending) {
        return (
            <i
                className={classnames(
                    css['status-icon'],
                    css.pending,
                    'material-icons'
                )}
            >
                timelapse
            </i>
        )
    }

    if (isVerified) {
        return (
            <i
                className={classnames(
                    css['status-icon'],
                    css.success,
                    'material-icons'
                )}
            >
                check_circle
            </i>
        )
    }

    if (!isRequested) {
        return null
    }

    return (
        <i
            className={classnames(
                css['status-icon'],
                css.error,
                'material-icons'
            )}
        >
            close
        </i>
    )
}

export default RecordStatus
