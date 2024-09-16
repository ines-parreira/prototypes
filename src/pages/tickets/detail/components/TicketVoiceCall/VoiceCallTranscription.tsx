import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    VoiceCallRecording,
    VoiceCallRecordingType,
    VoiceCallRecordingTranscriptionStatus,
} from 'models/voiceCall/types'
import {FeatureFlagKey} from 'config/featureFlags'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useVoiceRecordingsContext} from 'pages/common/hooks/useVoiceRecordingsContext'
import TranscriptionData from './TranscriptionData'
import ControlledCollapsibleDetails from './ControlledCollapsibleDetails'
import css from './TranscriptionData.less'

type Props = {
    audio: VoiceCallRecording
    type: VoiceCallRecordingType
}

export default function VoiceCallTranscription({audio, type}: Props) {
    const {isTranscriptionOpened, toggleTranscriptionOpened} =
        useVoiceRecordingsContext()
    const useCallRecordings =
        !!useFlags()[FeatureFlagKey.RecordingTranscriptions]

    if (!useCallRecordings || !!audio.deleted_datetime || !!audio.error_code) {
        return <></>
    }

    const entity =
        type === VoiceCallRecordingType.Recording ? 'call' : 'voicemail'

    switch (audio.transcription_status) {
        case VoiceCallRecordingTranscriptionStatus.Completed:
            return (
                <div className={css.collapsibleTranscription}>
                    <ControlledCollapsibleDetails
                        isOpen={isTranscriptionOpened(audio.id)}
                        setIsOpen={() => toggleTranscriptionOpened(audio.id)}
                        title={
                            <div className={css.title}>
                                <i className={'material-icons'}>call</i>
                                <span>
                                    {type === VoiceCallRecordingType.Recording
                                        ? 'Call'
                                        : 'Voicemail'}{' '}
                                    transcription
                                </span>
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
                    {`We do not support ${entity}s shorter than 20 seconds. This
                    ${entity} falls below our minimum supported duration, so we
                    are unable to transcribe.`}
                </Alert>
            )
        default:
            return <></>
    }
}
