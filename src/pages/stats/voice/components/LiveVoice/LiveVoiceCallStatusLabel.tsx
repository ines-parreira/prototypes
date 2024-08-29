import {VoiceCallDirection} from '@gorgias/api-queries'
import React from 'react'
import classNames from 'classnames'
import {VoiceCallSummary} from 'pages/stats/voice/models/types'
import {
    isLiveInboundVoiceCallAnswered,
    isLiveOutboundCallRinging,
} from './utils'

import css from './LiveVoiceCallStatusLabel.less'

type Props = {
    direction: VoiceCallDirection
    status: VoiceCallSummary['status']
}

export default function LiveVoiceCallStatusLabel({direction, status}: Props) {
    const isOutbound = direction === VoiceCallDirection.Outbound

    if (isOutbound && isLiveOutboundCallRinging(status)) {
        return <div className={css.status}>Ringing</div>
    }

    if (isOutbound || isLiveInboundVoiceCallAnswered(status)) {
        return (
            <div className={classNames(css.status, css.active)}>
                In progress
            </div>
        )
    }

    return <div className={css.status}>In queue</div>
}
