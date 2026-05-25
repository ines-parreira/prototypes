import { useEffect, useState } from 'react'

import {
    Box,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    Text,
} from '@gorgias/axiom'
import type { VoiceCallRecordingTranscriptionSpeakersItem } from '@gorgias/helpdesk-queries'
import { useGetVoiceCallRecordingTranscription } from '@gorgias/helpdesk-queries'

import { VoiceCallRecordingType } from '../models/types'
import { VoiceCallTranscriptionReply } from './VoiceCallTranscriptionReply'

import css from './VoiceCallTranscriptionData.less'

type VoiceCallTranscriptionDataProps = {
    recordingType: VoiceCallRecordingType
    recordingId: number
    enabled: boolean
}

export function VoiceCallTranscriptionData({
    recordingId,
    recordingType,
    enabled,
}: VoiceCallTranscriptionDataProps) {
    const [speakerMapping, setSpeakerMapping] = useState<
        Record<string, VoiceCallRecordingTranscriptionSpeakersItem>
    >({})

    const { data, isInitialLoading, isError, refetch } =
        useGetVoiceCallRecordingTranscription(recordingId, {
            query: {
                enabled,
                select: (data) => data.data,
                staleTime: Infinity,
            },
        })

    useEffect(() => {
        if (!data) {
            return
        }
        const { speakers } = data
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
    }, [data])

    const entityLabel =
        recordingType === VoiceCallRecordingType.Recording
            ? 'call'
            : 'voicemail'

    if (isInitialLoading) {
        return (
            <Text color="content-neutral-secondary">
                We&apos;re currently loading the {entityLabel} transcription.
                This may take a few moments.
            </Text>
        )
    }

    if (isError || data?.error_message) {
        return (
            <Box flexDirection="row" alignItems="center" gap="xs">
                <Text color="content-error-default">
                    Unable to load {entityLabel} transcription.
                </Text>
                {isError && (
                    <button
                        onClick={() => refetch()}
                        type="button"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--content-accent-default)',
                        }}
                    >
                        Try again
                    </button>
                )}
            </Box>
        )
    }

    if (data?.transcription.length === 0) {
        return (
            <Text color="content-error-default">
                Audio quality of this {entityLabel} was too poor to generate an
                accurate transcription. Please check your microphone and
                internet quality to ensure clear audio.
            </Text>
        )
    }

    return (
        <>
            <div className={css.transcription}>
                <OverflowList
                    flexDirection="column"
                    gap="xs"
                    nonExpandedLineCount={7}
                >
                    {data?.transcription.map((reply, index) => (
                        <OverflowListItem
                            key={index}
                            className={css.overflowListItem}
                        >
                            <VoiceCallTranscriptionReply
                                speakerMapping={speakerMapping}
                                channel={reply.channel}
                                speaker={reply.speaker}
                                start={reply.start}
                                transcript={reply.transcript}
                            />
                        </OverflowListItem>
                    ))}
                    <OverflowListShowMore trailingSlot="arrow-chevron-down">
                        Show More
                    </OverflowListShowMore>
                    <OverflowListShowLess trailingSlot="arrow-chevron-up">
                        Show Less
                    </OverflowListShowLess>
                </OverflowList>
            </div>
        </>
    )
}
