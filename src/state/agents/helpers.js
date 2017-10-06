// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'
type userType = Map<*,*>

export const isStaff = (user: userType): boolean => {
    if (!user) {
        return false
    }

    return !!user.get('roles', fromJS([])).find(role => role.get('name') === 'staff', null, false)
}

/**
 * Return highest role of user
 * Ex: Return 'admin' if user is 'admin' and 'agent'
 * @param user
 * @returns {any}
 */
export const getHighestRole = (user: userType): Map<*,*> => {
    if (!user) {
        return fromJS({})
    }

    const roles = user.get('roles', fromJS([])).map(role => role.get('name'))
    let role
    if (roles.includes('staff')) {
        role = 'staff'
    } else if (roles.includes('admin')) {
        role = 'admin'
    } else if (roles.includes('agent')) {
        role = 'agent'
    }

    if (role) {
        return fromJS({name: role})
    }

    return fromJS({})
}
