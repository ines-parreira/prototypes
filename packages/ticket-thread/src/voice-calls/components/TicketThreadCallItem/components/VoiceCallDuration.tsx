import { useState } from 'react'

import { useInterval } from '@gorgias/toolkit-react'

import { Text } from '@gorgias/axiom'
import type { VoiceCall } from '@gorgias/helpdesk-queries'

import {
    getFormattedDurationEndedCall,
    getFormattedDurationOngoingCall,
    isFinalVoiceCallStatus,
    shouldShowDuration,
} from '#voice-calls/models/utils'

type VoiceCallDurationProps = {
    voiceCall: VoiceCall
}

export function VoiceCallDuration({ voiceCall }: VoiceCallDurationProps) {
    const [ongoingCallDuration, setOngoingCallDuration] = useState(
        getFormattedDurationOngoingCall(voiceCall.started_datetime ?? ''),
    )
    const isFinalStatus = isFinalVoiceCallStatus(voiceCall.status)

    useInterval(() => {
        if (isFinalStatus) {
            return
        }

        setOngoingCallDuration(
            getFormattedDurationOngoingCall(voiceCall.started_datetime ?? ''),
        )
    }, 1000)

    if (
        !shouldShowDuration({
            ...voiceCall,
            last_answered_by_agent_id:
                voiceCall.last_answered_by_agent_id ?? null,
        })
    ) {
        return null
    }

    return (
        <Text as="span" color="content-neutral-secondary">
            {isFinalStatus
                ? `Duration ${getFormattedDurationEndedCall(voiceCall.duration ?? 0)}`
                : `Connected: ${ongoingCallDuration}`}
        </Text>
    )
}
