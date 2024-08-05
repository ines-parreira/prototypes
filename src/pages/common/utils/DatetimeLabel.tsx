import React from 'react'
import moment from 'moment-timezone'
import {UncontrolledTooltipProps} from 'reactstrap'
import classNames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'

import {DateAndTimeFormatting} from 'constants/datetime'
import {RECHARGE_INTEGRATION_TYPE} from 'constants/integration'
import useId from 'hooks/useId'
import {getDateAndTimeFormatter, getTimezone} from 'state/currentUser/selectors'
import {formatDatetime} from 'utils'
import useAppSelector from 'hooks/useAppSelector'

import css from './DatetimeLabel.less'

type Props = {
    breakDate?: boolean
    className?: string
    dateTime?: string
    hasTooltip?: boolean
    integrationType?: string
    labelFormat?: DateAndTimeFormatting
    placement?: UncontrolledTooltipProps['placement']
}

const DatetimeLabel = ({
    breakDate,
    className,
    dateTime: dateTimeProp,
    hasTooltip = true,
    integrationType,
    labelFormat,
    placement = 'top',
}: Props) => {
    const timezone = useAppSelector(getTimezone)
    const dateAndTimeFormatter = useAppSelector(getDateAndTimeFormatter)

    const id = `datetime-tooltip-${useId()}`

    if (!dateTimeProp) {
        return null
    }

    const dateTime =
        integrationType === RECHARGE_INTEGRATION_TYPE
            ? moment(dateTimeProp).tz('US/Eastern', true).toISOString(true)
            : dateTimeProp

    const labelDatetime = formatDatetime(
        dateTime,
        dateAndTimeFormatter(
            labelFormat || DateAndTimeFormatting.RelativeDateAndTime
        ),
        timezone
    )

    const tooltipDatetime = formatDatetime(
        dateTime,
        dateAndTimeFormatter(DateAndTimeFormatting.CompactDateWithTime),
        timezone
    )

    return (
        <span className={className}>
            <span id={id}>
                {breakDate
                    ? // u200B is the unicode character for 'ZERO WIDTH SPACE'
                      // it is intended for invisible word separation and line break control
                      // in this case it allows us to break the date at forward slashes
                      labelDatetime.toString().split('/').join('/\u200B')
                    : labelDatetime}
            </span>
            {hasTooltip && (
                <Tooltip
                    placement={placement}
                    target={id}
                    delay={{show: 200, hide: 0}}
                    className={classNames(css.datetimeTooltip)}
                >
                    {tooltipDatetime.toString()}
                </Tooltip>
            )}
        </span>
    )
}

export default DatetimeLabel
