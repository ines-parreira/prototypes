// @flow
import hash from 'object-hash'

type dataType = {
    action_name: string,
    user_id: string,
    integration_id: string,
    payload: Object,
}

/**
 * Generate a hash identifying an action on a user for an integration id on a particular object (order, item, etc.)
 * @param action_name
 * @param user_id
 * @param integration_id
 * @param payload
 * @returns {string}
 */
// TODO(customers-migration): update `user_id` when we update our REST API
export const actionButtonHashForData = ({action_name, user_id, integration_id, payload}: dataType): string => {
    const identifier = [action_name, user_id, integration_id, hash(payload)]
    return identifier.join('-').replace(/\./g, '_')
}
