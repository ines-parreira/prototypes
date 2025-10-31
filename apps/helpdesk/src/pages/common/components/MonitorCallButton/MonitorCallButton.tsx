import { useRef } from 'react'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getMonitoringParameters } from 'hooks/integrations/phone/monitoring.utils'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { VoiceCall } from 'models/voiceCall/types'
import { isCallBeingMonitored } from 'models/voiceCall/utils'

type MonitorCallButtonProps = {
    voiceCallToMonitor: VoiceCall | VoiceCallSummary
    agentId: number
    isMonitorable?: boolean
    reason?: string
}

export default function MonitorCallButton({
    voiceCallToMonitor,
    agentId,
    isMonitorable = true,
    reason,
}: MonitorCallButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const { makeMonitoringCall } = useMonitoringCall()

    if (isCallBeingMonitored(voiceCallToMonitor, agentId)) {
        return <span>Listening...</span>
    }

    const { callSidToMonitor, monitoringExtraParams } =
        getMonitoringParameters(voiceCallToMonitor)

    return (
        <>
            <Button
                ref={buttonRef}
                variant="tertiary"
                size="sm"
                leadingSlot="headset_mic"
                isDisabled={!isMonitorable}
                onClick={() =>
                    makeMonitoringCall(
                        callSidToMonitor,
                        agentId,
                        monitoringExtraParams,
                    )
                }
            >
                Listen
            </Button>
            {reason && <Tooltip target={buttonRef}>{reason}</Tooltip>}
        </>
    )
}
