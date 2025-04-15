import { useEffect, useState } from 'react'

import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { usePollStoreDomainIngestionLog } from '../hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from '../hooks/useSyncStoreDomain'
import AiAgentScrapedDomainContentLayout from './AiAgentScrapedDomainContentLayout'
import {
    CONTENT_TYPE,
    IngestionLogStatus,
    PAGINATED_ITEMS_PER_PAGE,
} from './constant'
import { usePaginatedProductIntegration } from './hooks/usePaginatedProductIntegration'
import ScrapedDomainContentView from './ScrapedDomainContentView'
import ScrapedDomainSelectedContent from './ScrapedDomainSelectedContent'
import { ScrapedContent } from './types'

type Props = {
    shopName: string
    helpCenterId: number
}

const AiAgentScrapedDomainProductsView = ({
    shopName,
    helpCenterId,
}: Props) => {
    const [syncStoreDomainStatus, setSyncStoreDomainStatus] = useState<
        string | null
    >(null)
    const [isOpened, setIsOpened] = useState(false)
    const [selectedProduct, setSelectedProduct] =
        useState<ScrapedContent | null>(null)

    const {
        storeDomain,
        storeUrl,
        storeDomainIngestionLog,
        isFetchLoading,
        syncTriggered,
        handleTriggerSync,
        handleOnSync,
        handleOnCancel,
    } = useSyncStoreDomain({ helpCenterId, shopName })

    const { syncIsPending } = usePollStoreDomainIngestionLog({
        helpCenterId,
        storeUrl,
        onStatusChange: setSyncStoreDomainStatus,
    })

    useEffect(() => {
        if (syncIsPending) {
            setSyncStoreDomainStatus(IngestionLogStatus.Pending)
        }
    }, [syncIsPending, setSyncStoreDomainStatus])

    const handleOnSelect = (content: ScrapedContent) => {
        setSelectedProduct(content)
        setIsOpened(true)
    }

    const handleOnClose = () => {
        setSelectedProduct(null)
        setIsOpened(false)
    }

    const { integrationId } = useShopifyIntegrationAndScope(shopName)

    const {
        itemsData: paginatedProducts,
        isLoading,
        searchTerm,
        setSearchTerm,
        fetchNext,
        fetchPrev,
        hasNextPage,
        hasPrevPage,
    } = usePaginatedProductIntegration({
        integrationId: integrationId || 0,
        initialParams: { limit: PAGINATED_ITEMS_PER_PAGE },
        enabled: !!integrationId,
    })

    const isDataLoading = isFetchLoading || isLoading

    return (
        <AiAgentScrapedDomainContentLayout
            shopName={shopName}
            storeDomainIngestionLog={storeDomainIngestionLog}
            storeDomain={storeDomain ?? null}
            storeUrl={storeUrl ?? null}
            isFetchLoading={isDataLoading}
            syncTriggered={syncTriggered}
            handleOnSync={handleOnSync}
            handleOnCancel={handleOnCancel}
            handleTriggerSync={handleTriggerSync}
            syncStoreDomainStatus={syncStoreDomainStatus}
            onBannerClose={() => setSyncStoreDomainStatus(null)}
        >
            <ScrapedDomainContentView
                searchValue={searchTerm}
                onSearch={setSearchTerm}
                isLoading={isDataLoading || syncIsPending}
                content={paginatedProducts}
                pageType={CONTENT_TYPE.PRODUCT}
                onSelect={handleOnSelect}
                hasNextItems={hasNextPage}
                hasPrevItems={hasPrevPage}
                fetchNextItems={fetchNext}
                fetchPrevItems={fetchPrev}
            />
            <ScrapedDomainSelectedContent
                selectedContent={selectedProduct}
                contentType={CONTENT_TYPE.PRODUCT}
                isOpened={isOpened}
                isLoading={isDataLoading || syncIsPending}
                onClose={handleOnClose}
            />
        </AiAgentScrapedDomainContentLayout>
    )
}

export default AiAgentScrapedDomainProductsView
