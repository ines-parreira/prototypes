import {fromJS} from 'immutable'

export const isStaff = (user) => {
    return !!user.get('roles', fromJS([])).find(role => role.get('name') === 'staff', null, false)
}

export const getHighestRole = (user) => {
    const roles = user.get('roles', fromJS([])).map(role => role.get('name'))
    let role
    if (roles.includes('staff')) {
        role = 'staff'
    } else if (roles.includes('admin')) {
        role = 'admin'
    } else if (roles.includes('agent')) {
        role = 'agent'
    }

    return role ? fromJS({name: role}) : fromJS({})
}
