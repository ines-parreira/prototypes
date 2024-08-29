import React, {useEffect, useState} from 'react'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {getFormattedDurationOngoingCall} from 'models/voiceCall/utils'

import useInterval from 'hooks/useInterval'
import css from './VoiceCallTimerBadge.less'

type Props = {
    datetime: string
}

export default function VoiceCallTimerBadge({datetime}: Props) {
    const [displayedDuration, setDisplayedDuration] = useState(
        getFormattedDurationOngoingCall(datetime)
    )

    useEffect(() => {
        setDisplayedDuration(getFormattedDurationOngoingCall(datetime))
    }, [datetime])

    useInterval(() => {
        setDisplayedDuration(getFormattedDurationOngoingCall(datetime))
    }, 1000)

    return (
        <Badge type={ColorType.LightGrey} className={css.badge}>
            <i className="icon material-icons-outlined">timer</i>
            <div>{displayedDuration}</div>
        </Badge>
    )
}
