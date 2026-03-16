import { Avatar, AvatarStatusIndicator } from '@gorgias/axiom'

import {
    useAgentPhoneStatus,
    useAvailabilityStatusColor,
    useUserAvailability,
} from '../../hooks'
import type { AgentAvatarProps } from './types'

export const AgentAvatar = ({ userId, name, url }: AgentAvatarProps) => {
    const { agentPhoneUnavailabilityStatus } = useAgentPhoneStatus({
        userId,
    })

    const { availability } = useUserAvailability({
        userId,
    })

    const statusIndicatorColor = useAvailabilityStatusColor(
        availability?.user_status,
        agentPhoneUnavailabilityStatus?.id,
    )

    return (
        <div>
            <Avatar
                name={name}
                url={url}
                status={
                    statusIndicatorColor && (
                        <AvatarStatusIndicator color={statusIndicatorColor} />
                    )
                }
            />
        </div>
    )
}
