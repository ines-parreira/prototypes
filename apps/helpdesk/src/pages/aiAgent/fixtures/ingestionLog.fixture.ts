import {
    IngestionLogStatus,
    IngestionType,
} from '../AiAgentScrapedDomainContent/constant'
import { IngestionLog } from '../AiAgentScrapedDomainContent/types'

export const getIngestionLogFixture = (
    props?: Partial<IngestionLog>,
): IngestionLog => ({
    created_datetime: new Date().toISOString(),
    help_center_id: 1,
    article_ids: [],
    raw_text: null,
    dataset_id: 'test12345',
    scraping_id: null,
    latest_sync: new Date().toISOString(),
    id: 1,
    url: 'https://test-shop.com',
    domain: 'test-shop.com',
    source: IngestionType.Domain,
    status: IngestionLogStatus.Pending,
    meta: {
        'x-gorgias-domain': null,
        'x-execution-id': null,
    },
    ...props,
})
