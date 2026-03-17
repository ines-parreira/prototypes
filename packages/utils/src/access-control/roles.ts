import type { User } from '@gorgias/helpdesk-types'

export enum UserRole {
    ObserverAgent = 'observer-agent',
    LiteAgent = 'lite-agent',
    BasicAgent = 'basic-agent',
    Agent = 'agent',
    Admin = 'admin',
    Bot = 'bot',
    GorgiasAgent = 'internal-agent',
}

export const USER_ROLES_ORDERED_BY_PRIVILEGES: Readonly<UserRole[]> =
    Object.freeze([
        UserRole.ObserverAgent,
        UserRole.LiteAgent,
        UserRole.BasicAgent,
        UserRole.Agent,
        UserRole.Admin,
        UserRole.GorgiasAgent,
    ])

export const USER_ROLES = USER_ROLES_ORDERED_BY_PRIVILEGES

// Check if a user has a role
export function hasRole<T extends Pick<User, 'role'>>(
    user: T,
    requiredRole: UserRole,
): boolean {
    if (!user.role) {
        return false
    }
    const userRole = user.role.name as UserRole
    return (
        USER_ROLES_ORDERED_BY_PRIVILEGES.indexOf(userRole) >=
        USER_ROLES_ORDERED_BY_PRIVILEGES.indexOf(requiredRole)
    )
}

/**
 * Test if user has agent privileges
 */
export const hasAgentPrivileges = <T extends Pick<User, 'role'>>(
    user: T,
): boolean => {
    return hasRole(user, UserRole.Agent)
}

/**
 * Test if user is admin
 */
export const isAdmin = <T extends Pick<User, 'role'>>(user: T): boolean => {
    return hasRole(user, UserRole.Admin)
}

/**
 * Including this alias for clarity, since `UserRole.Agent` is actually team lead
 */
export const isTeamLead = hasAgentPrivileges

export const filterUserByRole = <T extends { requiredRole?: UserRole }>(
    currentUser: Pick<User, 'role'> | undefined,
    item: T,
): boolean => {
    if (!item.requiredRole) {
        return true
    }
    if (!currentUser) {
        return false
    }
    return hasRole(currentUser, item.requiredRole)
}
