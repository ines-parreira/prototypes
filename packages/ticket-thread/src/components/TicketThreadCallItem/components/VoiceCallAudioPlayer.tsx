import { replaceAttachmentURL } from '@repo/utils'
import { useQueryClient } from '@tanstack/react-query'

import { Box, Icon, Text, toast } from '@gorgias/axiom'
import {
    queryKeys,
    useDeleteVoiceCallRecording,
} from '@gorgias/helpdesk-queries'
import type { VoiceCallRecording } from '@gorgias/helpdesk-types'

import {
    VoiceCallRecordingErrorCode,
    VoiceCallRecordingType,
} from '../models/types'
import { AudioPlayer } from './AudioPlayer'
import { VoiceCallAgentLabel } from './VoiceCallAgentLabel'

import css from './VoiceCallAudioPlayer.less'

type VoiceCallAudioPlayerProps = {
    audio: VoiceCallRecording
    type: VoiceCallRecordingType
}

const config = {
    [VoiceCallRecordingType.Recording]: {
        label: 'Call recording',
    },
    [VoiceCallRecordingType.Voicemail]: {
        label: 'Voicemail recording',
    },
}

export function VoiceCallAudioPlayer({
    audio,
    type,
}: VoiceCallAudioPlayerProps) {
    const queryClient = useQueryClient()
    const { mutate: deleteRecording } = useDeleteVoiceCallRecording({
        mutation: {
            onSuccess: () => {
                toast.success('Recording deleted successfully')
                queryClient.invalidateQueries({
                    queryKey: queryKeys.voiceCallRecordings.all(),
                })
            },
            onError: () => toast.error('Failed to delete recording'),
        },
    })

    if (!!audio.deleted_datetime) {
        return (
            <div className={css.deletedRecording}>
                <Text as="span" color="content-neutral-secondary">
                    {config[type].label} manually deleted
                </Text>
                {audio.deleted_by_user_id && (
                    <>
                        <Text as="span" color="content-neutral-secondary">
                            by
                        </Text>
                        <VoiceCallAgentLabel
                            agentId={audio.deleted_by_user_id}
                        />
                    </>
                )}
            </div>
        )
    }

    if (audio.error_code === VoiceCallRecordingErrorCode.RECORDING_IS_PRIVATE) {
        return (
            <Box flexDirection="row" alignItems="center" gap="xxs">
                <Icon name="triangle-warning" size="sm" />
                <Text>The call recording is not available.</Text>
            </Box>
        )
    }

    if (!audio.url) {
        return null
    }

    const recordingId = audio.id
    return (
        <AudioPlayer
            url={replaceAttachmentURL(audio.url)}
            initialDuration={audio.duration}
            onDelete={
                recordingId !== undefined
                    ? () => deleteRecording({ id: recordingId })
                    : undefined
            }
        />
    )
}
