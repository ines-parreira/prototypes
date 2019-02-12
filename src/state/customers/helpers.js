// @flow
import _trim from 'lodash/trim'

import {toImmutable, isImmutable} from '../../utils'

/**
 * Return name of customer
 * @param customer
 * @returns {string}
 */
export const getDisplayName = (customer: {name: string, id: string}): string => {
    customer = toImmutable(customer)

    // TODO toImmutable should always return a map.
    // if not an immutable map
    if (!isImmutable(customer)) {
        return customer || 'Unknown customer'
    }

    customer = customer.set('name', _trim(customer.get('name')))

    return customer.get('name') || customer.get('email') || (customer.get('id') ? `Customer #${customer.get('id')}` : 'Unknown customer')
}
