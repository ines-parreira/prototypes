import {VoiceCallDirection} from '@gorgias/api-queries'
import React from 'react'
import classNames from 'classnames'
import {VoiceCallSummary} from 'pages/stats/voice/models/types'
import {isLiveInboundVoiceCallAnswered} from './utils'

import css from './LiveVoiceCallStatusLabel.less'

type Props = {
    direction: VoiceCallDirection
    status: VoiceCallSummary['status']
}

export default function LiveVoiceCallStatusLabel({direction, status}: Props) {
    if (
        direction === VoiceCallDirection.Outbound ||
        isLiveInboundVoiceCallAnswered(status)
    ) {
        return (
            <div className={classNames(css.status, css.active)}>
                In progress
            </div>
        )
    }

    return <div className={css.status}>In queue</div>
}
