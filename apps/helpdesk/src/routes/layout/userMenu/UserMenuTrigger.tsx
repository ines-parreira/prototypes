import {
    AgentAvatar,
    useCustomAgentUnavailableStatusesFlag,
} from '@repo/agent-status'

import { Button } from '@gorgias/axiom'

import LegacyAvatar from 'pages/common/components/Avatar/Avatar'

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
                    <LegacyAvatar
                        name={userName}
                        url={profilePictureUrl}
                        shape="round"
                        size={24}
                    />
                )
            }
        />
    )
}
