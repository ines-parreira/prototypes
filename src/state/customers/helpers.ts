import {Map} from 'immutable'
import _trim from 'lodash/trim'

import {TicketChannel} from '../../business/types/ticket'
import {CustomerChannel} from '../../models/customerChannel/types'
import {isImmutable, toImmutable} from '../../utils.js'

/**
 * Return name of customer
 */
export const getDisplayName = (customer: {
    name: string
    id: string
}): Map<any, any> | string => {
    const immutableCustomer = toImmutable(customer) as Map<any, any>

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
        (formattedCustomer.get('name') as string) ||
        (formattedCustomer.get('email') as string) ||
        (formattedCustomer.get('id')
            ? `Customer #${formattedCustomer.get('id') as number}`
            : 'Unknown customer')
    )
}

/**
 * Merge lists of channels. Drop duplicates to ensure unicity of email addresses (case insensitive).
 */
export const mergeChannels = (
    ...channelsLists: Array<Array<CustomerChannel>>
): Array<CustomerChannel> => {
    const results: {[key: string]: CustomerChannel} = {}

    channelsLists
        .filter((channels) => !!channels)
        .forEach((channels) => {
            channels.forEach((channel) => {
                const address =
                    channel.type === TicketChannel.Email
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
