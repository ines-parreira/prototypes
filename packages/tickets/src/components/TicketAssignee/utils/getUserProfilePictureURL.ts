import type { User } from '@gorgias/helpdesk-queries'

export function getUserProfilePictureURL(user: Pick<User, 'meta'> | null) {
    if (
        !user?.meta ||
        typeof user.meta !== 'object' ||
        !('profile_picture_url' in user.meta)
    ) {
        return undefined
    }

    const profilePictureUrl = user.meta.profile_picture_url

    return typeof profilePictureUrl === 'string' ? profilePictureUrl : undefined
}
