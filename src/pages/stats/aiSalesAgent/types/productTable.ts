import { Product } from 'constants/integrations/types/shopify'
import { ProductTableKeys } from 'pages/stats/aiSalesAgent/constants'

export enum ProductTableValueFormat {
    Product = 'product',
    Number = 'number',
    Percentage = 'percentage',
}

export interface ProductTableContentCell {
    product: Product
    metrics: Partial<Record<ProductTableKeys, string | number>>
}

export interface ProductTableColumn {
    format: ProductTableValueFormat
    key: ProductTableKeys
    title: string
}
