import { LegacyButton as Button } from '@gorgias/axiom'

import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getMonitoringParameters } from 'hooks/integrations/phone/monitoring.utils'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { VoiceCall } from 'models/voiceCall/types'

type MonitorCallButtonProps = {
    voiceCallToMonitor: VoiceCall | VoiceCallSummary
    agentId: number
}

export default function MonitorCallButton({
    voiceCallToMonitor,
    agentId,
}: MonitorCallButtonProps) {
    const { makeMonitoringCall } = useMonitoringCall()

    const { callSidToMonitor, monitoringExtraParams } =
        getMonitoringParameters(voiceCallToMonitor)

    return (
        <Button
            fillStyle="ghost"
            intent="primary"
            size="small"
            leadingIcon={<i className="material-icons">headset_mic</i>}
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
    )
}
