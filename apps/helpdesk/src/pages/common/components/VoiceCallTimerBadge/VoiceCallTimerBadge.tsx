import React, { useEffect, useState } from 'react'

import { useInterval } from '@repo/hooks'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import { getFormattedDurationOngoingCall } from 'models/voiceCall/utils'

import css from './VoiceCallTimerBadge.less'

type Props = {
    datetime: string
}

export default function VoiceCallTimerBadge({ datetime }: Props) {
    const [displayedDuration, setDisplayedDuration] = useState(
        getFormattedDurationOngoingCall(datetime),
    )

    useEffect(() => {
        setDisplayedDuration(getFormattedDurationOngoingCall(datetime))
    }, [datetime])

    useInterval(() => {
        setDisplayedDuration(getFormattedDurationOngoingCall(datetime))
    }, 1000)

    return (
        <Badge type={'light-grey'} className={css.badge}>
            <i className="icon material-icons-outlined">timer</i>
            <div>{displayedDuration}</div>
        </Badge>
    )
}
