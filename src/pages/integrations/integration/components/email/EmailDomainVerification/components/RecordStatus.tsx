import React from 'react'
import classnames from 'classnames'

import css from './RecordStatus.less'

type Props = {
    isVerified: boolean
}

const RecordStatus = ({isVerified}: Props) => {
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

    return (
        <i
            className={classnames(
                css['status-icon'],
                css.error,
                'material-icons'
            )}
        >
            cancel
        </i>
    )
}

export default RecordStatus
