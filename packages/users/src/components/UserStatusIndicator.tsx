import { AvatarStatusIndicator } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

export type UserStatusIndicatorProps = {
    user: User
}

export function UserStatusIndicator({
    user,
}: UserStatusIndicatorProps): JSX.Element | null {
    const { onlineAgents } = useAgentsOnlineStatus()

    if (!user.id) return null

    const isOnline = Boolean(onlineAgents[user.id])

    return (
        <AvatarStatusIndicator
            color={isOnline ? 'green' : 'grey'}
            aria-label={isOnline ? 'Online' : 'Offline'}
        />
    )
}
