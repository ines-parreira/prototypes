import React from 'react'

import classNames from 'classnames'

import {
    VoiceCall,
    VoiceCallRecording,
    VoiceCallRecordingErrorCode,
    VoiceCallRecordingType,
} from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

import DownloadableDeletableRecording from '../PhoneEvent/DownloadableDeletableRecording'

import css from './TicketVoiceCallContainer.less'

type Props = {
    audio: VoiceCallRecording
    type: VoiceCallRecordingType
    voiceCall: VoiceCall
}

export default function VoiceCallAudio({ audio, type, voiceCall }: Props) {
    if (!!audio.deleted_datetime) {
        return (
            <div
                className={classNames(css.row, css.deletedRecording)}
                key={`deleted-${audio.id}`}
            >
                {config[type].label} manually deleted
                {audio.deleted_by_user_id && (
                    <>
                        {' '}
                        by{' '}
                        <VoiceCallAgentLabel
                            agentId={audio.deleted_by_user_id}
                        />
                    </>
                )}
            </div>
        )
    }

    if (audio.error_code === VoiceCallRecordingErrorCode.RECORDING_IS_PRIVATE) {
        return (
            <div
                className={css.privateRecording}
                data-testid="private-recording-warning"
                key={`private-${audio.id}`}
            >
                <div className="material-icons">warning</div>
                <div>The call recording is not available.</div>
            </div>
        )
    }

    return (
        <div className={css.audio} key={`audio-${audio.id}`}>
            <DownloadableDeletableRecording
                downloadRecordingURL={audio.url}
                deleteRecordingURL={`/api/integrations/${voiceCall.integration_id}/calls/${voiceCall.external_id}/${config[type].deletePath}/${audio.external_id}`}
                callId={voiceCall.id}
            />
        </div>
    )
}

const config = {
    [VoiceCallRecordingType.Recording]: {
        label: 'Call recording',
        deletePath: 'recordings',
    },
    [VoiceCallRecordingType.Voicemail]: {
        label: 'Voicemail recording',
        deletePath: 'voicemail-recordings',
    },
}
