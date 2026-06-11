import { UserRole } from '@repo/permissions'
import { useCurrentUserRole } from '@repo/users'

import { useGetUser } from '@gorgias/helpdesk-queries'
import type { VoiceCall } from '@gorgias/helpdesk-queries'

import type { User } from 'config/types/user'
import { getCallMonitorability } from 'hooks/integrations/phone/monitoring.utils'
import type { VoiceCall as LocalVoiceCall } from 'models/voiceCall/types'
import { getInCallAgentId } from 'models/voiceCall/utils'
import { MonitorCallButton } from 'pages/common/components/MonitorCallButton/MonitorCallButton'

type VoiceCallMonitorButtonProps = {
    voiceCall: VoiceCall
}

export function VoiceCallMonitorButton({
    voiceCall,
}: VoiceCallMonitorButtonProps) {
    const { hasRole, currentUser } = useCurrentUserRole()

    const localVoiceCall = voiceCall as unknown as LocalVoiceCall
    const inCallAgentId = getInCallAgentId(localVoiceCall)
    const { data: inCallAgentData } = useGetUser<{ data: User }>(
        inCallAgentId ?? 0,
        {
            query: { enabled: inCallAgentId != null },
        },
    )
    const inCallAgent = inCallAgentData?.data

    if (!currentUser?.id) return null
    if (!hasRole(UserRole.Agent)) return null

    const { isMonitorable, reason } = getCallMonitorability(
        localVoiceCall,
        currentUser.id,
        inCallAgent,
    )

    return (
        <MonitorCallButton
            voiceCallToMonitor={localVoiceCall}
            agentId={currentUser.id}
            isMonitorable={isMonitorable}
            reason={reason}
        />
    )
}
