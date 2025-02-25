import React, { useEffect, useState } from 'react'

import classnames from 'classnames'

import {
    useGetVoiceCallRecordingTranscription,
    VoiceCallRecordingTranscriptionSpeakersItem,
    VoiceCallRecordingTranscriptionTranscriptionItem,
} from '@gorgias/api-queries'

import { VoiceCallRecordingType } from 'models/voiceCall/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'

import TranscriptionReply from './TranscriptionReply'

import css from './TranscriptionData.less'

type Props = {
    recordingType: VoiceCallRecordingType
    recordingId: number
}
const DEFAULT_REPLY_COUNT = 7

export default function TranscriptionData({
    recordingId,
    recordingType,
}: Props) {
    const [showMore, setShowMore] = useState(true)
    const [speakerMapping, setSpeakerMapping] = useState<
        Record<string, VoiceCallRecordingTranscriptionSpeakersItem>
    >({})
    const [displayedData, setDisplayedData] = useState<
        readonly VoiceCallRecordingTranscriptionTranscriptionItem[]
    >([])

    const { data, isLoading, isError, refetch } =
        useGetVoiceCallRecordingTranscription(recordingId, {
            query: {
                select: (data) => data.data,
            },
        })

    useEffect(() => {
        if (!data) {
            return
        }
        const { speakers, transcription } = data
        if (speakers.length > 0) {
            setSpeakerMapping(
                speakers.reduce(
                    (acc, item) => ({
                        ...acc,
                        [`${item.channel}-${item.speaker}`]: item,
                    }),
                    {},
                ),
            )
        }

        if (transcription.length > 0) {
            setDisplayedData(
                showMore
                    ? transcription.slice(0, DEFAULT_REPLY_COUNT)
                    : transcription,
            )
        }
    }, [data, setDisplayedData, showMore])

    const entityLabel =
        recordingType === VoiceCallRecordingType.Recording
            ? 'call'
            : 'voicemail'

    if (isLoading) {
        return (
            <Alert icon type={AlertType.Loading}>
                {`We're currently loading the ${entityLabel} transcription. This may take a few moments.`}
            </Alert>
        )
    }

    if (isError || data.error_message) {
        return (
            <Alert
                icon
                type={AlertType.Error}
                customActions={
                    isError && (
                        <Button fillStyle={'ghost'} onClick={() => refetch()}>
                            Try again
                        </Button>
                    )
                }
            >
                {`Unable to load ${entityLabel} transcription.`}
            </Alert>
        )
    }

    if (data.transcription.length === 0) {
        return (
            <Alert icon type={AlertType.Error}>
                {`Audio quality of this ${entityLabel} was too poor to generate an accurate transcription. Please check your microphone and internet quality to ensure clear audio.`}
            </Alert>
        )
    }

    return (
        <>
            <div className={css.transcription}>
                <div className={css.replies}>
                    {displayedData.map((reply, index) => (
                        <TranscriptionReply
                            key={index}
                            speakerMapping={speakerMapping}
                            {...reply}
                        />
                    ))}
                </div>
                {data.transcription?.length > DEFAULT_REPLY_COUNT && (
                    <div
                        className={css.showMore}
                        onClick={() => {
                            setShowMore((showMore) => !showMore)
                        }}
                    >
                        Show {showMore ? 'More' : 'Less'}
                        <i className={classnames('material-icons', css.arrow)}>
                            {showMore
                                ? 'keyboard_arrow_down'
                                : 'keyboard_arrow_up'}
                        </i>
                    </div>
                )}
            </div>
        </>
    )
}
