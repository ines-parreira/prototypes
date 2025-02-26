import React from 'react'

import classNames from 'classnames'

import { VoiceCallDisplayStatus } from 'models/voiceCall/types'

import css from './VoiceCallStatusLabel.less'

type Props = {
    displayStatus: VoiceCallDisplayStatus
}

const getPrettyDisplayName = (status: VoiceCallDisplayStatus) => {
    switch (status) {
        case VoiceCallDisplayStatus.Ringing:
            return 'Ringing'
        case VoiceCallDisplayStatus.InProgress:
            return 'In Progress'
        case VoiceCallDisplayStatus.Answered:
            return 'Answered'
        case VoiceCallDisplayStatus.Missed:
            return 'Missed'
        case VoiceCallDisplayStatus.Abandoned:
            return 'Abandoned'
        case VoiceCallDisplayStatus.Cancelled:
            return 'Cancelled'
        case VoiceCallDisplayStatus.Failed:
            return 'Failed'
        case VoiceCallDisplayStatus.Unanswered:
            return 'Unanswered'
    }
}

const getColorClass = (status: VoiceCallDisplayStatus) => {
    switch (status) {
        case VoiceCallDisplayStatus.InProgress:
        case VoiceCallDisplayStatus.Answered:
            return css.greenStatus
        case VoiceCallDisplayStatus.Missed:
        case VoiceCallDisplayStatus.Failed:
        case VoiceCallDisplayStatus.Unanswered:
        case VoiceCallDisplayStatus.Abandoned:
            return css.redStatus
        case VoiceCallDisplayStatus.Ringing:
        case VoiceCallDisplayStatus.Cancelled:
        default:
            return css.greyStatus
    }
}

const VoiceCallStatusLabel = ({ displayStatus }: Props) => {
    return (
        <div className={classNames(getColorClass(displayStatus))}>
            {getPrettyDisplayName(displayStatus)}
        </div>
    )
}

export default VoiceCallStatusLabel
