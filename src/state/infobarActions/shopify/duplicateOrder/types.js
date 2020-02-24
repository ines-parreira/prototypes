// @flow

import {type Record} from 'immutable'

import * as Shopify from '../../../../constants/integrations/shopify'

export type DuplicateOrderState = Record<{
    loading: boolean,
    payload: ?$Shape<Shopify.DraftOrder>,
    draftOrder: ?Record<Shopify.DraftOrder>,
    products: Map<number, Record<Shopify.Product>>,
    defaultShippingLine: ?Record<Shopify.ShippingLine>,
}>
