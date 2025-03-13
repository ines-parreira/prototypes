import { Product } from 'constants/integrations/types/shopify'
import { ProductTableKeys } from 'pages/stats/aiSalesAgent/constants'

export interface ProductTable extends Product {
    url?: string
}

export enum ProductTableValueFormat {
    Product = 'product',
    Number = 'number',
    Percentage = 'percentage',
}

export interface ProductTableContentCell {
    product: ProductTable
    metrics: Partial<Record<ProductTableKeys, string | number>>
}

export interface ProductTableColumn {
    format: ProductTableValueFormat
    key: ProductTableKeys
    title: string
}
