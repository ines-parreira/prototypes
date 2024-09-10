import React from 'react'
import {useListRecordings} from 'models/voiceCall/queries'
import {VoiceCall, VoiceCallRecordingType} from 'models/voiceCall/types'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import VoiceCallAudio from './VoiceCallAudio'

import css from './TicketVoiceCallContainer.less'
import VoiceCallTranscription from './VoiceCallTranscription'

type Props = {
    voiceCall: VoiceCall
    type: VoiceCallRecordingType
}

export default function TicketVoiceCallAudios({type, voiceCall}: Props) {
    const {data, isLoading, error} = useListRecordings(
        {call_id: voiceCall.id},
        {staleTime: Infinity}
    )

    const audios = data?.data?.data
        .filter((recording) => recording.type === type)
        .sort((a, b) => a.created_datetime.localeCompare(b.created_datetime))

    if (isLoading) {
        return <Skeleton width={424} height={60} />
    }

    if (!audios || audios.length === 0 || error) {
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

    return (
        <div className={css.recordings}>
            {audios.map((audio) => (
                <div className={css.recording} key={audio.id}>
                    <VoiceCallAudio
                        audio={audio}
                        type={type}
                        voiceCall={voiceCall}
                    />
                    <VoiceCallTranscription audio={audio} type={type} />
                </div>
            ))}
        </div>
    )
}
