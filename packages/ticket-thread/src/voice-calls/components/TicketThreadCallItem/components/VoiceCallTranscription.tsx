import { useState } from 'react'

import {
    Box,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    DropdownIcon,
    Text,
} from '@gorgias/axiom'
import type { VoiceCallRecording } from '@gorgias/helpdesk-types'

import {
    VoiceCallRecordingTranscriptionStatus,
    VoiceCallRecordingType,
} from '#voice-calls/models/types'
import { VoiceCallTranscriptionData } from './VoiceCallTranscriptionData'

type VoiceCallTranscriptionProps = {
    audio: VoiceCallRecording
    type: VoiceCallRecordingType
}

export function VoiceCallTranscription({
    audio,
    type,
}: VoiceCallTranscriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!!audio.deleted_datetime || !!audio.error_code) {
        return null
    }

    const entity =
        type === VoiceCallRecordingType.Recording ? 'call' : 'voicemail'
    const maxRecordingLength =
        type === VoiceCallRecordingType.Recording ? 20 : 8

    switch (audio.transcription_status) {
        case VoiceCallRecordingTranscriptionStatus.Completed:
            if (!audio.id) {
                return null
            }
            return (
                <Disclosure onExpandedChange={setIsExpanded}>
                    <DisclosureHeader
                        title={({ isExpanded }) => (
                            <Box gap="xxs" alignItems="center">
                                <Text size="sm" variant="bold">
                                    Call transcription
                                </Text>
                                <DropdownIcon isOpen={isExpanded} size="sm" />
                            </Box>
                        )}
                        trailingSlot={null}
                    />
                    <DisclosurePanel pt="xxs">
                        <VoiceCallTranscriptionData
                            recordingType={type}
                            recordingId={audio.id}
                            enabled={isExpanded}
                        />
                    </DisclosurePanel>
                </Disclosure>
            )
        case VoiceCallRecordingTranscriptionStatus.Requested:
            return (
                <Text color="content-neutral-secondary">
                    We&apos;re currently processing the audio to create an
                    accurate transcription of the {entity}. This may take a few
                    moments.
                </Text>
            )
        case VoiceCallRecordingTranscriptionStatus.LowQualityTranscription:
            return (
                <Text color="content-error-default">
                    Audio quality of this {entity} was too poor to generate an
                    accurate transcription. Please check your microphone and
                    internet quality to ensure clear audio.
                </Text>
            )
        case VoiceCallRecordingTranscriptionStatus.Failed:
            return (
                <Text color="content-error-default">
                    Unable to process {entity} transcription.
                </Text>
            )
        case VoiceCallRecordingTranscriptionStatus.RecordingTooLong:
            return (
                <Text color="content-warning-default">
                    We only support {entity}s up to 45 minutes in length. This{' '}
                    {entity} exceeds that duration, so we are unable to
                    transcribe.
                </Text>
            )
        case VoiceCallRecordingTranscriptionStatus.RecordingTooShort:
            return (
                <Text color="content-warning-default">
                    We do not support {entity}s shorter than{' '}
                    {maxRecordingLength} seconds. This {entity} falls below our
                    minimum supported duration, so we are unable to transcribe.
                </Text>
            )
        default:
            return null
    }
}
