import { useState } from 'react'

import { useInterval } from '@repo/hooks'

import { Badge } from '@gorgias/axiom'
import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-types'

import { VoiceCall } from 'models/voiceCall/types'
import {
    getFormattedDurationEndedCall,
    getFormattedDurationOngoingCall,
    isCallTransfer,
    isFinalVoiceCallStatus,
} from 'models/voiceCall/utils'

interface TicketVoiceCallDurationProps {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallDuration({
    voiceCall,
}: TicketVoiceCallDurationProps) {
    const [ongoingCallDuration, setOngoingCallDuration] = useState(
        getFormattedDurationOngoingCall(voiceCall.started_datetime),
    )
    const isFinalStatus = isFinalVoiceCallStatus(voiceCall.status)

    useInterval(() => {
        if (isFinalStatus) {
            return
        }

        setOngoingCallDuration(
            getFormattedDurationOngoingCall(voiceCall.started_datetime),
        )
    }, 1000)

    const isTransfer = isCallTransfer(voiceCall)
    const isMissedInboundCall =
        voiceCall.direction === VoiceCallDirection.Inbound &&
        missedInboundCallStatuses.includes(voiceCall.status)

    if (
        !isTransfer &&
        (isMissedInboundCall || noDurationStatuses.includes(voiceCall.status))
    ) {
        return null
    }

    return (
        <Badge
            type={isFinalStatus ? 'light-grey' : 'light-success'}
            upperCase={false}
        >
            {isFinalStatus
                ? `DURATION: ${getFormattedDurationEndedCall(
                      voiceCall.duration,
                  )}`
                : `CONNECTED: ${ongoingCallDuration}`}
        </Badge>
    )
}

const missedInboundCallStatuses: VoiceCallStatus[] = [
    VoiceCallStatus.Canceled,
    VoiceCallStatus.Completed,
    VoiceCallStatus.Ending,
]

const noDurationStatuses: VoiceCallStatus[] = [
    VoiceCallStatus.InProgress,
    VoiceCallStatus.Initiated,
    VoiceCallStatus.Queued,
    VoiceCallStatus.Ringing,
    VoiceCallStatus.Failed,
    VoiceCallStatus.Busy,
    VoiceCallStatus.NoAnswer,
]
