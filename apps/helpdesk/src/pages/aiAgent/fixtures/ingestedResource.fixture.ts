import {
    IngestedResourceStatus,
    PAGINATED_ITEMS_PER_PAGE,
} from '../AiAgentScrapedDomainContent/constant'
import type {
    IngestedResourceWithArticleId,
    IngestedResourceWithArticleIdList,
} from '../AiAgentScrapedDomainContent/types'

export const getIngestedResourceFixture = (
    props?: Partial<IngestedResourceWithArticleId>,
): IngestedResourceWithArticleId => ({
    id: 11,
    title: 'Snippet Title',
    article_ingestion_log_id: 1,
    scraping_id: 'scraping_id',
    snippet_id: 'snippet_id',
    execution_id: 'execution_id',
    status: IngestedResourceStatus.Enabled,
    web_pages: [
        {
            url: 'https://example.com',
            title: 'Example Title',
            pageType: 'other',
        },
    ],
    article_id: 123,
    ...props,
})

export const getIngestedResourcesListResponse = ({
    page,
    itemCount,
}: {
    page: number
    itemCount: number
}): IngestedResourceWithArticleIdList => {
    const data = Array.from({ length: itemCount }, (_, i) => {
        const index = (page - 1) * itemCount + i
        const props = {
            id: index + 1,
            article_ingestion_log_id: 1,
            title: `Snippet Title ${index + 1}`,
            status: IngestedResourceStatus.Enabled,
            article_id: 100 + index,
        }
        return getIngestedResourceFixture(props)
    })
    return {
        object: 'list',
        data,
        meta: {
            page,
            per_page: PAGINATED_ITEMS_PER_PAGE,
            item_count: data.length,
            nb_pages: itemCount / PAGINATED_ITEMS_PER_PAGE,
            current_page: `page=${page}`,
            next_page:
                page < itemCount / PAGINATED_ITEMS_PER_PAGE
                    ? `page=${page + 1}`
                    : undefined,
        },
    }
}
