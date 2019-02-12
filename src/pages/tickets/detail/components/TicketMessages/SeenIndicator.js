//@flow
import React from 'react'

import Tooltip from '../../../../common/components/Tooltip'
import {formatDatetime} from '../../../../../utils'

type Props = {
    openedDatetime?: string,
    timezone: string,
}

export default (props: Props) => {
    const {openedDatetime, timezone} = props
    return (
        <span>
            <i
                id="read-status"
                className="material-icons mr-2"
            >
                check
            </i>
            <Tooltip
                placement="top"
                target="read-status"
            >
                Seen by customer{' '}
                {(() => {
                    if (!openedDatetime) {
                        return null
                    }
                    const datetime = formatDatetime(openedDatetime, timezone)
                    return typeof datetime === 'string' ? datetime.toLowerCase() : null
                })()}
            </Tooltip>
        </span>
    )
}
