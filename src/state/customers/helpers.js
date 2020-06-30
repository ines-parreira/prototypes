// @flow
import _trim from 'lodash/trim'

import {isImmutable, toImmutable} from '../../utils'
import type {CustomerChannel} from '../../models/customerChannel'
import {EMAIL_CHANNEL} from '../../config/ticket'

/**
 * Return name of customer
 * @param customer
 * @returns {string}
 */
export const getDisplayName = (customer: {
    name: string,
    id: string,
}): string => {
    const immutableCustomer = toImmutable(customer)

    // TODO toImmutable should always return a map.
    // if not an immutable map
    if (!isImmutable(immutableCustomer)) {
        return immutableCustomer || 'Unknown customer'
    }

    const formattedCustomer = immutableCustomer.set(
        'name',
        _trim(immutableCustomer.get('name'))
    )

    return (
        formattedCustomer.get('name') ||
        formattedCustomer.get('email') ||
        (formattedCustomer.get('id')
            ? `Customer #${formattedCustomer.get('id')}`
            : 'Unknown customer')
    )
}

/**
 * Merge lists of channels. Drop duplicates to ensure unicity of email addresses (case insensitive).
 */
export const mergeChannels = (
    ...channelsLists: Array<Array<CustomerChannel>>
): Array<CustomerChannel> => {
    const results = {}

    channelsLists
        .filter((channels) => !!channels)
        .forEach((channels) => {
            channels.forEach((channel) => {
                const address =
                    channel.type === EMAIL_CHANNEL
                        ? channel.address.toLowerCase()
                        : channel.address
                const result = results[address]

                if (!result || result.address !== address) {
                    results[address] = channel
                }
            })
        })

    return Object.keys(results).map((address) => results[address])
}
