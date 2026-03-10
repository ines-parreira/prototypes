export const SCRAPPING_CONTENT = {
    QUESTIONS: 'Questions',
    PRODUCTS: 'Products',
}

export const CONTENT_TYPE = {
    QUESTION: 'Question',
    PRODUCT: 'Product',
    FILE_QUESTION: 'File Question',
    URL_QUESTION: 'Url Question',
}

export enum HeaderType {
    Domain = 'domain',
    ExternalDocument = 'externalDocument',
    URL = 'url',
}

export { VisibilityStatusEnum as VisibilityStatus } from 'models/helpCenter/types'

export const PAGE_NAME = {
    SOURCE: 'knowledge-source',
    STORE_WEBSITE: 'store-website-content',
    URL: 'url-content',
    FILE: 'file-content',
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
