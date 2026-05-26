import type { User } from '@gorgias/helpdesk-queries'

export function isAccountOwner(user: User): boolean {
    const accountOwnerId = window.GORGIAS_STATE?.currentAccount?.user_id
    return accountOwnerId != null && user.id === accountOwnerId
}
