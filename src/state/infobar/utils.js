// @flow
import _keys from 'lodash/keys'

type dataType = {
    action_name: string,
    user_id: string,
    integration_id: string,
    payload: {}
}

/**
 * Generate a hash identifying an action on a user for an integration id on a particular object (order, item, etc.)
 * @param action_name
 * @param user_id
 * @param integration_id
 * @param payload
 * @returns {*}
 */
// TODO(customers-migration): update `user_id` when we update our REST API
export const actionButtonHashForData = ({action_name, user_id, integration_id, payload}: dataType): string => {
    let identifier = [
        action_name, // eslint-disable-line
        user_id, // eslint-disable-line
        integration_id, // eslint-disable-line
    ]

    // add payload data in keys alphabetical order (same order each time we pass the same object)
    // reminder: object keys don't have a fixed order in JS
    const orderedPayload = _keys(payload).sort().map((key) => payload[key])

    identifier = identifier.concat(orderedPayload)

    return identifier.join('-').replace(/\./g, '_')
}
