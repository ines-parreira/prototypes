import {VoiceCallStatus} from './types'

export const isFinalVoiceCallStatus = (status: VoiceCallStatus) => {
    return [
        VoiceCallStatus.Busy,
        VoiceCallStatus.Canceled,
        VoiceCallStatus.Completed,
        VoiceCallStatus.Failed,
        VoiceCallStatus.NoAnswer,
    ].includes(status)
}
