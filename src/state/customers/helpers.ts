import { Map } from 'immutable'
import _trim from 'lodash/trim'

import { isImmutable, toImmutable } from 'common/utils'
import { CustomerChannel } from 'models/customerChannel/types'
import { normalizeAddress } from 'tickets/common/utils'

/**
 * Return name of customer
 */
export const getDisplayName = (
    customer:
        | {
              name: string
              id: string
          }
        | Map<any, any>,
): Map<any, any> | string => {
    const immutableCustomer = toImmutable<Map<any, any>>(customer)

    // TODO toImmutable should always return a map.
    // if not an immutable map
    if (!isImmutable(immutableCustomer)) {
        return immutableCustomer || 'Unknown customer'
    }

    const formattedCustomer = immutableCustomer.set(
        'name',
        _trim(immutableCustomer.get('name')),
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
    const results: CustomerChannel[] = []

    channelsLists
        .filter((channels) => !!channels)
        .forEach((channels) => {
            channels.forEach((channel) => {
                const address = normalizeAddress(channel.address, channel.type)
                const result = results.find(
                    (result) =>
                        normalizeAddress(result.address, result.type) ===
                            address && result.type === channel.type,
                )

                if (!result) {
                    results.push(channel)
                }
            })
        })

    return results
}
