import {toImmutable, isImmutable} from '../../utils'
import _trim from 'lodash/trim'

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

    user = user.set('name', _trim(user.get('name')))

    return user.get('name') || user.get('email') || (user.get('id') ? `User #${user.get('id')}` : 'Unknown user')
}
