import type { VoiceCallRecording } from 'models/voiceCall/types'
import {
    VoiceCallRecordingTranscriptionStatus,
    VoiceCallRecordingType,
} from 'models/voiceCall/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { useVoiceRecordingsContext } from 'pages/common/hooks/useVoiceRecordingsContext'

import ControlledCollapsibleDetails from './ControlledCollapsibleDetails'
import TranscriptionData from './TranscriptionData'

import css from './TranscriptionData.less'

type Props = {
    audio: VoiceCallRecording
    type: VoiceCallRecordingType
}

export default function VoiceCallTranscription({ audio, type }: Props) {
    const { isTranscriptionOpened, toggleTranscriptionOpened } =
        useVoiceRecordingsContext()

    if (!!audio.deleted_datetime || !!audio.error_code) {
        return <></>
    }

    const entity =
        type === VoiceCallRecordingType.Recording ? 'call' : 'voicemail'
    const maxRecordingLength =
        type === VoiceCallRecordingType.Recording ? 20 : 8

    switch (audio.transcription_status) {
        case VoiceCallRecordingTranscriptionStatus.Completed:
            return (
                <div className={css.collapsibleTranscription}>
                    <ControlledCollapsibleDetails
                        isOpen={isTranscriptionOpened(audio.id)}
                        setIsOpen={() => toggleTranscriptionOpened(audio.id)}
                        title={
                            <div className={css.title}>
                                <i className={'material-icons'}>notes</i>
                                <span>Transcription</span>
                            </div>
                        }
                    >
                        <TranscriptionData
                            recordingType={type}
                            recordingId={audio.id}
                        />
                    </ControlledCollapsibleDetails>
                </div>
            )
        case VoiceCallRecordingTranscriptionStatus.Requested:
            return (
                <Alert icon type={AlertType.Loading}>
                    {`We're currently processing the audio to create an accurate
                    transcription of the ${entity}. This may take a few
                    moments.`}
                </Alert>
            )
        case VoiceCallRecordingTranscriptionStatus.LowQualityTranscription:
            return (
                <Alert icon type={AlertType.Error}>
                    {`Audio quality of this ${entity} was too poor to generate an accurate transcription. Please check your microphone and internet quality to ensure clear audio.`}
                </Alert>
            )
        case VoiceCallRecordingTranscriptionStatus.Failed:
            return (
                <Alert icon type={AlertType.Error}>
                    {`Unable to process ${entity} transcription.`}
                </Alert>
            )
        case VoiceCallRecordingTranscriptionStatus.RecordingTooLong:
            return (
                <Alert icon type={AlertType.Warning}>
                    {`We only support ${entity}s up to 45 minutes in length. This
                    ${entity} exceeds that duration, so we are unable to
                    transcribe.`}
                </Alert>
            )
        case VoiceCallRecordingTranscriptionStatus.RecordingTooShort:
            return (
                <Alert icon type={AlertType.Warning}>
                    {`We do not support ${entity}s shorter than ${maxRecordingLength} seconds. This
                    ${entity} falls below our minimum supported duration, so we
                    are unable to transcribe.`}
                </Alert>
            )
        default:
            return <></>
    }
}
