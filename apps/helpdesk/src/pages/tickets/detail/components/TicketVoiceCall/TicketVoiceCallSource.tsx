import { DateAndTimeFormatting } from '@repo/utils'
import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import css from './TicketVoiceCallContainer.less'

type TicketVoiceCallSourceProps = {
    to: string
    from: string
    icon: string
    id: string
    date: string
}

export default function TicketVoiceCallSource({
    to,
    from,
    icon,
    id,
    date,
}: TicketVoiceCallSourceProps) {
    return (
        <div data-testid="TTTTT">
            <i
                id={id}
                className={classNames(
                    'material-icons',
                    css.phoneIcon,
                    'clickable',
                )}
            >
                {icon}
            </i>
            <Tooltip target={id} placement="bottom" autohide={false}>
                <ul className={css.sourceDetails}>
                    {Object.entries({
                        from,
                        to,
                        channel: TicketChannel.Phone,
                        date: (
                            <DatetimeLabel
                                dateTime={date}
                                labelFormat={
                                    DateAndTimeFormatting.CompactDateWithTime
                                }
                            />
                        ),
                    }).map(([key, value], index) => (
                        <li key={index} className={css.sourceDetail}>
                            <span className={css.sourceLabel}>{key}: </span>
                            <strong>{value}</strong>
                        </li>
                    ))}
                </ul>
            </Tooltip>
        </div>
    )
}
