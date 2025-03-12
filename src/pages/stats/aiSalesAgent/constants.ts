import {
    ProductTableColumn,
    ProductTableValueFormat,
} from './types/productTable'

export const PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW =
    'AI Agent Sales Overview'

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
        format: ProductTableValueFormat.Product,
    },
    {
        key: ProductTableKeys.NumberOfRecommendations,
        title: '# times recommended',
        format: ProductTableValueFormat.Number,
    },
    {
        key: ProductTableKeys.CTR,
        title: 'Click Rate',
        format: ProductTableValueFormat.Percentage,
    },
    {
        key: ProductTableKeys.BTR,
        title: 'Buy Rate',
        format: ProductTableValueFormat.Percentage,
    },
]

export const ProductTableConfig = PRODUCT_TABLE_CELLS.reduce(
    (obj, item) => Object.assign(obj, { [item.key]: item }),
    {} as Record<ProductTableKeys, ProductTableColumn>,
)
