import React from 'react'
import classNames from 'classnames'
import {useListRecordings} from 'models/voiceCall/queries'
import {VoiceCall, VoiceCallRecordingType} from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import DownloadableDeletableRecording from '../PhoneEvent/DownloadableDeletableRecording'

import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
    type: VoiceCallRecordingType
}

export default function TicketVoiceCallAudio({type, voiceCall}: Props) {
    const {data, isLoading, error} = useListRecordings(
        {call_id: voiceCall.id},
        {staleTime: Infinity}
    )

    const audio = data?.data?.data.find((recording) => recording.type === type)

    if (isLoading) {
        return <Skeleton width={424} height={60} />
    }

    if (!audio || error) {
        return (
            <div data-testid="recording-failure">
                <span className={css.errorStatus}>
                    <strong>Failed:</strong> Recording is not available.
                </span>{' '}
                You can learn more{' '}
                <a href="" target="_blank" rel="noopener noreferrer">
                    here
                </a>
                .
            </div>
        )
    }

    if (!!audio.deleted_datetime) {
        return (
            <div className={classNames(css.row, css.deletedRecording)}>
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

    return (
        <div className={css.audio}>
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
