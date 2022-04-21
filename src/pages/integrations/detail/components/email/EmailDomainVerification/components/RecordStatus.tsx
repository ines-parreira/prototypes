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
                    'material-icons',
                    'green'
                )}
            >
                done
            </i>
        )
    }

    return (
        <i className={classnames(css['status-icon'], 'material-icons', 'red')}>
            clear
        </i>
    )
}

export default RecordStatus
