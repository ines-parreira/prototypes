import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getCallMonitorability } from 'hooks/integrations/phone/monitoring.utils'
import useAppSelector from 'hooks/useAppSelector'
import MonitorCallButton from 'pages/common/components/MonitorCallButton/MonitorCallButton'
import { getAgentJS } from 'state/agents/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

type MonitorCellProps = {
    voiceCall: VoiceCallSummary
}

export default function MonitorCell({ voiceCall }: MonitorCellProps) {
    const currentUserId = useAppSelector(getCurrentUser).get('id')
    const inCallAgent = useAppSelector(
        getAgentJS(voiceCall.agentId ?? undefined),
    )

    return (
        <MonitorCallButton
            voiceCallToMonitor={voiceCall}
            agentId={currentUserId}
            {...getCallMonitorability(voiceCall, currentUserId, inCallAgent)}
        />
    )
}
