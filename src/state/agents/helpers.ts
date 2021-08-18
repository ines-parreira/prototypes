import {fromJS, Map, List} from 'immutable'

import {UserRole} from '../../config/types/user'

/**
 * Return highest role of user
 * Ex: Return 'admin' if user is 'admin' and 'agent'
 */
export const getHighestRole = (user: Map<any, any>): Maybe<UserRole> => {
    if (!user) {
        return null
    }

    const userRoles: string[] = ((user.get('roles', fromJS([])) as List<
        any
    >).map((role: Map<any, any>) => role.get('name') as Maybe<string>) as List<
        any
    >).toJS()
    const roles = Object.values(UserRole).slice().reverse()

    for (const role of roles) {
        if (userRoles.includes(role)) {
            return role
        }
    }

    return null
}
