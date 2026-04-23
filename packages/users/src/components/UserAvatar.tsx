import { Avatar } from '@gorgias/axiom'
import type { AvatarSize } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'

import { UserStatusIndicator } from './UserStatusIndicator'

export type UserAvatarProps = {
    user: User
    size?: AvatarSize
    withStatus?: boolean
}

export function UserAvatar({
    user,
    size,
    withStatus = true,
}: UserAvatarProps): JSX.Element | null {
    if (!user.id) return null

    const name = user.name ?? user.email ?? ''
    const url = user.meta?.profile_picture_url ?? ''

    return (
        <Avatar
            name={name}
            size={size}
            url={url}
            status={
                withStatus ? <UserStatusIndicator user={user} /> : undefined
            }
        />
    )
}
