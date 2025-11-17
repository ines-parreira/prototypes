import classnames from 'classnames'

import type { VoiceCallRecordingTranscriptionSpeakersItem } from '@gorgias/helpdesk-queries'

import { getFormattedDurationTranscriptionStart } from 'models/voiceCall/utils'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'

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
    const agentId = currentSpeaker?.agent_id
    const customerId = currentSpeaker?.customer_id

    const defaultSpeakerLabel = `Speaker ${speakerIndex ?? 'undefined'}`
    const defaultLabel = (
        <span
            className={classnames(
                css.replySpeaker,
                css[`speaker-${speakerColorIndex}`],
            )}
        >
            {defaultSpeakerLabel}
        </span>
    )
    const label = agentId ? (
        <VoiceCallAgentLabel agentId={agentId} />
    ) : customerId ? (
        <VoiceCallCustomerLabel
            customerId={customerId}
            phoneNumber={defaultSpeakerLabel}
        />
    ) : (
        defaultLabel
    )

    return (
        <div className={css.reply}>
            <div className={css.replyHeader}>
                {label}
                <span className={css.replyStartTime}>
                    {getFormattedDurationTranscriptionStart(start)}
                </span>
            </div>
            <div>{transcript}</div>
        </div>
    )
}
