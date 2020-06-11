// @flow

import {INTEGRATION_DATA_ITEM_TYPES_MAP, INTEGRATION_TYPES_MAP} from '../constants/integration'
import * as Shopify from '../constants/integrations/shopify'

export type IntegrationType = $Values<typeof INTEGRATION_TYPES_MAP>

export type IntegrationDataItemType = $Values<typeof INTEGRATION_DATA_ITEM_TYPES_MAP>

export type Product = Shopify.Product
export type Variant = Shopify.Variant

export type IntegrationDataItem<T> = {
    id: number,
    integration_id: number,
    integration_type: IntegrationType,
    external_id: string,
    item_type: IntegrationDataItemType,
    search: string,
    data: T,
    created_datetime: string,
    updated_datetime: string,
    deleted_datetime: ?string,
}
