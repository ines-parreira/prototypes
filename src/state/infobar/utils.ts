import hash from 'object-hash'

export type ActionData = {
    action_name: string
    user_id: string
    integration_id: string
    payload: {
        order_id?: number
        customer_id?: number
        comment_id?: number
    }
}

/**
 * Generate a hash identifying an action on a user for an integration id on a particular object (order, item, etc.)
 */
// TODO(customers-migration): update `user_id` when we update our REST API
export const actionButtonHashForData = ({
    action_name,
    user_id,
    integration_id,
    payload,
}: ActionData): string => {
    const identifier = [action_name, user_id, integration_id, hash(payload)]
    return identifier.join('-').replace(/\./g, '_')
}
