import { ProductTableColumn } from './types/productTable'

export const MIN_DATE_FOR_SALES_AGENT_STATS = '2025-02-21'

export const PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW = 'AI Agent Sales'

export const LINK_AI_SALES_AGENT_TEXT = 'AI Agent Sales'

export const GMV_OVERTIME_LABEL = 'Gmv Influenced Over Time'

export enum ProductTableKeys {
    Name = 'name',
    NumberOfRecommendations = 'recommendations',
    CTR = 'ctr',
    BTR = 'btr',
}

export const PRODUCT_TABLE_CELLS: ProductTableColumn[] = [
    {
        key: ProductTableKeys.Name,
        title: 'Product name',
    },
    {
        key: ProductTableKeys.NumberOfRecommendations,
        title: 'Times recommended',
        metricFormat: 'integer',
    },
    {
        key: ProductTableKeys.CTR,
        title: 'Click rate',
        metricFormat: 'decimal-to-percent',
    },
    {
        key: ProductTableKeys.BTR,
        title: 'Buy rate',
        metricFormat: 'decimal-to-percent',
    },
]

export const ProductTableConfig = PRODUCT_TABLE_CELLS.reduce(
    (obj, item) => Object.assign(obj, { [item.key]: item }),
    {} as Record<ProductTableKeys, ProductTableColumn>,
)
