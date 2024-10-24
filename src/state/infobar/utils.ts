import hash from 'object-hash'

import {
    BigCommerceRefundOrderPayload,
    BigCommerceRefundType,
} from 'models/integration/types'
import {ActionPayload} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import {ShopifyActionType} from 'Widgets/modules/Shopify'

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
          note?: string
          instagram_direct_message_reply?: string
          bigcommerce_checkout_id?: Maybe<string>
          bigcommerce_order_payload?: Maybe<Record<string, any>>
          bigcommerce_draft_order_url?: Maybe<string>
          bigcommerce_order_id?: Maybe<number>
          bigcommerce_refund_payload?: Maybe<BigCommerceRefundOrderPayload>
          bigcommerce_new_order_status?: Maybe<string>
          bigcommerce_refund_type?: Maybe<BigCommerceRefundType>
          from_ticket_message_id?: number
          tracking_event_name?: ShopifyActionType
      }
    | ActionPayload

export type ActionData = {
    action_name: string
    action_label?: string
    action_id: string
    user_id?: string
    ticket_id?: string
    integration_id?: string
    app_id?: string | null
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
