import React, {useState} from 'react'
import {useInterval} from 'react-use'
import {VoiceCall, VoiceCallStatus} from 'models/voiceCall/types'
import {Badge} from 'gorgias-design-system/Badge/Badge'
import {
    getFormattedDurationEndedCall,
    getFormattedDurationOngoingCall,
    isFinalVoiceCallStatus,
} from 'models/voiceCall/utils'

interface TicketVoiceCallDurationProps {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallDuration({
    voiceCall,
}: TicketVoiceCallDurationProps) {
    const [ongoingCallDuration, setOngoingCallDuration] = useState(
        getFormattedDurationOngoingCall(voiceCall)
    )
    const isFinalStatus = isFinalVoiceCallStatus(voiceCall.status)

    useInterval(() => {
        if (isFinalStatus) {
            return
        }

        setOngoingCallDuration(getFormattedDurationOngoingCall(voiceCall))
    }, 1000)

    const isMissedInboundCall =
        voiceCall.direction === 'inbound' &&
        [
            VoiceCallStatus.Canceled,
            VoiceCallStatus.Completed,
            VoiceCallStatus.Ending,
        ].includes(voiceCall.status) &&
        !voiceCall.last_answered_by_agent_id

    if (
        isMissedInboundCall ||
        [
            VoiceCallStatus.InProgress,
            VoiceCallStatus.Initiated,
            VoiceCallStatus.Queued,
            VoiceCallStatus.Ringing,
            VoiceCallStatus.Failed,
            VoiceCallStatus.Busy,
            VoiceCallStatus.NoAnswer,
        ].includes(voiceCall.status)
    ) {
        return null
    }

    return (
        <Badge
            color={isFinalStatus ? 'accessoryGrey' : 'accessoryGreen'}
            label={
                isFinalStatus
                    ? `duration: ${getFormattedDurationEndedCall(
                          voiceCall.duration
                      )}`
                    : `connected: ${ongoingCallDuration}`
            }
        />
    )
}
