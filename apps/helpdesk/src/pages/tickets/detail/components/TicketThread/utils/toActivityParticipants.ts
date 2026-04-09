import type { User } from '@gorgias/helpdesk-queries'

export function toActivityParticipants(users: User[]) {
    return users
        .filter((user): user is User & { id: number } => user.id !== undefined)
        .map((user) => ({
            id: user.id,
            meta: {
                profile_picture_url: user.meta?.profile_picture_url ?? null,
            },
            name: user.name,
        }))
}
