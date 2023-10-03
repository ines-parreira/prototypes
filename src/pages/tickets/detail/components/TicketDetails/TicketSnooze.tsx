import React, {useRef} from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import {formatDatetime} from 'utils'

import css from './TicketSnooze.less'

type Props = {
    datetime?: string
    timezone: string | null
}

const TicketSnooze = ({datetime, timezone}: Props) => {
    const badgeRef = useRef<HTMLDivElement>(null)

    if (!datetime) return null

    return (
        <>
            <span ref={badgeRef} className={css.badge}>
                <Badge type={ColorType.Blue}>Snoozed</Badge>
            </span>
            <Tooltip placement="bottom" target={badgeRef}>
                Snoozed until {formatDatetime(datetime, timezone)}
            </Tooltip>
        </>
    )
}

export default TicketSnooze
