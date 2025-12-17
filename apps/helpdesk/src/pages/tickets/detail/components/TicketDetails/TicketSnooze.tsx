import { useRef } from 'react'

import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import { LegacyBadge as Badge, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import css from './TicketSnooze.less'

type Props = {
    datetime?: string
    timezone: string | null
}

const TicketSnooze = ({ datetime, timezone }: Props) => {
    const badgeRef = useRef<HTMLDivElement>(null)
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime,
    )

    if (!datetime) return null

    return (
        <>
            <span ref={badgeRef} className={css.badge}>
                <Badge type={'blue'}>Snoozed</Badge>
            </span>
            <Tooltip placement="bottom" target={badgeRef}>
                {'Snoozed until '}
                {formatDatetime(datetime, datetimeFormat, timezone)}
            </Tooltip>
        </>
    )
}

export default TicketSnooze
