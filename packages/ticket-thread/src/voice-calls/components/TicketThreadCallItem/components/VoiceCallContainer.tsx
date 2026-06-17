import { Box, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
import type {
    TicketMessageUserOrCustomer,
    VoiceCall,
} from '@gorgias/helpdesk-queries'

import { MessageAvatar } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel'
import { MessageTimestamp } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import { formatPhoneNumberInternational } from '#voice-calls/models/phoneFormatting'
import { VoiceCallRecordingType } from '#voice-calls/models/types'
import { isFinalVoiceCallStatus } from '#voice-calls/models/utils'
import {
    VoiceCallRecordings,
    VoiceCallTranscriptions,
} from './VoiceCallRecordings'

import css from './VoiceCallContainer.less'

type VoiceCallContainerProps = {
    header: React.ReactNode
    callStatus: React.ReactNode
    voiceCall: VoiceCall
    directionIcon: IconName
    sender: TicketMessageUserOrCustomer
    renderMonitorCallButton?: (voiceCall: VoiceCall) => React.ReactNode
}

export function VoiceCallContainer({
    header,
    callStatus,
    voiceCall,
    sender,
    directionIcon,
    renderMonitorCallButton,
}: VoiceCallContainerProps) {
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
                        <MessageAvatar sender={sender} />
                        {header}
                        <Icon name={directionIcon} size="sm" />
                    </Box>
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        gap="xs"
                        className={css.meta}
                    >
                        <MessageChannel
                            channelIcon="phone"
                            channel="phone"
                            createdDatetime={voiceCall.created_datetime}
                            from={formatPhoneNumberInternational(
                                voiceCall.phone_number_source,
                            )}
                            to={formatPhoneNumberInternational(
                                voiceCall.phone_number_destination,
                            )}
                        />
                        <MessageTimestamp
                            createdDatetime={voiceCall.created_datetime}
                        />
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
