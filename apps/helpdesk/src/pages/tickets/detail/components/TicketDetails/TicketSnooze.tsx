import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import { LegacyBadge as Badge, Tooltip, TooltipContent } from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import css from './TicketSnooze.less'

type Props = {
    datetime?: string
    timezone: string | null
    disabled?: boolean
}

const TicketSnooze = ({ datetime, timezone, disabled = false }: Props) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime,
    )

    if (!datetime) return null

    const badge = (
        <div className={css.badge}>
            <Badge type="blue">Snoozed</Badge>
        </div>
    )

    return (
        <Tooltip delay={0} placement="bottom" trigger={badge}>
            <TooltipContent
                title={
                    disabled
                        ? 'Not available in standalone mode'
                        : `Snoozed until ${formatDatetime(datetime, datetimeFormat, timezone)}`
                }
            />
        </Tooltip>
    )
}

export default TicketSnooze
