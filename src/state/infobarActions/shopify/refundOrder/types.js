// @flow

import {type List, type Record} from 'immutable'

import * as Shopify from '../../../../constants/integrations/shopify'

export type RefundOrderState = Record<{
    loading: boolean,
    loadingMessage: ?string,
    orderId: ?number,
    payload: ?$Shape<Shopify.RefundOrderPayload>,
    lineItems: ?List<$Shape<Shopify.LineItem>>,
    refund: Shopify.Refund,
}>
