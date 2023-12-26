import React from 'react'
import classNames from 'classnames'
import {
    getDisplayInboundVoiceCallStatus,
    getDisplayOutboundVoiceCallStatus,
    VoiceCallDisplayStatus,
    VoiceCallStatus,
} from 'models/voiceCall/types'

import css from './VoiceCallStatusLabel.less'

type Props = {
    voiceCallStatus: VoiceCallStatus
    direction: string
}

const GREEN_STATUS = [
    VoiceCallDisplayStatus.Answered,
    VoiceCallDisplayStatus.InProgress,
]
const RED_STATUS = [
    VoiceCallDisplayStatus.Failed,
    VoiceCallDisplayStatus.Missed,
]
const VoiceCallStatusLabel = ({voiceCallStatus, direction}: Props) => {
    const status =
        direction === 'inbound'
            ? getDisplayInboundVoiceCallStatus(voiceCallStatus)
            : getDisplayOutboundVoiceCallStatus(voiceCallStatus)

    return (
        <div
            className={classNames({
                [css.greenStatus]: status && GREEN_STATUS.includes(status),
                [css.redStatus]: status && RED_STATUS.includes(status),
            })}
        >
            {status}
        </div>
    )
}

export default VoiceCallStatusLabel
