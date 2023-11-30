import classNames from 'classnames'
import React from 'react'

import Tooltip from 'pages/common/components/Tooltip'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {formatDatetime} from 'utils'

import css from './SeenIndicator.style.less'

enum SeenIndicatorStatus {
    DELIVERED = 'Delivered',
    READ = `Read`,
}
type Props = {
    displayMessageStatusIndicator: boolean
    iconElementId: number
    openedDatetime?: string | null
    sentDatetime?: string | null
    timezone: string
}

export default function SeenIndicator(props: Props) {
    const {
        displayMessageStatusIndicator,
        iconElementId,
        openedDatetime,
        timezone,
    } = props
    const indicator = openedDatetime ? 'done_all' : 'done'
    const elementId = `seen-indicator-id-${iconElementId}`

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime
    )

    const getSeenIndicatorTooltipText = ({
        openedDatetime,
        timezone,
    }: Pick<Props, 'openedDatetime' | 'timezone'>) => {
        if (!openedDatetime) {
            return SeenIndicatorStatus.DELIVERED
        }

        const datetime = formatDatetime(
            openedDatetime,
            datetimeFormat,
            timezone
        )

        return typeof datetime === 'string'
            ? `${SeenIndicatorStatus.READ} ${datetime.toLowerCase()}`
            : SeenIndicatorStatus.DELIVERED
    }

    return (
        <span>
            {displayMessageStatusIndicator && (
                <>
                    <i
                        id={elementId}
                        className={classNames('material-icons mr-2')}
                    >
                        {indicator}
                    </i>
                    <Tooltip
                        placement="top"
                        target={elementId}
                        className={css.tooltip}
                    >
                        {getSeenIndicatorTooltipText({
                            openedDatetime,
                            timezone,
                        })}
                    </Tooltip>
                </>
            )}
        </span>
    )
}
