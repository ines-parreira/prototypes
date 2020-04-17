// @flow

import {type List, type Record} from 'immutable'

import * as Shopify from '../../../../constants/integrations/shopify'

export type CancelOrderState = Record<{
    initialized: boolean,
    loading: boolean,
    loadingMessage: ?string,
    orderId: ?number,
    payload: ?$Shape<Shopify.CancelOrderPayload>,
    lineItems: ?List<$Shape<Shopify.LineItem>>,
    refund: Shopify.Refund,
}>
