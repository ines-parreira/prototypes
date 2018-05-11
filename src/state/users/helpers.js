// @flow
import {toImmutable, isImmutable} from '../../utils'
import _trim from 'lodash/trim'

/**
 * Return name of user
 * @param user
 * @returns {string}
 */
export const getDisplayName = (user: {name: string, id: string}): string => {
    user = toImmutable(user)

    // TODO toImmutable should always return a map.
    // if not an immutable map
    if (!isImmutable(user)) {
        return user || 'Unknown customer'
    }

    user = user.set('name', _trim(user.get('name')))

    return user.get('name') || user.get('email') || (user.get('id') ? `Customer #${user.get('id')}` : 'Unknown customer')
}
