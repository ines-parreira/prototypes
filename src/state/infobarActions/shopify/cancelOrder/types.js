// @flow

import {type List, type Record} from 'immutable'

import type {
    CancelOrderPayload,
    LineItem,
    Refund,
} from '../../../../constants/integrations/types/shopify'

export type CancelOrderState = Record<{
    loading: boolean,
    loadingMessage: ?string,
    orderId: ?number,
    payload: ?$Shape<CancelOrderPayload>,
    lineItems: ?List<$Shape<LineItem>>,
    refund: Refund,
}>
