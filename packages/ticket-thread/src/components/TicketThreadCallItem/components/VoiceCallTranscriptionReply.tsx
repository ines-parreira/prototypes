import { Box, Text } from '@gorgias/axiom'
import type { VoiceCallRecordingTranscriptionSpeakersItem } from '@gorgias/helpdesk-queries'

import { getFormattedDurationTranscriptionStart } from '../models/utils'
import { VoiceCallAgentLabel } from './VoiceCallAgentLabel'
import { VoiceCallCustomerLabel } from './VoiceCallCustomerLabel'

type VoiceCallTranscriptionReplyProps = {
    channel: number
    speaker: number
    start: number
    transcript: string
    speakerMapping: Record<string, VoiceCallRecordingTranscriptionSpeakersItem>
}

const SPEAKER_COLORS = [
    'content-accent-default',
    'content-neutral-default',
    'content-warning-default',
] as const

type SpeakerColor = (typeof SPEAKER_COLORS)[number]

function getSpeakerColor(
    speakerIndex: number | null,
): SpeakerColor | 'content-neutral-secondary' {
    if (speakerIndex === null) {
        return 'content-neutral-secondary'
    }
    return SPEAKER_COLORS[(speakerIndex - 1) % SPEAKER_COLORS.length]
}

export function VoiceCallTranscriptionReply({
    channel,
    speaker,
    start,
    transcript,
    speakerMapping,
}: VoiceCallTranscriptionReplyProps) {
    const currentSpeaker = speakerMapping[`${channel}-${speaker}`]

    const speakerIndex = currentSpeaker
        ? currentSpeaker.index_in_recording + 1
        : null
    const agentId = currentSpeaker?.agent_id
    const customerId = currentSpeaker?.customer_id

    const color = getSpeakerColor(speakerIndex)

    const label = agentId ? (
        <VoiceCallAgentLabel agentId={agentId} />
    ) : customerId ? (
        <VoiceCallCustomerLabel
            customerId={customerId}
            phoneNumber={`Speaker ${speakerIndex ?? undefined}`}
        />
    ) : (
        <Text as="span" variant="bold" color={color}>
            Speaker {speakerIndex ?? 'undefined'}
        </Text>
    )

    return (
        <Box flexDirection="column" width="100%">
            <Box
                flexDirection="row"
                justifyContent="space-between"
                gap="xxs"
                width="100%"
            >
                {label}
                <Text as="span" size="sm" color="content-neutral-secondary">
                    {getFormattedDurationTranscriptionStart(start)}
                </Text>
            </Box>
            <Text>{transcript}</Text>
        </Box>
    )
}
