import { Components } from 'rest_api/help_center_api/client.generated'

export type KnowledgeStatus = Components.Schemas.KnowledgeStatusDto

export type IngestionLog = Components.Schemas.IngestionLogDto

export type IngestedResourceWithArticleId = Omit<
    Components.Schemas.IngestedResourceListDataDto,
    'web_pages'
> & {
    web_pages: {
        url: string
        title: string
        pageType: string
    }[]
}

export type IngestedResourceWithArticleIdList = Omit<
    Components.Schemas.IngestedResourceListPageDto,
    'data'
> & {
    data: IngestedResourceWithArticleId[]
}

export type IngestedProduct = {
    account_id: number
    store_id: number
    store_name: string
    store_type: string
    source_knowledge: string
    scraping_id: string
    execution_id: string
    product_id: string
    product_name: string
    description: string
    shipping_policy: string
    return_policy: string
    sizing: string
    metadata: any[]
    web_pages: {
        url: string
        title: string
        page_type: string
    }[]
}
