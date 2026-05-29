import { AvatarStatusIndicator } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'

import { useIndicatorProps } from '../hooks/useIndicatorProps'
import { useUserStatus } from '../hooks/useUserStatus'

export type UserStatusIndicatorProps = {
    user: User
}

export function UserStatusIndicator({
    user,
}: UserStatusIndicatorProps): JSX.Element | null {
    const { status, availability } = useUserStatus(user.id)
    const indicatorProps = useIndicatorProps({
        isOnline: status === 'online',
        availabilityStatus: availability?.user_status,
    })

    if (!user.id) return null

    return <AvatarStatusIndicator {...indicatorProps} />
}
