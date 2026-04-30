import {
    AgentAvatar,
    useCustomAgentUnavailableStatusesFlag,
} from '@repo/agent-status'

import { Avatar, AvatarStatusIndicator, Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { isAvailable as getIsAvailable } from 'state/currentUser/selectors'

interface UserMenuTriggerProps {
    userId: number
    userName: string
    profilePictureUrl?: string | null
}

export function UserMenuTrigger({
    userId,
    userName,
    profilePictureUrl,
}: UserMenuTriggerProps) {
    const isAgentUnavailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    const isAvailable = useAppSelector(getIsAvailable)

    return (
        <Button
            variant="tertiary"
            data-candu-id="navbar-user-menu"
            icon={
                isAgentUnavailabilityEnabled ? (
                    <AgentAvatar
                        userId={userId}
                        name={userName}
                        url={profilePictureUrl || undefined}
                    />
                ) : (
                    <Avatar
                        name={userName}
                        status={
                            <AvatarStatusIndicator
                                color={isAvailable ? 'green' : 'orange'}
                            />
                        }
                        url={profilePictureUrl || undefined}
                    />
                )
            }
        />
    )
}
