import {Tooltip} from '@gorgias/ui-kit'
import React, {useRef} from 'react'

import {DateAndTimeFormatting} from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {formatDatetime} from 'utils'

import css from './TicketSnooze.less'

type Props = {
    datetime?: string
    timezone: string | null
}

const TicketSnooze = ({datetime, timezone}: Props) => {
    const badgeRef = useRef<HTMLDivElement>(null)
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime
    )

    if (!datetime) return null

    return (
        <>
            <span ref={badgeRef} className={css.badge}>
                <Badge type={ColorType.Blue}>Snoozed</Badge>
            </span>
            <Tooltip placement="bottom" target={badgeRef}>
                {'Snoozed until '}
                {formatDatetime(datetime, datetimeFormat, timezone)}
            </Tooltip>
        </>
    )
}

export default TicketSnooze
