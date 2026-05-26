import { AvatarStatusIndicator } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'

import { useUserStatus } from '../hooks/useUserStatus'

export type UserStatusIndicatorProps = {
    user: User
}

export function UserStatusIndicator({
    user,
}: UserStatusIndicatorProps): JSX.Element | null {
    const { status } = useUserStatus(user.id)

    if (!user.id) return null

    const isOnline = status === 'online'

    return (
        <AvatarStatusIndicator
            color={isOnline ? 'green' : 'grey'}
            aria-label={isOnline ? 'Online' : 'Offline'}
        />
    )
}
