import { Box, Skeleton, Text } from '@gorgias/axiom'

import { useVoiceCallRecordings } from '../../../hooks/useVoiceCallRecordings'
import type { VoiceCallRecordingType } from '../../../models/types'
import { VoiceCallAudioPlayer } from './VoiceCallAudioPlayer'
import { VoiceCallTranscription } from './VoiceCallTranscription'

type VoiceCallRecordingsProps = {
    callId: number
    type: VoiceCallRecordingType
}

export function VoiceCallRecordings({
    callId,
    type,
}: VoiceCallRecordingsProps) {
    const { recordings, isLoading, isError } = useVoiceCallRecordings(callId)

    const audios = recordings
        ?.filter((recording) => recording.type === type)
        .sort((a, b) =>
            (a.created_datetime ?? '').localeCompare(b.created_datetime ?? ''),
        )

    if (isLoading) {
        return <Skeleton width={424} height={60} />
    }

    if (!audios || audios.length === 0 || isError) {
        return (
            <Text color="content-error-default">
                <Text as="span" variant="bold">
                    Failed:
                </Text>{' '}
                Recording is not available.
            </Text>
        )
    }

    return (
        <Box flexDirection="column" gap="xs">
            {audios.map((audio) => (
                <VoiceCallAudioPlayer
                    key={audio.id}
                    audio={audio}
                    type={type}
                />
            ))}
        </Box>
    )
}

export function VoiceCallTranscriptions({
    callId,
    type,
}: VoiceCallRecordingsProps) {
    const { recordings, isLoading, isError } = useVoiceCallRecordings(callId)

    const audios = recordings
        ?.filter((recording) => recording.type === type)
        .sort((a, b) =>
            (a.created_datetime ?? '').localeCompare(b.created_datetime ?? ''),
        )

    if (isLoading || isError || !audios || audios.length === 0) {
        return null
    }

    return (
        <Box flexDirection="column" gap="xs">
            {audios.map((audio) => (
                <VoiceCallTranscription
                    key={audio.id}
                    audio={audio}
                    type={type}
                />
            ))}
        </Box>
    )
}
