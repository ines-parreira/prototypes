import React, {useEffect, useState} from 'react'
import {Map, fromJS} from 'immutable'

import TimedeltaPicker from 'pages/common/forms/TimedeltaPicker'

import css from './SnoozeTicketAction.less'

type Props = {
    index: number
    updateActionArgs: (index: number, args: unknown) => void
    action: Map<string, any>
}

export default function SnoozeTicketAction(props: Props) {
    const units = [
        {label: 'minute(s)', value: 'm'},
        {label: 'hour(s)', value: 'h'},
        {label: 'day(s)', value: 'd'},
    ]
    const {index, action, updateActionArgs} = props
    const defaultDuration = action.getIn(
        ['arguments', 'snooze_timedelta'],
        '1d'
    )
    const [duration, setDuration] = useState(defaultDuration)
    useEffect(() => {
        updateActionArgs(index, fromJS({snooze_timedelta: defaultDuration}))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onChange = (value: string) => {
        setDuration(value)
        updateActionArgs(index, fromJS({snooze_timedelta: value}))
        return null
    }

    return (
        <TimedeltaPicker
            className={css.timedeltaPicker}
            units={units}
            value={duration}
            min={1}
            onChange={onChange}
        />
    )
}
