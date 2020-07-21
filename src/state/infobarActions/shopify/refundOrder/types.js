// @flow

import {type List, type Record} from 'immutable'

import type {
    RefundOrderPayload,
    LineItem,
    Refund,
} from '../../../../constants/integrations/types/shopify'

export type RefundOrderState = Record<{
    loading: boolean,
    loadingMessage: ?string,
    orderId: ?number,
    payload: ?$Shape<RefundOrderPayload>,
    lineItems: ?List<$Shape<LineItem>>,
    refund: Refund,
}>
