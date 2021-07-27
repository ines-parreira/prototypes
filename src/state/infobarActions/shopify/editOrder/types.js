// @flow

import {type Record} from 'immutable'

import type {
    DraftOrder,
    Product,
    EditOrderPayload,
} from '../../../../constants/integrations/types/shopify'

export type EditOrderState = Record<{
    loading: boolean,
    loadingMessage: ?string,
    payload: ?$Shape<DraftOrder>,
    draftOrder: ?Record<DraftOrder>,
    products: Map<number, Record<Product>>,
    calculatedEditOrder: ?Record<EditOrderPayload>,
}>
