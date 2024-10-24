import {VoiceCallRecordingTranscriptionSpeakersItem} from '@gorgias/api-queries'
import classnames from 'classnames'
import React from 'react'

import {getFormattedDurationTranscriptionStart} from 'models/voiceCall/utils'

import css from './TranscriptionData.less'

type TranscriptionReplyProps = {
    channel: number
    speaker: number
    start: number
    end: number
    transcript: string
    speakerMapping: Record<string, VoiceCallRecordingTranscriptionSpeakersItem>
}

export default function TranscriptionReply({
    channel,
    speaker,
    start,
    transcript,
    speakerMapping,
}: TranscriptionReplyProps) {
    const currentSpeaker = speakerMapping[`${channel}-${speaker}`]

    const speakerIndex = currentSpeaker
        ? currentSpeaker.index_in_recording + 1
        : null
    const speakerColorIndex = speakerIndex ? speakerIndex % 4 : 0

    return (
        <div className={css.reply}>
            <div className={css.replyHeader}>
                <span
                    className={classnames(
                        css.replySpeaker,
                        css[`speaker-${speakerColorIndex}`]
                    )}
                >{`Speaker ${speakerIndex ?? 'undefined'}`}</span>
                <span className={css.replyStartTime}>
                    {getFormattedDurationTranscriptionStart(start)}
                </span>
            </div>
            <div>{transcript}</div>
        </div>
    )
}
