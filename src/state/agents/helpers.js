// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

import {USER_ROLES_ORDERED_BY_PRIVILEGES} from '../../config/user'

type userType = Map<*, *>

export const isStaff = (user: userType): boolean => {
    if (!user) {
        return false
    }

    return !!user.get('roles', fromJS([])).find((role) => role.get('name') === 'staff', null, false)
}

/**
 * Return highest role of user
 * Ex: Return 'admin' if user is 'admin' and 'agent'
 * @param user
 * @returns {any}
 */
export const getHighestRole = (user: userType): ?string => {
    if (!user) {
        return null
    }

    const userRoles = user.get('roles', fromJS([])).map((role) => role.get('name')).toJS()
    const roles = USER_ROLES_ORDERED_BY_PRIVILEGES.slice().reverse()

    for (let role of roles) {
        if (userRoles.includes(role)) {
            return role
        }
    }

    return null
}
