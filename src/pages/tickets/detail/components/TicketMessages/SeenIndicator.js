//@flow
import React from 'react'

import {formatDatetime} from '../../../../../utils'
import Tooltip from '../../../../common/components/Tooltip'

import css from './SeenIndicator.style.less'

type Props = {
    openedDatetime?: string,
    timezone: string,
}

export default function SeenIndicator(props: Props) {
    const {openedDatetime, timezone} = props
    return (
        <span>
            <i id="read-status" className="material-icons mr-2">
                check
            </i>
            <Tooltip
                placement="top"
                target="read-status"
                className={css.tooltip}
            >
                Seen by customer{' '}
                {(() => {
                    if (!openedDatetime) {
                        return null
                    }
                    const datetime = formatDatetime(openedDatetime, timezone)
                    return typeof datetime === 'string'
                        ? datetime.toLowerCase()
                        : null
                })()}
            </Tooltip>
        </span>
    )
}
