import hash from 'object-hash'

import {ActionPayload} from '../../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

export type ActionDataPayload =
    | {
          order_id?: Maybe<number>
          customer_id?: number
          comment_id?: number | string
          draft_order_id?: number
          draft_order_name?: string
          draft_order_invoice?: unknown
          facebook_comment?: string
          tags_list?: string
          instagram_comment?: string
          messenger_reply?: string
          instagram_direct_message_reply?: string
          from_ticket_message_id?: number
      }
    | ActionPayload

export type ActionData = {
    action_name: string
    action_label?: string
    action_id: string
    user_id: string
    ticket_id?: string
    integration_id: string
    payload: ActionDataPayload
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
}: Partial<ActionData>): string => {
    const identifier = [action_name, user_id, integration_id, hash(payload)]
    return identifier.join('-').replace(/\./g, '_')
}
