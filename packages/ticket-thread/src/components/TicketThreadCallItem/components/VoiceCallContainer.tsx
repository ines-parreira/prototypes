import { useUserDateTimePreferences } from '@repo/preferences'
import {
    DateAndTimeFormatting,
    formatDatetime,
    getDateAndTimeFormat,
} from '@repo/utils'

import { Avatar, Box, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
import type { VoiceCall } from '@gorgias/helpdesk-queries'

import { VoiceCallRecordingType } from '../models/types'
import { isFinalVoiceCallStatus } from '../models/utils'
import {
    VoiceCallRecordings,
    VoiceCallTranscriptions,
} from './VoiceCallRecordings'

import css from './VoiceCallContainer.less'

type VoiceCallContainerProps = {
    header: React.ReactNode
    callStatus: React.ReactNode
    dateTime: string
    voiceCall: VoiceCall
    directionIcon: IconName
    avatarName: string
    renderMonitorCallButton?: (voiceCall: VoiceCall) => React.ReactNode
}

export function VoiceCallContainer({
    header,
    callStatus,
    dateTime,
    voiceCall,
    directionIcon,
    avatarName,
    renderMonitorCallButton,
}: VoiceCallContainerProps) {
    const { dateFormat, timeFormat } = useUserDateTimePreferences()
    const compactDateWithTimeFormat = getDateAndTimeFormat(
        dateFormat,
        timeFormat,
        DateAndTimeFormatting.CompactDateWithTime,
    )

    return (
        <div className={css.container}>
            <div className={css.callDetails}>
                <div className={css.row}>
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        gap="xs"
                        flexWrap="wrap"
                    >
                        <Avatar name={avatarName} size="md" />
                        {header}
                        <Icon name={directionIcon} size="sm" />
                    </Box>
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        gap="xs"
                        className={css.meta}
                    >
                        <Icon name="comm-phone" />
                        <Text
                            as="span"
                            size="sm"
                            color="content-neutral-secondary"
                        >
                            {formatDatetime(
                                dateTime,
                                compactDateWithTimeFormat,
                            )}
                        </Text>
                    </Box>
                </div>
                <div className={css.statusRow}>
                    {callStatus}
                    {renderMonitorCallButton &&
                        !isFinalVoiceCallStatus(voiceCall.status) &&
                        renderMonitorCallButton(voiceCall)}
                </div>
                {voiceCall.has_call_recording && (
                    <>
                        <div className={css.recordingCard}>
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                gap="xxs"
                            >
                                <Icon name="soundwave" size="sm" />
                                <Text as="span" variant="medium" size="md">
                                    Call recording
                                </Text>
                            </Box>
                            <VoiceCallRecordings
                                callId={voiceCall.id}
                                type={VoiceCallRecordingType.Recording}
                            />
                        </div>
                        <VoiceCallTranscriptions
                            callId={voiceCall.id}
                            type={VoiceCallRecordingType.Recording}
                        />
                    </>
                )}
                {voiceCall.has_voicemail && (
                    <>
                        <div className={css.recordingCard}>
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                gap="xxs"
                            >
                                <Icon name="soundwave" size="sm" />
                                <Text as="span" variant="medium" size="md">
                                    Voicemail left
                                </Text>
                            </Box>
                            <VoiceCallRecordings
                                callId={voiceCall.id}
                                type={VoiceCallRecordingType.Voicemail}
                            />
                        </div>
                        <VoiceCallTranscriptions
                            callId={voiceCall.id}
                            type={VoiceCallRecordingType.Voicemail}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
