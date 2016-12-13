import {toImmutable, isImmutable} from '../../utils'

/**
 * Return name of user
 * @param user
 * @returns {string}
 */
export const getDisplayName = (user) => {
    user = toImmutable(user)

    // if not an immutable map
    if (!isImmutable(user)) {
        return user
    }

    return user.get('name') || user.get('email') || (user.get('id') ? `User #${user.get('id')}` : 'Unknown user')
}
