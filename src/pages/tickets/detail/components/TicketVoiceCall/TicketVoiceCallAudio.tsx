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
        return <div>No audio</div>
    }

    if (!!audio?.deleted_datetime) {
        return (
            <div className={classNames(css.row, css.deletedRecording)}>
                {labels[type]} manually deleted
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
                deleteRecordingURL={`/api/integrations/${voiceCall.integration_id}/calls/${voiceCall.external_id}/recordings/${audio.external_id}`}
            />
        </div>
    )
}

const labels = {
    [VoiceCallRecordingType.Recording]: 'Call recording',
    [VoiceCallRecordingType.Voicemail]: 'Voicemail recording',
}
