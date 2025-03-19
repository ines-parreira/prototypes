import classNames from 'classnames'

import {
    getPrettyVoiceCallDisplayStatusName,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'

import css from './VoiceCallStatusLabel.less'

type Props = {
    displayStatus: VoiceCallDisplayStatus | null
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
    if (displayStatus === null) {
        return null
    }

    return (
        <div className={classNames(getColorClass(displayStatus))}>
            {getPrettyVoiceCallDisplayStatusName(displayStatus)}
        </div>
    )
}

export default VoiceCallStatusLabel
