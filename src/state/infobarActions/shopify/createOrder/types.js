// @flow

import {type Record} from 'immutable'

import type {
    DraftOrder,
    Product,
    ShippingLine,
} from '../../../../constants/integrations/types/shopify'

export type CreateOrderState = Record<{
    loading: boolean,
    loadingMessage: ?string,
    payload: ?$Shape<DraftOrder>,
    draftOrder: ?Record<DraftOrder>,
    products: Map<number, Record<Product>>,
    defaultShippingLine: ?Record<ShippingLine>,
}>
