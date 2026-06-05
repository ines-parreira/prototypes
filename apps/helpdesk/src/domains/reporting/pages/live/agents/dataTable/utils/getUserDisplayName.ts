import type { User } from '@gorgias/helpdesk-queries'

export function getUserDisplayName(
    user: Pick<User, 'name' | 'firstname' | 'lastname' | 'email'>,
): string {
    const fullName =
        user.name?.trim() ||
        [user.firstname, user.lastname].filter(Boolean).join(' ').trim()

    return fullName || user.email || 'Unknown agent'
}
