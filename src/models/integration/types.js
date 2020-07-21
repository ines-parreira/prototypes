// @flow
import {
    INTEGRATION_DATA_ITEM_TYPES_MAP,
    INTEGRATION_TYPES_MAP,
} from '../../constants/integration'
import type {
    Product as IntegrationProduct,
    Variant as IntegrationVariant,
} from '../../constants/integrations/types/shopify'

export type IntegrationType = $Values<typeof INTEGRATION_TYPES_MAP>

export type IntegrationDataItemType = $Values<
    typeof INTEGRATION_DATA_ITEM_TYPES_MAP
>

export type Product = IntegrationProduct
export type Variant = IntegrationVariant

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
