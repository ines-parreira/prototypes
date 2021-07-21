import classnames from 'classnames'
import React, {useRef} from 'react'

import Tooltip from '../../../../common/components/Tooltip'
import {formatDatetime} from '../../../../../utils'

import css from './TicketSnooze.less'

type Props = {
    className?: string
    datetime?: string
    timezone: string | null
}

const TicketSnooze = ({className, datetime, timezone}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null)

    return datetime ? (
        <>
            <div
                ref={wrapperRef}
                className={classnames(css.wrapper, className)}
            >
                <i className={classnames('icon material-icons', css.icon)}>
                    snooze
                </i>
                <span className={css.label}>Snoozed Ticket</span>
            </div>
            <Tooltip placement="bottom" target={wrapperRef}>
                Snooze {formatDatetime(datetime, timezone)}
            </Tooltip>
        </>
    ) : null
}

export default TicketSnooze
