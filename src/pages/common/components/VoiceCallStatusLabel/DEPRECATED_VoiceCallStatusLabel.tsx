import React from 'react'

import classNames from 'classnames'

import { VoiceCallDirection } from '@gorgias/api-queries'

import {
    DEPRECATED_getDisplayInboundVoiceCallStatus,
    DEPRECATED_getDisplayOutboundVoiceCallStatus,
    DEPRECATED_VoiceCallDisplayStatus,
    VoiceCallStatus,
} from 'models/voiceCall/types'

import css from './VoiceCallStatusLabel.less'

type Props = {
    voiceCallStatus: VoiceCallStatus
    direction: string
    lastAnsweredByAgentId?: number | null
}

const GREEN_STATUS = [
    DEPRECATED_VoiceCallDisplayStatus.Answered,
    DEPRECATED_VoiceCallDisplayStatus.InProgress,
]
const RED_STATUS = [
    DEPRECATED_VoiceCallDisplayStatus.Failed,
    DEPRECATED_VoiceCallDisplayStatus.Missed,
]
const DEPRECATED_VoiceCallStatusLabel = ({
    voiceCallStatus,
    direction,
    lastAnsweredByAgentId,
}: Props) => {
    const status =
        direction === VoiceCallDirection.Inbound
            ? DEPRECATED_getDisplayInboundVoiceCallStatus(
                  voiceCallStatus,
                  lastAnsweredByAgentId,
              )
            : DEPRECATED_getDisplayOutboundVoiceCallStatus(voiceCallStatus)

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

export default DEPRECATED_VoiceCallStatusLabel
