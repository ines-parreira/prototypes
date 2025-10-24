import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import useAppSelector from 'hooks/useAppSelector'
import MonitorCallButton from 'pages/common/components/MonitorCallButton/MonitorCallButton'
import { getCurrentUser } from 'state/currentUser/selectors'

type MonitorCellProps = {
    voiceCall: VoiceCallSummary
}

export default function MonitorCell({ voiceCall }: MonitorCellProps) {
    const currentUser = useAppSelector(getCurrentUser)
    const currentUserId = currentUser.get('id')

    return (
        <MonitorCallButton
            voiceCallToMonitor={voiceCall}
            agentId={currentUserId}
        />
    )
}
