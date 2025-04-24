export const SCRAPPING_CONTENT = {
    QUESTIONS: 'Questions',
    PRODUCTS: 'Products',
}

export const CONTENT_TYPE = {
    QUESTION: 'Question',
    PRODUCT: 'Product',
}

export const PAGINATED_ITEMS_PER_PAGE = 15
export const MODAL_TRANSITION_DURATION_MS = 300

export enum IngestionLogStatus {
    Disabled = 'DISABLED',
    Pending = 'PENDING',
    Successful = 'SUCCESSFUL',
    Failed = 'FAILED',
}

export enum IngestionType {
    Url = 'url',
    Domain = 'domain',
}

export enum IngestedResourceStatus {
    Disabled = 'disabled',
    Enabled = 'enabled',
}

export const POLLING_INTERVAL = 60000

export const ECOMMERCE_TYPE = 'product'

export const ECOMMERCE_SOURCE = 'shopify'
